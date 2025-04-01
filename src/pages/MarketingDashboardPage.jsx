import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/MainLayout";
import { MoreHorizontal, Plus, Search, PieChart, Filter, Share2 } from "lucide-react";
import CreateDashboardModal from "@/components/dashboard/CreateDashboardModal";
import { Badge } from "@/components/ui/badge";
import { listDashboards, createDashboard, deleteDashboard } from "@/utils/dashboardStorage";

// Use a separate storage key for marketing dashboards
const STORAGE_KEY = 'marketing_dashboards';

// Helper functions to get and save marketing dashboards
const getMarketingDashboards = () => {
  const dashboardsJson = localStorage.getItem(STORAGE_KEY);
  return dashboardsJson ? JSON.parse(dashboardsJson) : [];
};

const saveMarketingDashboards = (dashboards) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
};

// Marketing dashboard management functions
const listMarketingDashboards = () => {
  return getMarketingDashboards();
};

const createMarketingDashboard = (data) => {
  const dashboards = getMarketingDashboards();
  const newDashboard = {
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [],
    ...data,
  };
  
  dashboards.push(newDashboard);
  saveMarketingDashboards(dashboards);
  return newDashboard;
};

const deleteMarketingDashboard = (id) => {
  const dashboards = getMarketingDashboards();
  const filteredDashboards = dashboards.filter(d => d.id !== id);
  saveMarketingDashboards(filteredDashboards);
};

// Sample marketing dashboards for initial setup
const sampleDashboards = [
  {
    id: "mkt1",
    name: "Marketing Performance Overview",
    description: "Key metrics and KPIs for marketing campaigns",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-05-21").toISOString(),
    settings: { visibility: "public" },
    widgets: []
  },
  {
    id: "mkt2",
    name: "Campaign ROI Analysis",
    description: "Detailed ROI breakdown by channel and campaign",
    createdAt: new Date("2024-02-10").toISOString(),
    updatedAt: new Date("2024-05-18").toISOString(),
    settings: { visibility: "private" },
    widgets: []
  },
  {
    id: "mkt3",
    name: "Quarterly Marketing Report",
    description: "Q2 2024 marketing performance summary",
    createdAt: new Date("2024-04-01").toISOString(),
    updatedAt: new Date("2024-05-15").toISOString(),
    settings: { visibility: "public" },
    widgets: []
  }
];

export default function MarketingDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dashboards, setDashboards] = useState([]);

  // Initialize with sample marketing dashboards if none exist
  useEffect(() => {
    const loadDashboards = () => {
      let storedDashboards = listMarketingDashboards();
      
      // Add sample dashboards if none exist
      if (storedDashboards.length === 0) {
        saveMarketingDashboards(sampleDashboards);
        storedDashboards = sampleDashboards;
      }
      
      setDashboards(storedDashboards);
    };
    loadDashboards();
  }, []);

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const handleCreateDashboard = (data) => {
    const newDashboard = createMarketingDashboard({
      name: data.name,
      description: data.description,
      settings: {
        visibility: data.isPublic ? 'public' : 'private',
        sharedWith: data.sharedEmails
      }
    });
    setDashboards([...dashboards, newDashboard]);
    setIsCreateModalOpen(false);
    navigate(`/marketing/dashboard/${newDashboard.id}`);
  };

  const handleDeleteDashboard = (id) => {
    deleteMarketingDashboard(id);
    setDashboards(dashboards.filter(d => d.id !== id));
  };

  // Filter dashboards based on search query
  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort dashboards
  const sortedDashboards = [...filteredDashboards].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc'
        ? new Date(a.updatedAt) - new Date(b.updatedAt)
        : new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Header Section */}
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="h-5 w-5 text-[#3551F3]" />
          <h1 className="text-xl font-semibold text-gray-900">Marketing Dashboards</h1>
        </div>
        <p className="text-gray-500 mb-8">Analyze and visualize your marketing data and campaigns</p>

        {/* Search and Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search marketing dashboards..."
                className="pl-9 h-10 bg-white border-gray-200 w-full focus-visible:ring-[#3551F3]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="h-10 px-4 border-gray-200 hover:bg-gray-50 gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#3551F3] hover:bg-[#2B41D9] text-white h-10 px-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Dashboard
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium text-gray-500">Dashboard Name</TableHead>
                <TableHead className="font-medium text-gray-500">Owner</TableHead>
                <TableHead className="font-medium text-gray-500">Status</TableHead>
                <TableHead className="font-medium text-gray-500">Last Updated</TableHead>
                <TableHead className="font-medium text-gray-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDashboards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No marketing dashboards found. Create your first dashboard to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sortedDashboards.map((dashboard) => (
                  <TableRow key={dashboard.id} className="hover:bg-gray-50">
                    <TableCell>
                      <a 
                        href={`/marketing/dashboard/${dashboard.id}`}
                        className="text-[#3551F3] hover:underline font-medium"
                      >
                        {dashboard.name}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#3551F3]/10 flex items-center justify-center text-xs text-[#3551F3] font-medium">
                          VR
                        </div>
                        <span className="text-gray-600">Vraj</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={dashboard.settings?.visibility === 'public' 
                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                      >
                        {dashboard.settings?.visibility === 'public' ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(dashboard.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/marketing/dashboard/${dashboard.id}`)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteDashboard(dashboard.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateDashboardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateDashboard}
      />
    </MainLayout>
  );
} 