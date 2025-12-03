import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Globe, Lock } from "lucide-react";

export default function CreateDashboardModal({ open, onOpenChange, onSubmit, dataSource = "Marketing" }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [sharedEmails, setSharedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      isPublic,
      sharedEmails: !isPublic ? sharedEmails : [],
      dataSource
    });
    
    // Reset form
    setName("");
    setDescription("");
    setIsPublic(false);
    setSharedEmails([]);
    setNewEmail("");
    setStep(1);
  };

  const addEmail = (e) => {
    e.preventDefault();
    if (newEmail && !sharedEmails.includes(newEmail)) {
      setSharedEmails([...sharedEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmail = (email) => {
    setSharedEmails(sharedEmails.filter((e) => e !== email));
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setDescription("");
    setIsPublic(false);
    setSharedEmails([]);
    setNewEmail("");
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Dashboard</DialogTitle>
          <DialogDescription className="text-gray-500">
            {step === 1 ? 
              "Enter the basic information for your new dashboard." :
              "Choose visibility settings and share your dashboard."
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Dashboard Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a descriptive name"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this dashboard"
                className="w-full min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#3551F3] hover:bg-[#2B41D9] text-white"
                disabled={!name.trim()}
              >
                Next
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Visibility Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-4 rounded-lg border-2 text-left space-y-2 ${
                    !isPublic ? 'border-[#3551F3] bg-[#3551F3]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lock className={`h-5 w-5 ${!isPublic ? 'text-[#3551F3]' : 'text-gray-500'}`} />
                    <span className="font-medium">Private</span>
                  </div>
                  <p className="text-sm text-gray-500">Only invited members can access</p>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-4 rounded-lg border-2 text-left space-y-2 ${
                    isPublic ? 'border-[#3551F3] bg-[#3551F3]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className={`h-5 w-5 ${isPublic ? 'text-[#3551F3]' : 'text-gray-500'}`} />
                    <span className="font-medium">Public</span>
                  </div>
                  <p className="text-sm text-gray-500">Anyone with the link can view</p>
                </button>
              </div>
            </div>

            {!isPublic && (
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">Invite Members</Label>
                <div className="flex space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addEmail}
                    className="bg-[#3551F3] hover:bg-[#2B41D9] text-white"
                  >
                    Add
                  </Button>
                </div>
                {sharedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sharedEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                type="submit"
                className="bg-[#3551F3] hover:bg-[#2B41D9] text-white"
              >
                Create Dashboard
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 