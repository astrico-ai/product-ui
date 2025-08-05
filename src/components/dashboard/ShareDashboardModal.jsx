import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Building, Globe, Lock } from "lucide-react";

export default function ShareDashboardModal({ isOpen, onClose, dashboardName = "Dashboard" }) {
  const [emailInput, setEmailInput] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([
    { email: "sanuj@astrico.ai", name: "Sanuj Philip", role: "owner", isOwner: true },
    { email: "nayan@astrico.ai", name: "Nayan Jain", role: "editor" }
  ]);
  const [generalAccess, setGeneralAccess] = useState({
    type: "restricted",
    role: "viewer"
  });

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      e.preventDefault();
      const email = emailInput.trim();
      
      if (!validateEmail(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (invitedUsers.some(user => user.email === email)) {
        toast.error("This user has already been invited");
        return;
      }

      setInvitedUsers([...invitedUsers, { email, role: "viewer" }]);
      setEmailInput("");
    }
  };

  const handleRoleChange = (email, newRole) => {
    if (newRole === 'remove') {
      setInvitedUsers(invitedUsers.filter(user => user.email !== email));
      return;
    }
    
    setInvitedUsers(invitedUsers.map(user => 
      user.email === email ? { ...user, role: newRole } : user
    ));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://your-app.com/dashboard/share/abc123");
    toast.success("Link copied to clipboard");
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getRandomColor = (email) => {
    const colors = [
      'bg-red-400', 'bg-green-400', 'bg-blue-400', 
      'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'
    ];
    const index = email.length % colors.length;
    return colors[index];
  };

  const getGeneralAccessIcon = () => {
    switch (generalAccess.type) {
      case "anyone":
        return <Globe className="h-5 w-5 text-blue-600" />;
      case "company":
        return <Building className="h-5 w-5 text-blue-600" />;
      default:
        return <Lock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getGeneralAccessText = () => {
    switch (generalAccess.type) {
      case "anyone":
        return "Anyone with the link";
      case "company":
        return "Anyone in the company with the link";
      default:
        return "Restricted";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-6">
          <div className="mb-6">
            <DialogTitle className="text-xl">Share '{dashboardName}'</DialogTitle>
          </div>

          {/* Add People Input */}
          <div className="mb-8">
            <Input
              className="w-full px-4 py-3 text-base"
              placeholder="Add people and groups"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
            />
          </div>

          {/* Update People with Access section */}
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">People with access</h3>
            <div className="space-y-4">
              {invitedUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${getRandomColor(user.email)}`}>
                      {getInitial(user.name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                        {user.isOwner && " (you)"}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="min-w-[100px] flex justify-end">
                    {user.isOwner ? (
                      <div className="text-sm text-gray-600 h-8 flex items-center">Owner</div>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.email, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8 focus:ring-0 focus:ring-offset-0 border-none data-[state=active]:border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer" className="text-sm">Viewer</SelectItem>
                          <SelectItem value="commenter" className="text-sm">Commenter</SelectItem>
                          <SelectItem value="editor" className="text-sm">Editor</SelectItem>
                          <SelectItem
                            value="remove"
                            className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            Remove access
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update General Access section */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">General access</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  {getGeneralAccessIcon()}
                </div>
                <div>
                  <Select
                    value={generalAccess.type}
                    onValueChange={(value) => setGeneralAccess({ ...generalAccess, type: value })}
                  >
                    <SelectTrigger className="border-0 p-0 h-auto hover:bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 data-[state=active]:border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restricted" className="text-sm">Restricted</SelectItem>
                      <SelectItem value="company" className="text-sm">Anyone in Company</SelectItem>
                      <SelectItem value="anyone" className="text-sm">Anyone with the link</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-500">{getGeneralAccessText()}</div>
                </div>
              </div>
              {generalAccess.type !== "restricted" && (
                <Select
                  value={generalAccess.role}
                  onValueChange={(value) => setGeneralAccess({ ...generalAccess, role: value })}
                >
                  <SelectTrigger className="w-[120px] h-8 focus:ring-0 focus:ring-offset-0 border-none data-[state=active]:border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer" className="text-sm">Viewer</SelectItem>
                    <SelectItem value="commenter" className="text-sm">Commenter</SelectItem>
                    <SelectItem value="editor" className="text-sm">Editor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleCopyLink}
          >
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 