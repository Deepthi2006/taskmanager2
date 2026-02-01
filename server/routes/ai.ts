import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Task } from "../models/Task";
import { connectDB } from "../db";

const router = Router();

router.use(authMiddleware);

// GET coaching advice
router.get("/coach", async (req: AuthRequest, res) => {
  try {
    await connectDB();

    // Fetch last 30 completed tasks
    const completedTasks = await Task.find({
      assignedTo: req.user?.id,
      status: "Done",
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .limit(30);

    if (completedTasks.length === 0) {
      return res.json({
        advice: "Complete some tasks to get personalized coaching advice!",
      });
    }

    // Calculate stats
    const totalTime = completedTasks.reduce(
      (sum, t) => sum + (t.totalTimeSpent || 0),
      0,
    );
    const averageTime = totalTime / completedTasks.length;
    const highPriorityCount = completedTasks.filter(
      (t) => t.priority === "High",
    ).length;

    // Generate coaching advice based on patterns
    let advice = "Based on your task completion patterns:\n\n";

    if (averageTime > 120) {
      advice +=
        "⏱️ Your tasks take an average of " +
        Math.round(averageTime) +
        " minutes. Consider breaking larger tasks into smaller subtasks for better focus.\n\n";
    }

    if (highPriorityCount > completedTasks.length * 0.5) {
      advice +=
        "⚠️ You're completing a lot of high-priority tasks. Make sure to schedule some lower-priority items to maintain balance.\n\n";
    }

    advice +=
      "✅ Great job completing " +
      completedTasks.length +
      " tasks! Keep up the momentum!";

    res.json({ advice });
  } catch (error) {
    console.error("Coaching error:", error);
    res
      .status(500)
      .json({ advice: "Focus on your most important tasks today!" });
  }
});

// POST smart schedule
router.post("/schedule", async (req: AuthRequest, res) => {
  try {
    await connectDB();

    // Fetch pending tasks
    const pendingTasks = await Task.find({
      assignedTo: req.user?.id,
      status: "Todo",
      isDeleted: false,
    })
      .sort({ priority: -1 })
      .limit(10);

    if (pendingTasks.length === 0) {
      return res.json({ schedule: [] });
    }

    // Simple scheduling algorithm
    const schedule = [];
    let currentHour = 9; // Start at 9 AM

    for (const task of pendingTasks) {
      const estimatedMinutes = task.aiEstimatedDuration || 60;
      const endHour = currentHour + Math.ceil(estimatedMinutes / 60);

      if (endHour <= 17) {
        // Work until 5 PM
        schedule.push({
          title: task.title,
          start: currentHour + ":00",
          end: endHour + ":00",
          reasoning: `Scheduled based on ${task.priority} priority and estimated ${estimatedMinutes} minutes`,
        });
        currentHour = endHour;
      }
    }

    res.json({ schedule });
  } catch (error) {
    console.error("Schedule error:", error);
    res.status(500).json({ schedule: [] });
  }
});

export default router;
