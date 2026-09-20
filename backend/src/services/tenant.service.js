const prisma = require("../config/prisma");
const socket = require("../socket");
const { logActivity } = require("./activity.service");

const getTenantProfile = async (tenantId) => {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
            _count: {
                select: {
                    users: true,
                    projects: true,
                    tasks: true
                }
            }
        }
    });

    if (!tenant) {
        throw new Error("Tenant organization not found");
    }

    return tenant;
};

const updateTenantProfile = async ({ tenantId, userId, name, status }) => {
    const data = {};
    if (name) {
        data.name = name;
        data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (status) data.status = status;

    const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data
    });

    await logActivity({
        action: "TENANT_UPDATED",
        details: `Organization details updated to "${tenant.name}"`,
        entityType: "TENANT",
        entityId: tenantId,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "tenant:updated", tenant);

    return tenant;
};

module.exports = {
    getTenantProfile,
    updateTenantProfile
};
