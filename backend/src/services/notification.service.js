const prisma = require("../config/prisma");
const socket = require("../socket");

const createNotification = async ({ userId, tenantId, title, message }) => {
    const notification = await prisma.notification.create({
        data: {
            title,
            message,
            userId,
            tenantId
        }
    });

    socket.emitToUser(userId, "notification:new", notification);
    return notification;
};

const getUserNotifications = async ({ userId, tenantId }) => {
    return prisma.notification.findMany({
        where: { userId, tenantId },
        orderBy: { createdAt: "desc" },
        take: 50
    });
};

const markAsRead = async ({ notificationId, userId, tenantId }) => {
    return prisma.notification.updateMany({
        where: { id: notificationId, userId, tenantId },
        data: { isRead: true }
    });
};

const markAllAsRead = async ({ userId, tenantId }) => {
    return prisma.notification.updateMany({
        where: { userId, tenantId, isRead: false },
        data: { isRead: true }
    });
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
