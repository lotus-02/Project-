from typing import List
from models.schemas import WorkloadAnalysisInput, WorkloadAnalysisOutput, WorkloadMemberResult

class WorkloadEngine:
    @staticmethod
    def analyze_workload(data: WorkloadAnalysisInput) -> WorkloadAnalysisOutput:
        capacity = max(data.standardCapacityHours, 1.0)
        results: List[WorkloadMemberResult] = []
        total_hours = 0.0
        overloaded_count = 0

        for member in data.members:
            utilization = round((member.estimatedHours / capacity) * 100.0, 1)
            total_hours += member.estimatedHours

            is_overloaded = utilization > 100.0 or member.assignedTasks > 8
            if is_overloaded:
                overloaded_count += 1

            if utilization > 120.0 or member.assignedTasks > 10:
                burnout = "HIGH"
            elif utilization > 90.0 or member.assignedTasks > 6:
                burnout = "MEDIUM"
            else:
                burnout = "LOW"

            results.append(WorkloadMemberResult(
                userId=member.userId,
                userName=member.userName,
                assignedTasks=member.assignedTasks,
                estimatedHours=member.estimatedHours,
                utilizationRate=utilization,
                isOverloaded=is_overloaded,
                burnoutRisk=burnout
            ))

        member_count = max(len(data.members), 1)
        avg_utilization = round(sum(r.utilizationRate for r in results) / member_count, 1)

        recommendations: List[str] = []
        if overloaded_count > 0:
            recommendations.append(f"{overloaded_count} member(s) exceed standard capacity threshold. Rebalance assignments.")
        if avg_utilization < 40.0 and member_count > 1:
            recommendations.append("Overall team capacity is underutilized. More workload can be absorbed.")
        if not recommendations:
            recommendations.append("Team resource allocation is well-balanced.")

        return WorkloadAnalysisOutput(
            overallWorkloadIndex=avg_utilization,
            overloadedCount=overloaded_count,
            members=results,
            recommendations=recommendations
        )
