import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import CreateDashboardModal from "@/components/dashboard/CreateDashboardModal";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";

interface Dashboard {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  sharedWith: string[];
  createdAt: string;
}

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const navigate = useNavigate();

  const handleCreateDashboard = (dashboard: Omit<Dashboard, "id" | "createdAt">) => {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setDashboards([...dashboards, newDashboard]);
    setIsCreateModalOpen(false);
    navigate(`/dashboard/${newDashboard.id}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboards</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card
              key={dashboard.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard/${dashboard.id}`)}
            >
              <CardHeader>
                <CardTitle>{dashboard.name}</CardTitle>
                <CardDescription>{dashboard.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{dashboard.isPublic ? "Public" : "Private"}</span>
                  {!dashboard.isPublic && (
                    <span>• {dashboard.sharedWith.length} shared</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CreateDashboardModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateDashboard}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard; 