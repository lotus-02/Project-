from fastapi import APIRouter
from models.schemas import (
    ProjectRiskInput,
    RiskPredictionOutput,
    DelayPredictionInput,
    DelayPredictionOutput,
    WorkloadAnalysisInput,
    WorkloadAnalysisOutput
)
from services.risk_engine import RiskEngine
from services.workload_engine import WorkloadEngine

router = APIRouter()

@router.post("/predict/risk", response_model=RiskPredictionOutput)
def predict_risk(data: ProjectRiskInput):
    return RiskEngine.assess_risk(data)

@router.post("/predict/delay", response_model=DelayPredictionOutput)
def predict_delay(data: DelayPredictionInput):
    remaining = max(0, data.totalTasks - data.completedTasks)
    velocity = max(data.velocityTasksPerWeek, 0.5)
    needed_weeks = remaining / velocity
    needed_days = int(needed_weeks * 7)

    overdue_days = 0
    if data.remainingDays is not None:
        overdue_days = max(0, needed_days - data.remainingDays)

    delay_prob = round(min(0.99, max(0.05, overdue_days / 14.0 if overdue_days > 0 else 0.1)), 2)
    risk_cat = "HIGH" if delay_prob > 0.6 else "MEDIUM" if delay_prob > 0.3 else "LOW"

    return DelayPredictionOutput(
        delayProbability=delay_prob,
        estimatedOverdueDays=overdue_days,
        riskCategory=risk_cat
    )

@router.post("/predict/workload", response_model=WorkloadAnalysisOutput)
def predict_workload(data: WorkloadAnalysisInput):
    return WorkloadEngine.analyze_workload(data)

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ml-project-intelligence",
        "version": "1.0.0"
    }
