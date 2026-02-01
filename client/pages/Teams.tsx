import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

export default function Teams() {
  const [teams] = useState([]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Teams
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your teams for better collaboration
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>

        {teams.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No teams yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first team to collaborate with others
              </p>
              <Button className="bg-primary hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
}
