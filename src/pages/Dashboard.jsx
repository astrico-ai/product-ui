import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import CreateDashboardModal from "@/components/dashboard/CreateDashboardModal";
import { MainLayout } from "@/components/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Dashboard</CardTitle>
              <CardDescription>Last modified: 2 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a sample dashboard description.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 