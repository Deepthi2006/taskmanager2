import { Router } from "express";
import { Task } from "../models/Task";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { connectDB } from "../db";

const router = Router();

// Middleware
router.use(authMiddleware);

// GET all tasks for current user
router.get("/", async (req: AuthRequest, res) => {
  try {
    await connectDB();
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user?.id, isDeleted: false },
        { teamId: { $ne: null }, isDeleted: false },
      ],
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res
      .status(500)
      .json({
        message:
          error instanceof Error ? error.message : "Failed to fetch tasks",
      });
  }
});

// GET single task
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    await connectDB();
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access: owner or team member
    if (task.assignedTo?.toString() !== req.user?.id && !task.teamId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res
      .status(500)
      .json({
        message:
          error instanceof Error ? error.message : "Failed to fetch task",
      });
  }
});

// CREATE task
router.post("/", async (req: AuthRequest, res) => {
  try {
    await connectDB();
    const { title, description, priority, teamId, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Create task with AI analysis (basic version)
    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || "Medium",
      teamId: teamId || null,
      projectId: projectId || null,
      assignedTo: req.user?.id,
      isPrivate: !teamId,
      // AI fields will be populated by background job in real implementation
      aiPriorityReasoning: `Auto-analyzed: ${title}`,
      aiEstimatedDuration: 60,
      aiConfidenceScore: 80,
      aiTags: [],
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res
      .status(500)
      .json({
        message:
          error instanceof Error ? error.message : "Failed to create task",
      });
  }
});

// UPDATE task
router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    await connectDB();
    const { status, priority, description } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.assignedTo?.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update fields
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (description) task.description = description;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res
      .status(500)
      .json({
        message:
          error instanceof Error ? error.message : "Failed to update task",
      });
  }
});

// DELETE task (soft delete)
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await connectDB();
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.assignedTo?.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res
      .status(500)
      .json({
        message:
          error instanceof Error ? error.message : "Failed to delete task",
      });
  }
});

export default router;
