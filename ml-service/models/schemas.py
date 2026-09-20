from typing import List, Optional
from pydantic import BaseModel, Field

class ProjectRiskInput(BaseModel):
    projectId: str
    projectName: str
    totalTasks: int = Field(ge=0, description="Total count of tasks in project")
    completedTasks: int = Field(ge=0, description="Completed tasks count")
    inProgressTasks: int = Field(default=0, ge=0)
    overdueTasks: int = Field(default=0, ge=0)
    teamSize: int = Field(default=1, ge=1)
    dueDate: Optional[str] = None

class RiskPredictionOutput(BaseModel):
    projectId: str
    riskScore: float = Field(ge=0, le=100)
    riskLevel: str  # "LOW", "MEDIUM", "HIGH"
    delayProbability: float = Field(ge=0.0, le=1.0)
    workloadIndex: float
    recommendations: List[str]

class DelayPredictionInput(BaseModel):
    totalTasks: int
    completedTasks: int
    remainingDays: Optional[int] = None
    velocityTasksPerWeek: float = 1.0

class DelayPredictionOutput(BaseModel):
    delayProbability: float
    estimatedOverdueDays: int
    riskCategory: str

class TeamMemberWorkload(BaseModel):
    userId: str
    userName: str
    assignedTasks: int
    estimatedHours: float = 0.0

class WorkloadAnalysisInput(BaseModel):
    members: List[TeamMemberWorkload]
    standardCapacityHours: float = 40.0

class WorkloadMemberResult(BaseModel):
    userId: str
    userName: str
    assignedTasks: int
    estimatedHours: float
    utilizationRate: float
    isOverloaded: bool
    burnoutRisk: str  # "LOW", "MEDIUM", "HIGH"

class WorkloadAnalysisOutput(BaseModel):
    overallWorkloadIndex: float
    overloadedCount: int
    members: List[WorkloadMemberResult]
    recommendations: List[str]
