const prisma = require("../config/prisma");
const socket = require("../socket");
const { logActivity } = require("./activity.service");

const createTask = async ({
    tenantId,
    userId,
    title,
    description,
    status = "TODO",
    priority = "MEDIUM",
    dueDate,
    estimatedHours,
    projectId,
    assigneeId
}) => {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
        where: { id: projectId, tenantId }
    });

    if (!project) {
        throw new Error("Project not found in your organization");
    }

    if (assigneeId) {
        const assignee = await prisma.user.findFirst({
            where: { id: assigneeId, tenantId }
        });
        if (!assignee) {
            throw new Error("Assignee not found in your organization");
        }
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            estimatedHours: estimatedHours ? Number(estimatedHours) : null,
            projectId,
            assigneeId: assigneeId || null,
            tenantId
        },
        include: {
            assignee: {
                select: { id: true, name: true, email: true }
            },
            project: {
                select: { id: true, name: true }
            }
        }
    });

    await logActivity({
        action: "TASK_CREATED",
        details: `Task "${title}" created in project "${project.name}"`,
        entityType: "TASK",
        entityId: task.id,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "task:created", task);
    socket.emitToProject(projectId, "task:created", task);

    return task;
};

const getTasksByTenant = async ({ tenantId, projectId, status, priority, assigneeId }) => {
    const where = { tenantId };
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    return prisma.task.findMany({
        where,
        include: {
            assignee: {
                select: { id: true, name: true, email: true }
            },
            project: {
                select: { id: true, name: true }
            },
            _count: {
                select: { comments: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
};

const getTaskById = async ({ tenantId, taskId }) => {
    return prisma.task.findFirst({
        where: {
            id: taskId,
            tenantId
        },
        include: {
            assignee: {
                select: { id: true, name: true, email: true }
            },
            project: {
                select: { id: true, name: true }
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    });
};

const updateTask = async ({
    tenantId,
    userId,
    taskId,
    title,
    description,
    status,
    priority,
    dueDate,
    estimatedHours,
    actualHours,
    assigneeId
}) => {
    const existing = await prisma.task.findFirst({
        where: { id: taskId, tenantId },
        include: { project: true }
    });

    if (!existing) {
        return null;
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (estimatedHours !== undefined) data.estimatedHours = estimatedHours ? Number(estimatedHours) : null;
    if (actualHours !== undefined) data.actualHours = actualHours ? Number(actualHours) : null;
    if (assigneeId !== undefined) data.assigneeId = assigneeId || null;

    const updated = await prisma.task.update({
        where: { id: taskId },
        data,
        include: {
            assignee: {
                select: { id: true, name: true, email: true }
            },
            project: {
                select: { id: true, name: true }
            }
        }
    });

    await logActivity({
        action: "TASK_UPDATED",
        details: `Task "${updated.title}" status changed to ${updated.status}`,
        entityType: "TASK",
        entityId: updated.id,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "task:updated", updated);
    socket.emitToProject(updated.projectId, "task:updated", updated);

    return updated;
};

const deleteTask = async ({ tenantId, userId, taskId }) => {
    const existing = await prisma.task.findFirst({
        where: { id: taskId, tenantId }
    });

    if (!existing) {
        return null;
    }

    await prisma.task.delete({
        where: { id: taskId }
    });

    await logActivity({
        action: "TASK_DELETED",
        details: `Task "${existing.title}" deleted`,
        entityType: "TASK",
        entityId: taskId,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "task:deleted", { id: taskId, projectId: existing.projectId });
    socket.emitToProject(existing.projectId, "task:deleted", { id: taskId, projectId: existing.projectId });

    return true;
};

module.exports = {
    createTask,
    getTasksByTenant,
    getTaskById,
    updateTask,
    deleteTask
};
