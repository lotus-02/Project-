const express = require("express");
const {
    registerOrganization,
    joinOrganization,
    login,
    refreshAccessToken,
    getMe
} = require("./auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");
const prisma = require("../config/prisma");

const router = express.Router();

router.post("/register-organization", registerOrganization);
// /join-organization is disabled — members must be added by Admin via Team page (authenticated)
router.post("/join-organization", (req, res) => {
    res.status(403).json({
        success: false,
        message: "Self-registration is disabled. Contact your organization admin to be added."
    });
});
router.post("/login",                 login);
router.post("/refresh",               refreshAccessToken);
router.get("/me",                     authenticate, tenantContext, getMe);

// Public — lists orgs + users for login/register quick-select (no passwords exposed)
router.get("/tenants-preview", async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany({
            where: { status: "active" },
            select: {
                id: true,
                name: true,
                slug: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: { select: { name: true } }
                    },
                    orderBy: { createdAt: "asc" }
                },
                roles: {
                    select: { id: true, name: true, description: true },
                    orderBy: { createdAt: "asc" }
                }
            },
            orderBy: { createdAt: "asc" }
        });
        res.json({ success: true, data: tenants });
    } catch (err) {
        res.json({ success: false, data: [] });
    }
});

module.exports = router;