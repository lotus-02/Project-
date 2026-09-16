const express = require("express");

const {
    registerOrganization,
    login,
    refreshAccessToken 
} = require("./auth.controller");

const router = express.Router();

router.post("/register-organization", registerOrganization);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);

module.exports = router;