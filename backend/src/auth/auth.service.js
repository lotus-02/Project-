// Request
//    ↓
// Check email
//    ↓
// Already exists?
//    ├── Yes → Error
//    └── No
//         ↓
//    Hash password
//         ↓
//    Save user
//         ↓
//    Return user
const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

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
            user
        };
    });

    return {
    tenant: result.tenant,
    user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        tenantId: result.user.tenantId,
        roleId: result.user.roleId,
        status: result.user.status
    }
};
};
const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email }
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

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            tenantId: user.tenantId,
            roleId: user.roleId,
            status: user.status
        }
    };
};

module.exports = {
    registerOrganization,
    login
};