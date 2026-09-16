const prisma = require("../config/prisma");

const authorizePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.roleId || !req.user.tenantId) {
                return res.status(403).json({
                    success: false,
                    message: "Authorization information missing"
                });
            }

            const rolePermission = await prisma.rolePermission.findFirst({
                where: {
                    roleId: req.user.roleId,
                    permission: {
                        name: permissionName
                    },
                    role: {
                        tenantId: req.user.tenantId
                    }
                },
                include: {
                    permission: true
                }
            });

            if (!rolePermission) {
                return res.status(403).json({
                    success: false,
                    message: "Permission denied"
                });
            }

            req.permission = rolePermission.permission;

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Permission check failed"
            });
        }
    };
};

module.exports = {
    authorizePermission
};