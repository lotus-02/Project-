const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const socket = require("../socket");
const { logActivity } = require("./activity.service");

const getUsersByTenant = async (tenantId) => {
    const users = await prisma.user.findMany({
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
            assignedTasks: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    estimatedHours: true,
                    actualHours: true,
                    dueDate: true,
                    createdAt: true,
                    updatedAt: true,
                    project: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { updatedAt: "desc" }
            },
            activities: {
                select: {
                    id: true,
                    action: true,
                    details: true,
                    entityType: true,
                    entityId: true,
                    createdAt: true
                },
                orderBy: { createdAt: "desc" },
                take: 15
            },
            _count: {
                select: { assignedTasks: true, comments: true, activities: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return users.map((user) => {
        const tasks = user.assignedTasks || [];
        const doneTasks = tasks.filter((t) => t.status === "DONE");
        const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW");
        const todoTasks = tasks.filter((t) => t.status === "TODO");
        const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
        const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

        return {
            ...user,
            workStats: {
                totalTasks: tasks.length,
                doneCount: doneTasks.length,
                inProgressCount: inProgressTasks.length,
                todoCount: todoTasks.length,
                completionRate: tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0,
                totalEstimatedHours,
                totalActualHours,
                activitiesCount: user._count?.activities || 0,
                commentsCount: user._count?.comments || 0
            }
        };
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

    // Role Hierarchy: Only an ADMIN can create another ADMIN
    if (role.name === "ADMIN") {
        const currentUser = await prisma.user.findFirst({
            where: { id: currentUserId, tenantId },
            include: { role: true }
        });
        if (currentUser?.role?.name !== "ADMIN") {
            throw new Error("Permission denied: Only Administrators can create an Admin account");
        }
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

    const currentUser = await prisma.user.findFirst({
        where: { id: currentUserId, tenantId },
        include: { role: true }
    });

    const targetUser = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId },
        include: { role: true }
    });

    if (!targetUser) {
        return null;
    }

    // Role Hierarchy Rule 1: A Manager or non-admin cannot delete an Admin
    if (targetUser.role?.name === "ADMIN" && currentUser?.role?.name !== "ADMIN") {
        throw new Error("Permission denied: Managers cannot delete an Administrator");
    }

    // Role Hierarchy Rule 2: A Manager cannot delete other Managers
    if (currentUser?.role?.name === "MANAGER" && targetUser.role?.name === "MANAGER") {
        throw new Error("Permission denied: Managers cannot delete other Managers");
    }

    // Role Hierarchy Rule 3: The organization's sole Administrator cannot be deleted
    if (targetUser.role?.name === "ADMIN") {
        const adminCount = await prisma.user.count({
            where: {
                tenantId,
                role: { name: "ADMIN" }
            }
        });
        if (adminCount <= 1) {
            throw new Error("Cannot delete the only Administrator of the organization");
        }
    }

    await prisma.user.delete({
        where: { id: targetUserId }
    });

    await logActivity({
        action: "USER_REMOVED",
        details: `User "${targetUser.name}" (${targetUser.email}) was removed`,
        entityType: "USER",
        entityId: targetUserId,
        userId: currentUserId,
        tenantId
    });

    socket.emitToTenant(tenantId, "user:deleted", { id: targetUserId });

    return true;
};

const getUserWorkProfile = async ({ tenantId, targetUserId }) => {
    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
            role: { select: { id: true, name: true, description: true } },
            assignedTasks: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    estimatedHours: true,
                    actualHours: true,
                    dueDate: true,
                    createdAt: true,
                    updatedAt: true,
                    project: { select: { id: true, name: true, priority: true } }
                },
                orderBy: { updatedAt: "desc" }
            },
            activities: {
                select: {
                    id: true,
                    action: true,
                    details: true,
                    entityType: true,
                    entityId: true,
                    createdAt: true
                },
                orderBy: { createdAt: "desc" },
                take: 30
            },
            _count: {
                select: { assignedTasks: true, comments: true, activities: true }
            }
        }
    });

    if (!user) return null;

    const tasks = user.assignedTasks || [];
    const doneTasks = tasks.filter((t) => t.status === "DONE");
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW");
    const todoTasks = tasks.filter((t) => t.status === "TODO");

    return {
        ...user,
        workStats: {
            totalTasks: tasks.length,
            doneCount: doneTasks.length,
            inProgressCount: inProgressTasks.length,
            todoCount: todoTasks.length,
            completionRate: tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0,
            totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
            totalActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
            activitiesCount: user._count?.activities || 0,
            commentsCount: user._count?.comments || 0
        }
    };
};

module.exports = {
    getUsersByTenant,
    getUserWorkProfile,
    createUser,
    updateUser,
    deleteUser
};
