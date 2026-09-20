const express = require("express");
const taskService = require("../services/task.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createTaskSchema, updateTaskSchema } = require("../validators/task.validator");

const router = express.Router();

router.get(
    "/",
    authenticate,
    tenantContext,
    authorizePermission("task:read"),
    async (req, res, next) => {
        try {
            const { projectId, status, priority, assigneeId } = req.query;
            const tasks = await taskService.getTasksByTenant({
                tenantId: req.tenantId,
                projectId,
                status,
                priority,
                assigneeId
            });

            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/",
    authenticate,
    tenantContext,
    authorizePermission("task:create"),
    validate(createTaskSchema),
    async (req, res, next) => {
        try {
            const task = await taskService.createTask({
                tenantId: req.tenantId,
                userId: req.user.userId,
                ...req.body
            });

            res.status(201).json({
                success: true,
                message: "Task created successfully",
                data: task
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/:id",
    authenticate,
    tenantContext,
    authorizePermission("task:read"),
    async (req, res, next) => {
        try {
            const task = await taskService.getTaskById({
                tenantId: req.tenantId,
                taskId: req.params.id
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            next(error);
        }
    }
);

router.patch(
    "/:id",
    authenticate,
    tenantContext,
    authorizePermission("task:update"),
    validate(updateTaskSchema),
    async (req, res, next) => {
        try {
            const task = await taskService.updateTask({
                tenantId: req.tenantId,
                userId: req.user.userId,
                taskId: req.params.id,
                ...req.body
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Task updated successfully",
                data: task
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    "/:id",
    authenticate,
    tenantContext,
    authorizePermission("task:delete"),
    async (req, res, next) => {
        try {
            const result = await taskService.deleteTask({
                tenantId: req.tenantId,
                userId: req.user.userId,
                taskId: req.params.id
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Task deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
