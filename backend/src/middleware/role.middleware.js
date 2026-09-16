const prisma = require("../config/prisma");

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.roleId || !req.user.tenantId) {
                return res.status(403).json({
                    success: false,
                    message: "Authorization information missing"
                });
            }

            const role = await prisma.role.findFirst({
                where: {
                    id: req.user.roleId,
                    tenantId: req.user.tenantId
                }
            });

            if (!role) {
                return res.status(403).json({
                    success: false,
                    message: "Role not found"
                });
            }

            if (!allowedRoles.includes(role.name)) {
                return res.status(403).json({
                    success: false,
                    message: "Insufficient permissions"
                });
            }

            req.role = role;

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed"
            });
        }
    };
};

module.exports = {
    authorizeRoles
};