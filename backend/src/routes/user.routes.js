const express = require("express");
const userService = require("../services/user.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    tenantContext,
    authorizePermission("user:read"),
    async (req, res, next) => {
        try {
            const users = await userService.getUsersByTenant(req.tenantId);
            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/:id/work",
    authenticate,
    tenantContext,
    authorizePermission("user:read"),
    async (req, res, next) => {
        try {
            const profile = await userService.getUserWorkProfile({
                tenantId: req.tenantId,
                targetUserId: req.params.id
            });

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.status(200).json({
                success: true,
                data: profile
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
    authorizePermission("user:manage"),
    async (req, res, next) => {
        try {
            const user = await userService.createUser({
                tenantId: req.tenantId,
                currentUserId: req.user.userId,
                ...req.body
            });

            res.status(201).json({
                success: true,
                message: "User added successfully",
                data: user
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
    authorizePermission("user:manage"),
    async (req, res, next) => {
        try {
            const user = await userService.updateUser({
                tenantId: req.tenantId,
                currentUserId: req.user.userId,
                targetUserId: req.params.id,
                ...req.body
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user
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
    authorizePermission("user:manage"),
    async (req, res, next) => {
        try {
            const result = await userService.deleteUser({
                tenantId: req.tenantId,
                currentUserId: req.user.userId,
                targetUserId: req.params.id
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to delete user"
            });
        }
    }
);

module.exports = router;
