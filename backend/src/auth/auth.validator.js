const { z } = require("zod");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegisterInput = ({ organizationName, name, email, password }) => {
    if (!organizationName || !organizationName.trim()) {
        throw new Error("Organization name is required");
    }
    if (!name || !name.trim()) {
        throw new Error("Name is required");
    }
    if (!email || !isValidEmail(email)) {
        throw new Error("Valid email is required");
    }
    if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    return true;
};

const validateLoginInput = ({ email, password }) => {
    if (!email || !isValidEmail(email)) {
        throw new Error("Valid email is required");
    }
    if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    return true;
};

const registerSchema = z.object({
    organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password is required")
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(10, "Valid refresh token is required")
});

module.exports = {
    validateRegisterInput,
    validateLoginInput,
    registerSchema,
    loginSchema,
    refreshTokenSchema
};
