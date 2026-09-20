const express = require("express");
const {
    registerOrganization,
    login,
    refreshAccessToken,
    getMe
} = require("./auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { tenantContext } = require("../middleware/tenant.middleware");

const router = express.Router();

router.post("/register-organization", registerOrganization);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.get("/me", authenticate, tenantContext, getMe);

module.exports = router;