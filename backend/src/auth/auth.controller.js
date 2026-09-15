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

module.exports = {
    registerOrganization
};