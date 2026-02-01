import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskList } from "@/components/tasks/TaskList";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "Todo" | "In Progress" | "Done";
  priority?: "Low" | "Medium" | "High";
  deadline?: string;
  assignedTo?: string;
  teamId?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Socket.io for real-time updates
  useSocket((event) => {
    if (event.type === "TASK_UPDATED" || event.type === "BOTTLENECK_ALERT") {
      fetchTasks();
    }
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTasks();
  }, [user, token]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "Low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "In Progress":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome back, {user?.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              You have {todoTasks.length} tasks to do and{" "}
              {inProgressTasks.length} in progress
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground">
                {tasks.length}
              </div>
              <p className="text-muted-foreground text-sm">Total Tasks</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground">
                {inProgressTasks.length}
              </div>
              <p className="text-muted-foreground text-sm">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground">
                {doneTasks.length}
              </div>
              <p className="text-muted-foreground text-sm">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground">
                {tasks.filter((t) => t.priority === "High").length}
              </div>
              <p className="text-muted-foreground text-sm">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage and track your work</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
                <TabsTrigger value="todo">
                  To Do ({todoTasks.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress ({inProgressTasks.length})
                </TabsTrigger>
                <TabsTrigger value="done">
                  Done ({doneTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Circle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No tasks yet. Create one to get started!
                    </p>
                  </div>
                ) : (
                  <TaskList tasks={tasks} onTaskUpdate={fetchTasks} />
                )}
              </TabsContent>

              <TabsContent value="todo" className="space-y-3 mt-4">
                {todoTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">All caught up!</p>
                  </div>
                ) : (
                  <TaskList tasks={todoTasks} onTaskUpdate={fetchTasks} />
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="space-y-3 mt-4">
                {inProgressTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No tasks in progress
                    </p>
                  </div>
                ) : (
                  <TaskList tasks={inProgressTasks} onTaskUpdate={fetchTasks} />
                )}
              </TabsContent>

              <TabsContent value="done" className="space-y-3 mt-4">
                {doneTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No completed tasks yet
                    </p>
                  </div>
                ) : (
                  <TaskList tasks={doneTasks} onTaskUpdate={fetchTasks} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTaskCreated={fetchTasks}
      />
    </Layout>
  );
}
