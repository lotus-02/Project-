const express = require("express");
const notificationService = require("../services/notification.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    tenantContext,
    async (req, res, next) => {
        try {
            const notifications = await notificationService.getUserNotifications({
                userId: req.user.userId,
                tenantId: req.tenantId
            });
            res.status(200).json({
                success: true,
                data: notifications
            });
        } catch (error) {
            next(error);
        }
    }
);

router.patch(
    "/:id/read",
    authenticate,
    tenantContext,
    async (req, res, next) => {
        try {
            await notificationService.markAsRead({
                notificationId: req.params.id,
                userId: req.user.userId,
                tenantId: req.tenantId
            });
            res.status(200).json({
                success: true,
                message: "Notification marked as read"
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/read-all",
    authenticate,
    tenantContext,
    async (req, res, next) => {
        try {
            await notificationService.markAllAsRead({
                userId: req.user.userId,
                tenantId: req.tenantId
            });
            res.status(200).json({
                success: true,
                message: "All notifications marked as read"
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
