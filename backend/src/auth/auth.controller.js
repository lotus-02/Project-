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

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyEmail({ email, otp });
        res.status(200).json({ success: true, message: result.message, data: result.user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Email verification failed" });
    }
};

const resendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.resendEmailOtp({ email });
        res.status(200).json({ success: true, message: result.message, ...(result.devOtp ? { devOtp: result.devOtp } : {}) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Failed to resend code" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const result = await authService.changePassword({ userId, currentPassword, newPassword });
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Failed to change password" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword({ email });
        res.status(200).json({ success: true, message: result.message, ...(result.devOtp ? { devOtp: result.devOtp } : {}) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Password reset request failed" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword({ email, otp, newPassword });
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || "Failed to reset password" });
    }
};

module.exports = {
    registerOrganization,
    joinOrganization,
    login,
    refreshAccessToken,
    getMe,
    verifyEmail,
    resendEmailOtp,
    changePassword,
    forgotPassword,
    resetPassword
};