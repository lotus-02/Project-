import unittest
from models.schemas import ProjectRiskInput, WorkloadAnalysisInput, TeamMemberWorkload
from services.risk_engine import RiskEngine
from services.workload_engine import WorkloadEngine

class TestMLEngine(unittest.TestCase):
    def test_risk_engine_low_risk(self):
        input_data = ProjectRiskInput(
            projectId="p1",
            projectName="Website Launch",
            totalTasks=10,
            completedTasks=9,
            inProgressTasks=1,
            overdueTasks=0,
            teamSize=3
        )
        result = RiskEngine.assess_risk(input_data)
        self.assertEqual(result.projectId, "p1")
        self.assertEqual(result.riskLevel, "LOW")
        self.assertLess(result.riskScore, 40.0)

    def test_risk_engine_high_risk(self):
        input_data = ProjectRiskInput(
            projectId="p2",
            projectName="Delayed Platform",
            totalTasks=20,
            completedTasks=2,
            inProgressTasks=3,
            overdueTasks=10,
            teamSize=2
        )
        result = RiskEngine.assess_risk(input_data)
        self.assertEqual(result.riskLevel, "HIGH")
        self.assertGreaterEqual(result.riskScore, 65.0)

    def test_workload_engine_overload(self):
        input_data = WorkloadAnalysisInput(
            members=[
                TeamMemberWorkload(userId="u1", userName="Alice", assignedTasks=12, estimatedHours=60.0),
                TeamMemberWorkload(userId="u2", userName="Bob", assignedTasks=3, estimatedHours=15.0)
            ],
            standardCapacityHours=40.0
        )
        result = WorkloadEngine.analyze_workload(input_data)
        self.assertEqual(result.overloadedCount, 1)
        self.assertEqual(result.members[0].isOverloaded, True)
        self.assertEqual(result.members[1].isOverloaded, False)

if __name__ == "__main__":
    unittest.main()
