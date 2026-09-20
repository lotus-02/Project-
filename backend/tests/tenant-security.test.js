const test = require("node:test");
const assert = require("node:assert/strict");

const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require("../src/utils/jwt");
const { createTaskSchema } = require("../src/validators/task.validator");
const { createProjectSchema } = require("../src/validators/project.validator");

test("JWT generation and verification works with tenant isolation payload", () => {
    const payload = {
        userId: "user-123",
        tenantId: "tenant-abc",
        roleId: "role-admin"
    };

    const token = generateAccessToken(payload);
    assert.ok(token);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.userId, "user-123");
    assert.equal(decoded.tenantId, "tenant-abc");
    assert.equal(decoded.roleId, "role-admin");
});

test("Task validator validates schema correctly", () => {
    const validTask = {
        title: "Implement RBAC middleware",
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        priority: "HIGH",
        status: "IN_PROGRESS"
    };

    const result = createTaskSchema.safeParse(validTask);
    assert.equal(result.success, true);

    const invalidTask = {
        title: "", // empty title should fail
        projectId: "invalid-uuid"
    };
    const failResult = createTaskSchema.safeParse(invalidTask);
    assert.equal(failResult.success, false);
});

test("Project validator validates schema correctly", () => {
    const validProject = {
        name: "Security Platform 2.0",
        description: "Multi-tenant cloud architecture",
        priority: "HIGH"
    };
    const result = createProjectSchema.safeParse(validProject);
    assert.equal(result.success, true);
});
