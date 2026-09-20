from datetime import datetime
from typing import List
from models.schemas import ProjectRiskInput, RiskPredictionOutput

class RiskEngine:
    @staticmethod
    def assess_risk(data: ProjectRiskInput) -> RiskPredictionOutput:
        total = max(data.totalTasks, 1)
        completion_rate = data.completedTasks / total
        overdue_ratio = data.overdueTasks / total
        in_progress_ratio = data.inProgressTasks / total

        # Compute multi-factor weighted risk
        base_risk = (1.0 - completion_rate) * 35.0
        overdue_penalty = min(50.0, overdue_ratio * 70.0)
        team_factor = max(0.0, (total / max(data.teamSize, 1) - 5) * 2.0)
        
        raw_score = base_risk + overdue_penalty + team_factor

        # Deadline proximity factor
        deadline_risk = 0.0
        if data.dueDate:
            try:
                due_dt = datetime.fromisoformat(data.dueDate.replace("Z", "+00:00"))
                now = datetime.now(due_dt.tzinfo)
                days_left = (due_dt - now).days
                if days_left < 0 and completion_rate < 1.0:
                    deadline_risk = 30.0
                elif days_left <= 7 and completion_rate < 0.7:
                    deadline_risk = 20.0
                elif days_left <= 14 and completion_rate < 0.4:
                    deadline_risk = 10.0
            except Exception:
                pass

        final_score = round(min(100.0, max(0.0, raw_score + deadline_risk)), 1)

        # Risk Classification
        if final_score >= 65.0:
            risk_level = "HIGH"
        elif final_score >= 35.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Delay Probability Estimation
        delay_prob = round(min(0.99, max(0.05, (overdue_ratio * 1.3) + ((1.0 - completion_rate) * 0.4))), 2)

        # Workload Index (tasks per member)
        workload_index = round(total / max(data.teamSize, 1), 1)

        # Intelligent Actionable Recommendations
        recommendations: List[str] = []
        if data.overdueTasks > 0:
            recommendations.append(f"Immediate intervention required: {data.overdueTasks} tasks are overdue.")
        if workload_index > 6.0:
            recommendations.append("High workload concentration detected across team members. Distribute tasks.")
        if completion_rate < 0.3 and total > 5:
            recommendations.append("Low completion velocity. Break down large deliverables into smaller milestones.")
        if delay_prob > 0.6:
            recommendations.append("High probability of schedule slippage. Re-evaluate upcoming milestone target dates.")
        if not recommendations:
            recommendations.append("Project execution is within safe operational thresholds. Continue active tracking.")

        return RiskPredictionOutput(
            projectId=data.projectId,
            riskScore=final_score,
            riskLevel=risk_level,
            delayProbability=delay_prob,
            workloadIndex=workload_index,
            recommendations=recommendations
        )
