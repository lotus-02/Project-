const express = require("express");
const roleService = require("../services/role.service");
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
            const roles = await roleService.getRolesByTenant(req.tenantId);
            res.status(200).json({
                success: true,
                data: roles
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
            const role = await roleService.createRole({
                tenantId: req.tenantId,
                ...req.body
            });
            res.status(201).json({
                success: true,
                message: "Role created successfully",
                data: role
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/:id/permissions",
    authenticate,
    tenantContext,
    authorizePermission("user:manage"),
    async (req, res, next) => {
        try {
            const role = await roleService.updateRolePermissions({
                tenantId: req.tenantId,
                roleId: req.params.id,
                permissionIds: req.body.permissionIds
            });
            res.status(200).json({
                success: true,
                message: "Role permissions updated successfully",
                data: role
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
