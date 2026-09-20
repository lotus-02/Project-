const express = require("express");
const commentService = require("../services/comment.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");

const router = express.Router();

router.get(
    "/task/:taskId",
    authenticate,
    tenantContext,
    authorizePermission("task:read"),
    async (req, res, next) => {
        try {
            const comments = await commentService.getCommentsByTask({
                tenantId: req.tenantId,
                taskId: req.params.taskId
            });
            res.status(200).json({
                success: true,
                data: comments
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/task/:taskId",
    authenticate,
    tenantContext,
    authorizePermission("task:update"),
    async (req, res, next) => {
        try {
            const { content } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Comment content is required"
                });
            }

            const comment = await commentService.createComment({
                tenantId: req.tenantId,
                userId: req.user.userId,
                taskId: req.params.taskId,
                content
            });

            res.status(201).json({
                success: true,
                message: "Comment added successfully",
                data: comment
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
