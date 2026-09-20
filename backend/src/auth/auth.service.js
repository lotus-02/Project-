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

        const role = await tx.role.create({
            data: {
                name: "ADMIN",
                description: "Tenant administrator",
                tenantId: tenant.id
            }
        });

        // Fetch all permissions and assign to ADMIN role
        const permissions = await tx.permission.findMany();
        for (const permission of permissions) {
            await tx.rolePermission.create({
                data: {
                    roleId: role.id,
                    permissionId: permission.id
                }
            });
        }

        const user = await tx.user.create({
            data: {
                name,
                email,
                passwordHash,
                tenantId: tenant.id,
                roleId: role.id
            }
        });

        return {
            tenant,
            user,
            role
        };
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

module.exports = {
    registerOrganization,
    login,
    refreshAccessToken,
    getMe
};