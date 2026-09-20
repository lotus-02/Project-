const prisma = require("../config/prisma");
const socket = require("../socket");

const logActivity = async ({ action, details, entityType, entityId, userId, tenantId }) => {
    try {
        const activity = await prisma.activity.create({
            data: {
                action,
                details,
                entityType,
                entityId,
                userId,
                tenantId
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Broadcast real-time activity event to tenant room
        socket.emitToTenant(tenantId, "activity:created", activity);

        return activity;
    } catch (error) {
        console.error("Failed to log activity:", error.message);
    }
};

const getTenantActivities = async (tenantId, limit = 20) => {
    return prisma.activity.findMany({
        where: { tenantId },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: limit
    });
};

module.exports = {
    logActivity,
    getTenantActivities
};
