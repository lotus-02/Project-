const prisma = require("../config/prisma");

const getProjectsByTenant = async (tenantId) => {
    return prisma.project.findMany({
        where: {
            tenantId
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

const createProject = async ({
    tenantId,
    name,
    description
}) => {
    return prisma.project.create({
        data: {
            name,
            description,
            tenantId
        }
    });
};
const getProjectById = async ({
    tenantId,
    projectId
}) => {
    return prisma.project.findFirst({
        where: {
            id: projectId,
            tenantId
        }
    });
};

const updateProject = async ({
    tenantId,
    projectId,
    name,
    description,
    status
}) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            tenantId
        }
    });

    if (!project) {
        return null;
    }

    return prisma.project.update({
        where: {
            id: projectId
        },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status })
        }
    });
};
const deleteProject = async ({
    tenantId,
    projectId
}) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            tenantId
        }
    });

    if (!project) {
        return null;
    }

    return prisma.project.delete({
        where: {
            id: projectId
        }
    });
};
module.exports = {
    getProjectsByTenant,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};