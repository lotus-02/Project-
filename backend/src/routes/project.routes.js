const express = require("express");

const projectService = require("../services/project.service");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createProjectSchema,
    updateProjectSchema
} = require("../validators/project.validator");

const router = express.Router();

router.get(
    "/",
    authenticate,
    tenantContext,
    authorizePermission("project:read"),
    async (req, res, next) => {
        try {
            const projects = await projectService.getProjectsByTenant(req.tenantId);
            res.status(200).json({
                success: true,
                data: projects
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
    authorizePermission("project:create"),
    validate(createProjectSchema),
    async (req, res, next) => {
        try {
            const project = await projectService.createProject({
                tenantId: req.tenantId,
                userId: req.user.userId,
                ...req.body
            });

            res.status(201).json({
                success: true,
                message: "Project created successfully",
                data: project
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
    authorizePermission("project:read"),
    async (req, res, next) => {
        try {
            const project = await projectService.getProjectById({
                tenantId: req.tenantId,
                projectId: req.params.id
            });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            res.status(200).json({
                success: true,
                data: project
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
    authorizePermission("project:update"),
    validate(updateProjectSchema),
    async (req, res, next) => {
        try {
            const project = await projectService.updateProject({
                tenantId: req.tenantId,
                userId: req.user.userId,
                projectId: req.params.id,
                ...req.body
            });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Project updated successfully",
                data: project
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
    authorizePermission("project:delete"),
    async (req, res, next) => {
        try {
            const result = await projectService.deleteProject({
                tenantId: req.tenantId,
                userId: req.user.userId,
                projectId: req.params.id
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Project deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/:id/members",
    authenticate,
    tenantContext,
    authorizePermission("project:update"),
    async (req, res, next) => {
        try {
            const { userId: targetUserId, role } = req.body;
            const member = await projectService.addProjectMember({
                tenantId: req.tenantId,
                userId: req.user.userId,
                projectId: req.params.id,
                targetUserId,
                role
            });

            res.status(201).json({
                success: true,
                message: "Member added successfully",
                data: member
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    "/:id/members/:userId",
    authenticate,
    tenantContext,
    authorizePermission("project:update"),
    async (req, res, next) => {
        try {
            await projectService.removeProjectMember({
                tenantId: req.tenantId,
                userId: req.user.userId,
                projectId: req.params.id,
                targetUserId: req.params.userId
            });

            res.status(200).json({
                success: true,
                message: "Member removed successfully"
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;