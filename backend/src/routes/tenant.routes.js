const express = require("express");
const tenantService = require("../services/tenant.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");

const router = express.Router();

router.get(
    "/current",
    authenticate,
    tenantContext,
    async (req, res, next) => {
        try {
            const tenant = await tenantService.getTenantProfile(req.tenantId);
            res.status(200).json({
                success: true,
                data: tenant
            });
        } catch (error) {
            next(error);
        }
    }
);

router.patch(
    "/current",
    authenticate,
    tenantContext,
    authorizePermission("tenant:manage"),
    async (req, res, next) => {
        try {
            const tenant = await tenantService.updateTenantProfile({
                tenantId: req.tenantId,
                userId: req.user.userId,
                ...req.body
            });
            res.status(200).json({
                success: true,
                message: "Organization updated successfully",
                data: tenant
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
