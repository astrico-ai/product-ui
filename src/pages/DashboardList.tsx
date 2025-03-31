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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/MainLayout";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  ArrowLeft, 
  LayoutDashboard, 
  Pencil, 
  Share2, 
  Trash2,
  ChevronDown,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { 
  getDashboards, 
  updateDashboard, 
  deleteDashboard,
  saveDashboard,
  type Dashboard 
} from "@/utils/dashboardStorage";
import CreateDashboardModal from "@/components/dashboard/CreateDashboardModal";
import { Badge } from "@/components/ui/badge";

export default function DashboardList() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | null>(null);
  const [editName, setEditName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load dashboards from local storage on component mount
  useEffect(() => {
    setDashboards(getDashboards());
  }, []);

  const handleCreateDashboard = (dashboard: { name: string; description: string; isPublic: boolean; sharedWith: string[]; }) => {
    const newDashboard = saveDashboard({
      ...dashboard,
      owner: "Current User", // Replace with actual user info when available
    });
    setDashboards(getDashboards());
    setIsCreateModalOpen(false);
    navigate(`/dashboard/${newDashboard.id}`);
  };

  const filteredDashboards = dashboards
    .filter(dashboard =>
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.owner.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime()
          : new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
      }
    });

  const handleDelete = (dashboard: Dashboard) => {
    setDashboardToDelete(dashboard);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dashboardToDelete) {
      if (deleteDashboard(dashboardToDelete.id)) {
        setDashboards(getDashboards());
        setDeleteDialogOpen(false);
        setDashboardToDelete(null);
      }
    }
  };

  const handleEdit = (dashboard: Dashboard) => {
    setDashboardToEdit(dashboard);
    setEditName(dashboard.name);
    setEditDialogOpen(true);
  };

  const confirmEdit = () => {
    if (dashboardToEdit && editName.trim()) {
      const updated = updateDashboard(dashboardToEdit.id, { name: editName.trim() });
      if (updated) {
        setDashboards(getDashboards());
        setEditDialogOpen(false);
        setDashboardToEdit(null);
        setEditName("");
      }
    }
  };

  const toggleSort = (type: 'name' | 'date') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                  Dashboards
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and organize your analytics dashboards
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="h-10">
              <Plus className="mr-2 h-5 w-5" />
              Create Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => toggleSort('name')}>
                    {sortBy === 'name' ? (
                      sortOrder === 'asc' ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />
                    ) : null}
                    Sort by Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('date')}>
                    {sortBy === 'date' ? (
                      sortOrder === 'asc' ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />
                    ) : null}
                    Sort by Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-card rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%]">Dashboard Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDashboards.map((dashboard) => (
                <TableRow key={dashboard.id} className="hover:bg-accent/5">
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium hover:text-primary"
                      onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                    >
                      {dashboard.name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {dashboard.owner.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span>{dashboard.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dashboard.isPublic ? "default" : "secondary"}>
                      {dashboard.isPublic ? "Public" : "Private"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {format(parseISO(dashboard.lastUpdatedAt), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/${dashboard.id}`)}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          View Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(dashboard)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(dashboard)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDashboards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <LayoutDashboard className="h-8 w-8 mb-2" />
                      <p>No dashboards found</p>
                      <Button 
                        variant="link" 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2"
                      >
                        Create your first dashboard
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <CreateDashboardModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateDashboard}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Dashboard</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{dashboardToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Dashboard</DialogTitle>
              <DialogDescription>
                Enter a new name for your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Dashboard name"
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
} 