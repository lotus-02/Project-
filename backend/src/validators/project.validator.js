const { z } = require("zod");

const createProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Project name is required")
        .max(100, "Project name must be 100 characters or less"),
    description: z
        .string()
        .trim()
        .max(1000, "Description must be 1000 characters or less")
        .optional()
        .nullable(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable()
});

const updateProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Project name cannot be empty")
        .max(100, "Project name must be 100 characters or less")
        .optional(),
    description: z
        .string()
        .trim()
        .max(1000, "Description must be 1000 characters or less")
        .optional()
        .nullable(),
    status: z
        .string()
        .trim()
        .max(30, "Status must be 30 characters or less")
        .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }
);

module.exports = {
    createProjectSchema,
    updateProjectSchema
};