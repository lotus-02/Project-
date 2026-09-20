const authService = require("./auth.service");
const { validateRegisterInput, validateLoginInput } = require("./auth.validator");

const registerOrganization = async (req, res, next) => {
    try {
        validateRegisterInput(req.body);

        const { organizationName, name, email, password } = req.body;

        const result = await authService.registerOrganization({
            organizationName,
            name,
            email,
            password
        });

        res.status(201).json({
            success: true,
            message: "Organization registered successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        validateLoginInput(req.body);

        const { email, password } = req.body;

        const result = await authService.login({
            email,
            password
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || "Invalid credentials"
        });
    }
};

const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const getMe = async (req, res, next) => {
    try {
        const result = await authService.getMe(req.user.userId, req.user.tenantId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerOrganization,
    login,
    refreshAccessToken,
    getMe
};