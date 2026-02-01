import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Calendar, Brain } from "lucide-react";

export default function AICoach() {
  const { token } = useAuth();
  const [coaching, setCoaching] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const fetchCoachingAdvice = async () => {
    setLoadingCoach(true);
    try {
      const response = await fetch("/api/agent/coach", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCoaching(data.advice || "");
    } catch (error) {
      console.error("Error fetching coaching advice:", error);
    } finally {
      setLoadingCoach(false);
    }
  };

  const fetchSmartSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const response = await fetch("/api/agent/schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            AI Coach
          </h1>
          <p className="text-muted-foreground mt-2">
            Get AI-powered coaching and smart scheduling for optimal
            productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coaching Advice Card */}
          <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Productivity Coach</CardTitle>
              </div>
              <CardDescription>
                Get personalized coaching based on your productivity patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coaching ? (
                <div className="bg-white/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                  {coaching}
                </div>
              ) : (
                <div className="bg-white/50 rounded-lg p-4 text-sm text-muted-foreground text-center py-8">
                  Click below to get personalized coaching advice
                </div>
              )}
              <Button
                onClick={fetchCoachingAdvice}
                disabled={loadingCoach}
                className="w-full bg-primary hover:bg-primary-600"
              >
                {loadingCoach ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting advice...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Coaching
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Smart Scheduling Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <CardTitle>Smart Scheduling</CardTitle>
              </div>
              <CardDescription>
                AI will optimize your schedule based on your energy levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.length > 0 ? (
                <div className="space-y-2">
                  {schedule.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white/50 rounded-lg p-3 text-sm"
                    >
                      <p className="font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.start} - {item.end}
                      </p>
                      {item.reasoning && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {item.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 rounded-lg p-4 text-sm text-muted-foreground text-center py-8">
                  Click below to generate an optimized schedule
                </div>
              )}
              <Button
                onClick={fetchSmartSchedule}
                disabled={loadingSchedule}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loadingSchedule ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Schedule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
