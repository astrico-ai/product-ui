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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/MainLayout";
import { MoreHorizontal, Plus, Search, LayoutDashboard, Filter, Share2 } from "lucide-react";
import CreateDashboardModal from "@/components/dashboard/CreateDashboardModal";
import { Badge } from "@/components/ui/badge";

// Use a separate storage key for insurance dashboards
const STORAGE_KEY = 'insurance_dashboards';

// Helper functions to get and save insurance dashboards
const getInsuranceDashboards = () => {
  const dashboardsJson = localStorage.getItem(STORAGE_KEY);
  return dashboardsJson ? JSON.parse(dashboardsJson) : [];
};

const saveInsuranceDashboards = (dashboards) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
};

// Insurance dashboard management functions
const listInsuranceDashboards = () => {
  return getInsuranceDashboards();
};

const createInsuranceDashboard = (data) => {
  const dashboards = getInsuranceDashboards();
  const newDashboard = {
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [],
    ...data,
  };
  
  dashboards.push(newDashboard);
  saveInsuranceDashboards(dashboards);
  return newDashboard;
};

const deleteInsuranceDashboard = (id) => {
  const dashboards = getInsuranceDashboards();
  const filteredDashboards = dashboards.filter(d => d.id !== id);
  saveInsuranceDashboards(filteredDashboards);
};

export default function InsuranceDashboardList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dashboards, setDashboards] = useState([]);

  useEffect(() => {
    const loadDashboards = () => {
      const storedDashboards = listInsuranceDashboards();
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
    const newDashboard = createInsuranceDashboard({
      name: data.name,
      description: data.description,
      settings: {
        visibility: data.isPublic ? 'public' : 'private',
        sharedWith: data.sharedEmails
      }
    });
    setDashboards([...dashboards, newDashboard]);
    setIsCreateModalOpen(false);
    navigate(`/insurance/dashboard/${newDashboard.id}`);
  };

  const handleDeleteDashboard = (id) => {
    deleteInsuranceDashboard(id);
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
          <LayoutDashboard className="h-5 w-5 text-[#3551F3]" />
          <h1 className="text-xl font-semibold text-gray-900">Insurance Dashboards</h1>
        </div>
        <p className="text-gray-500 mb-8">Manage and organize your insurance analytics dashboards</p>

        {/* Search and Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dashboards..."
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
                    No dashboards found. Create your first dashboard to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sortedDashboards.map((dashboard) => (
                  <TableRow key={dashboard.id} className="hover:bg-gray-50">
                    <TableCell>
                      <a 
                        href={`/insurance/dashboard/${dashboard.id}`}
                        className="text-[#3551F3] hover:underline font-medium"
                      >
                        {dashboard.name}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#3551F3]/10 flex items-center justify-center text-xs text-[#3551F3] font-medium">
                          CU
                        </div>
                        <span className="text-gray-600">Current User</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className="bg-[#3551F3] text-white hover:bg-[#2B41D9]"
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
                          <DropdownMenuItem onClick={() => navigate(`/insurance/dashboard/${dashboard.id}`)}>
                            Edit
                          </DropdownMenuItem>
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