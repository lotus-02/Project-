const jwt = require("jsonwebtoken");

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default_dev_access_secret_123!";
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || "default_dev_refresh_secret_456!";

const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        getAccessSecret(),
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
        }
    );
};

const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        getRefreshSecret(),
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, getRefreshSecret());
};

const signToken = (user) => {
    return generateAccessToken({
        userId: user.id || user.userId,
        email: user.email,
        tenantId: user.tenantId,
        roleId: user.roleId
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    signToken
};
