const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const socket = require("../socket");
const { logActivity } = require("./activity.service");

const getUsersByTenant = async (tenantId) => {
    return prisma.user.findMany({
        where: { tenantId },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
            role: {
                select: { id: true, name: true, description: true }
            },
            _count: {
                select: { assignedTasks: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
};

const createUser = async ({ tenantId, currentUserId, name, email, password, roleId }) => {
    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if (existing) {
        throw new Error("User with this email already exists");
    }

    // Verify role belongs to tenant
    const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId }
    });

    if (!role) {
        throw new Error("Specified role not found in your organization");
    }

    const passwordHash = await bcrypt.hash(password || "DefaultPassword123!", 12);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            tenantId,
            roleId
        },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: { select: { id: true, name: true } },
            createdAt: true
        }
    });

    await logActivity({
        action: "USER_INVITED",
        details: `User "${name}" (${email}) was added as ${role.name}`,
        entityType: "USER",
        entityId: newUser.id,
        userId: currentUserId,
        tenantId
    });

    socket.emitToTenant(tenantId, "user:created", newUser);

    return newUser;
};

const updateUser = async ({ tenantId, currentUserId, targetUserId, name, roleId, status }) => {
    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId }
    });

    if (!user) {
        return null;
    }

    if (roleId) {
        const role = await prisma.role.findFirst({
            where: { id: roleId, tenantId }
        });
        if (!role) throw new Error("Role not found");
    }

    const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
            ...(name && { name }),
            ...(roleId && { roleId }),
            ...(status && { status })
        },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: { select: { id: true, name: true } }
        }
    });

    await logActivity({
        action: "USER_UPDATED",
        details: `User "${updated.name}" details updated`,
        entityType: "USER",
        entityId: targetUserId,
        userId: currentUserId,
        tenantId
    });

    socket.emitToTenant(tenantId, "user:updated", updated);

    return updated;
};

const deleteUser = async ({ tenantId, currentUserId, targetUserId }) => {
    if (currentUserId === targetUserId) {
        throw new Error("You cannot delete your own account");
    }

    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId }
    });

    if (!user) {
        return null;
    }

    await prisma.user.delete({
        where: { id: targetUserId }
    });

    await logActivity({
        action: "USER_REMOVED",
        details: `User "${user.name}" (${user.email}) was removed`,
        entityType: "USER",
        entityId: targetUserId,
        userId: currentUserId,
        tenantId
    });

    socket.emitToTenant(tenantId, "user:deleted", { id: targetUserId });

    return true;
};

module.exports = {
    getUsersByTenant,
    createUser,
    updateUser,
    deleteUser
};
