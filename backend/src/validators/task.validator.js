const { z } = require("zod");

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(2000, "Description is too long").optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
    estimatedHours: z.number().nonnegative().optional().nullable(),
    projectId: z.string().uuid("Invalid Project ID"),
    assigneeId: z.string().uuid("Invalid Assignee ID").optional().nullable()
});

const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
    estimatedHours: z.number().nonnegative().optional().nullable(),
    actualHours: z.number().nonnegative().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable()
});

module.exports = {
    createTaskSchema,
    updateTaskSchema
};
