const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/jwt");

const registerOrganization = async ({
    organizationName,
    name,
    email,
    password
}) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name: organizationName,
                slug: organizationName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
            }
        });

        // Fetch all global permissions
        const allPermissions = await tx.permission.findMany();
        const permMap = {};
        for (const p of allPermissions) permMap[p.name] = p.id;

        // Define 4 default roles with their permission sets
        const roleDefs = [
            {
                name: "ADMIN",
                description: "Full access — tenant administrator",
                perms: Object.keys(permMap)  // all permissions
            },
            {
                name: "MANAGER",
                description: "Manage projects, tasks and view team",
                perms: [
                    "project:create", "project:read", "project:update",
                    "task:create", "task:read", "task:update", "task:delete",
                    "user:read", "analytics:read"
                ]
            },
            {
                name: "MEMBER",
                description: "Work on assigned tasks and view projects",
                perms: [
                    "project:read",
                    "task:create", "task:read", "task:update",
                    "user:read", "analytics:read"
                ]
            },
            {
                name: "VIEWER",
                description: "Read-only access to projects and tasks",
                perms: [
                    "project:read", "task:read", "user:read", "analytics:read"
                ]
            }
        ];

        const createdRoles = {};
        for (const def of roleDefs) {
            const role = await tx.role.create({
                data: {
                    name: def.name,
                    description: def.description,
                    tenantId: tenant.id
                }
            });
            createdRoles[def.name] = role;

            for (const permName of def.perms) {
                const permId = permMap[permName];
                if (permId) {
                    await tx.rolePermission.create({
                        data: { roleId: role.id, permissionId: permId }
                    });
                }
            }
        }

        const adminRole = createdRoles["ADMIN"];

        const user = await tx.user.create({
            data: {
                name,
                email,
                passwordHash,
                tenantId: tenant.id,
                roleId: adminRole.id
            }
        });

        return { tenant, user, role: adminRole };
    });

    const accessToken = generateAccessToken({
        userId: result.user.id,
        tenantId: result.user.tenantId,
        roleId: result.user.roleId
    });

    const refreshToken = generateRefreshToken({
        userId: result.user.id,
        tenantId: result.user.tenantId,
        roleId: result.user.roleId
    });

    return {
        tenant: result.tenant,
        user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            tenantId: result.user.tenantId,
            roleId: result.user.roleId,
            status: result.user.status,
            role: result.role.name
        },
        accessToken,
        refreshToken
    };
};

const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            },
            tenant: true
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
        throw new Error("User account is inactive");
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId
    });

    const permissions = user.role?.permissions?.map(p => p.permission.name) || [];

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            tenantId: user.tenantId,
            roleId: user.roleId,
            role: user.role?.name,
            status: user.status,
            tenantName: user.tenant?.name,
            permissions
        },
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    let decoded;
    try {
        const secret = process.env.JWT_REFRESH_SECRET || "default_dev_refresh_secret_456!";
        decoded = jwt.verify(refreshToken, secret);
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId
        }
    });

    if (!user || user.status !== "active") {
        throw new Error("User account is inactive or not found");
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId
    });

    return {
        accessToken
    };
};

const getMe = async (userId, tenantId) => {
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            tenantId
        },
        include: {
            tenant: true,
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const permissions = user.role?.permissions?.map(p => p.permission.name) || [];

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
        roleId: user.roleId,
        role: user.role?.name,
        status: user.status,
        permissions
    };
};

const joinOrganization = async ({ tenantId, roleId, name, email, password }) => {
    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already registered");

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error("Organization not found");

    // Validate role belongs to this tenant and is not ADMIN
    const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId }
    });
    if (!role) throw new Error("Invalid role for this organization");
    if (role.name === "ADMIN") throw new Error("Cannot self-register as ADMIN");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { name, email, passwordHash, tenantId, roleId }
    });

    const accessToken  = generateAccessToken({ userId: user.id, tenantId, roleId });
    const refreshToken = generateRefreshToken({ userId: user.id, tenantId, roleId });

    return {
        tenant: { id: tenant.id, name: tenant.name },
        user: {
            id: user.id, name: user.name, email: user.email,
            tenantId, roleId, status: user.status, role: role.name,
            tenantName: tenant.name
        },
        accessToken,
        refreshToken
    };
};

module.exports = {
    registerOrganization,
    joinOrganization,
    login,
    refreshAccessToken,
    getMe
};