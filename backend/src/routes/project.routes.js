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
    async (req, res) => {
        try {
            const projects = await projectService.getProjectsByTenant(
                req.tenantId
            );

            res.status(200).json({
                success: true,
                data: projects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch projects"
            });
        }
    }
);

router.post(
    "/",
    authenticate,
    tenantContext,
    authorizePermission("project:create"),
    validate(createProjectSchema),
    async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Project name is required"
                });
            }

            const project = await projectService.createProject({
                tenantId: req.tenantId,
                name,
                description
            });

            res.status(201).json({
                success: true,
                message: "Project created successfully",
                data: project
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create project"
            });
        }
    }
);
router.get(
    "/:id",
    authenticate,
    tenantContext,
    authorizePermission("project:read"),
    async (req, res) => {
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
            res.status(500).json({
                success: false,
                message: "Failed to fetch project"
            });
        }
    }
);
router.patch(
    "/:id",
    authenticate,
    tenantContext,
    authorizePermission("project:update"),
    validate(updateProjectSchema),
    async (req, res) => {
        try {
            const { name, description, status } = req.body;

            const project = await projectService.updateProject({
                tenantId: req.tenantId,
                projectId: req.params.id,
                name,
                description,
                status
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
            res.status(500).json({
                success: false,
                message: "Failed to update project"
            });
        }
    }
);
router.delete(
    "/:id",
    authenticate,
    tenantContext,
    authorizePermission("project:delete"),
    async (req, res) => {
        try {
            const project = await projectService.deleteProject({
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
                message: "Project deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete project"
            });
        }
    }
);
module.exports = router;