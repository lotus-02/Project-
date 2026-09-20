const prisma = require("../config/prisma");
const socket = require("../socket");
const { logActivity } = require("./activity.service");

const getProjectsByTenant = async (tenantId) => {
    return prisma.project.findMany({
        where: {
            tenantId
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            _count: {
                select: {
                    tasks: true,
                    members: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

const createProject = async ({
    tenantId,
    userId,
    name,
    description,
    priority = "MEDIUM",
    startDate,
    endDate
}) => {
    const project = await prisma.project.create({
        data: {
            name,
            description,
            priority,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            tenantId,
            members: userId ? {
                create: {
                    userId,
                    role: "MANAGER"
                }
            } : undefined
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            _count: {
                select: { tasks: true, members: true }
            }
        }
    });

    await logActivity({
        action: "PROJECT_CREATED",
        details: `Project "${name}" was created`,
        entityType: "PROJECT",
        entityId: project.id,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "project:created", project);

    return project;
};

const getProjectById = async ({
    tenantId,
    projectId
}) => {
    return prisma.project.findFirst({
        where: {
            id: projectId,
            tenantId
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            tasks: {
                include: {
                    assignee: {
                        select: { id: true, name: true, email: true }
                    },
                    _count: {
                        select: { comments: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            },
            mlAnalyses: {
                orderBy: { createdAt: "desc" },
                take: 1
            },
            _count: {
                select: { tasks: true, members: true }
            }
        }
    });
};

const updateProject = async ({
    tenantId,
    userId,
    projectId,
    name,
    description,
    status,
    priority,
    startDate,
    endDate
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

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

    const updated = await prisma.project.update({
        where: {
            id: projectId
        },
        data,
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            _count: {
                select: { tasks: true, members: true }
            }
        }
    });

    await logActivity({
        action: "PROJECT_UPDATED",
        details: `Project "${updated.name}" was updated`,
        entityType: "PROJECT",
        entityId: updated.id,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "project:updated", updated);

    return updated;
};

const deleteProject = async ({
    tenantId,
    userId,
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

    await prisma.project.delete({
        where: {
            id: projectId
        }
    });

    await logActivity({
        action: "PROJECT_DELETED",
        details: `Project "${project.name}" was deleted`,
        entityType: "PROJECT",
        entityId: projectId,
        userId,
        tenantId
    });

    socket.emitToTenant(tenantId, "project:deleted", { id: projectId });

    return true;
};

const addProjectMember = async ({ tenantId, userId, projectId, targetUserId, role = "MEMBER" }) => {
    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new Error("Project not found");

    const targetUser = await prisma.user.findFirst({ where: { id: targetUserId, tenantId } });
    if (!targetUser) throw new Error("User not found in organization");

    const member = await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId, userId: targetUserId } },
        update: { role },
        create: { projectId, userId: targetUserId, role },
        include: {
            user: { select: { id: true, name: true, email: true } }
        }
    });

    await logActivity({
        action: "MEMBER_ADDED",
        details: `${targetUser.name} added to project ${project.name} as ${role}`,
        entityType: "PROJECT",
        entityId: projectId,
        userId,
        tenantId
    });

    socket.emitToProject(projectId, "project:member_added", member);

    return member;
};

const removeProjectMember = async ({ tenantId, userId, projectId, targetUserId }) => {
    const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
    if (!project) throw new Error("Project not found");

    await prisma.projectMember.deleteMany({
        where: { projectId, userId: targetUserId }
    });

    await logActivity({
        action: "MEMBER_REMOVED",
        details: `Member removed from project ${project.name}`,
        entityType: "PROJECT",
        entityId: projectId,
        userId,
        tenantId
    });

    socket.emitToProject(projectId, "project:member_removed", { projectId, userId: targetUserId });

    return true;
};

module.exports = {
    getProjectsByTenant,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember
};