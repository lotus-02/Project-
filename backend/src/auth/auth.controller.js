const authService = require("./auth.service");
const { validateRegisterInput, validateLoginInput } = require("./auth.validator");

const registerOrganization = async (req, res) => {
    try {
        validateRegisterInput(req.body);
        const { organizationName, name, email, password } = req.body;
        const result = await authService.registerOrganization({ organizationName, name, email, password });
        res.status(201).json({ success: true, message: "Organization registered successfully", data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Registration failed" });
    }
};

const joinOrganization = async (req, res) => {
    try {
        const { tenantId, roleId, name, email, password } = req.body;
        if (!tenantId || !roleId || !name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }
        const result = await authService.joinOrganization({ tenantId, roleId, name, email, password });
        res.status(201).json({ success: true, message: "Joined organization successfully", data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Failed to join organization" });
    }
};

const login = async (req, res) => {
    try {
        validateLoginInput(req.body);
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.status(200).json({ success: true, message: "Login successful", data: result });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message || "Invalid credentials" });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({ success: true, message: "Access token refreshed successfully", data: result });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res, next) => {
    try {
        const result = await authService.getMe(req.user.userId, req.user.tenantId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerOrganization,
    joinOrganization,
    login,
    refreshAccessToken,
    getMe
};