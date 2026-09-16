const express = require("express");

const prisma = require("../config/prisma");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const { authorizePermission } = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", authenticate, tenantContext, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                tenantId: req.tenantId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

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
});
router.post(
    "/",
    authenticate,
    tenantContext,
    authorizePermission("project:create"),
    async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Project name is required"
                });
            }

            const project = await prisma.project.create({
                data: {
                    name,
                    description,
                    tenantId: req.tenantId
                }
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
module.exports = router;