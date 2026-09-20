const prisma = require("../config/prisma");

const getRolesByTenant = async (tenantId) => {
    return prisma.role.findMany({
        where: { tenantId },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            },
            _count: {
                select: { users: true }
            }
        },
        orderBy: { name: "asc" }
    });
};

const createRole = async ({ tenantId, name, description, permissionIds = [] }) => {
    const existing = await prisma.role.findFirst({
        where: { tenantId, name }
    });

    if (existing) {
        throw new Error("A role with this name already exists in your organization");
    }

    const role = await prisma.role.create({
        data: {
            name,
            description,
            tenantId,
            permissions: {
                create: permissionIds.map((permissionId) => ({
                    permissionId
                }))
            }
        },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });

    return role;
};

const updateRolePermissions = async ({ tenantId, roleId, permissionIds = [] }) => {
    const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId }
    });

    if (!role) {
        throw new Error("Role not found");
    }

    await prisma.rolePermission.deleteMany({
        where: { roleId }
    });

    for (const permissionId of permissionIds) {
        await prisma.rolePermission.create({
            data: { roleId, permissionId }
        });
    }

    return prisma.role.findUnique({
        where: { id: roleId },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });
};

module.exports = {
    getRolesByTenant,
    createRole,
    updateRolePermissions
};
