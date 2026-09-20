const prisma = require("../config/prisma");
const socket = require("../socket");
const { logActivity } = require("./activity.service");

const createComment = async ({ tenantId, userId, taskId, content }) => {
    // Verify task belongs to tenant
    const task = await prisma.task.findFirst({
        where: { id: taskId, tenantId },
        include: { project: true }
    });

    if (!task) {
        throw new Error("Task not found in your organization");
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            taskId,
            userId
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    await logActivity({
        action: "COMMENT_ADDED",
        details: `Comment added to task "${task.title}"`,
        entityType: "TASK",
        entityId: taskId,
        userId,
        tenantId
    });

    socket.emitToProject(task.projectId, "comment:created", comment);

    return comment;
};

const getCommentsByTask = async ({ tenantId, taskId }) => {
    const task = await prisma.task.findFirst({
        where: { id: taskId, tenantId }
    });

    if (!task) {
        throw new Error("Task not found");
    }

    return prisma.comment.findMany({
        where: { taskId },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: "asc" }
    });
};

module.exports = {
    createComment,
    getCommentsByTask
};
