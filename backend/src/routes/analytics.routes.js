const express = require("express");
const analyticsService = require("../services/analytics.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");

const router = express.Router();

router.get(
    "/overview",
    authenticate,
    tenantContext,
    authorizePermission("analytics:read"),
    async (req, res, next) => {
        try {
            const data = await analyticsService.getTenantOverview(req.tenantId);
            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/project/:id",
    authenticate,
    tenantContext,
    authorizePermission("analytics:read"),
    async (req, res, next) => {
        try {
            const data = await analyticsService.getProjectAnalytics({
                tenantId: req.tenantId,
                projectId: req.params.id
            });
            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/project/:id/ml-analyze",
    authenticate,
    tenantContext,
    authorizePermission("analytics:read"),
    async (req, res, next) => {
        try {
            const analysis = await analyticsService.triggerProjectMLIntelligence({
                tenantId: req.tenantId,
                projectId: req.params.id
            });
            res.status(200).json({
                success: true,
                message: "ML analysis generated successfully",
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
