const authService = require("./auth.service");

const registerOrganization = async (req, res) => {
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);

    try {
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
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
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
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const refreshAccessToken = async (req, res) => {
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
module.exports = {
    registerOrganization,
    login,
    refreshAccessToken
};