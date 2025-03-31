import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Users, Globe, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dashboard: {
    name: string;
    description: string;
    isPublic: boolean;
    sharedWith: string[];
  }) => void;
}

const CreateDashboardModal = ({ open, onOpenChange, onSubmit }: CreateDashboardModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      isPublic,
      sharedWith: isPublic ? [] : sharedEmails,
    });
  };

  const addEmail = () => {
    if (newEmail && !sharedEmails.includes(newEmail)) {
      setSharedEmails([...sharedEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setSharedEmails(sharedEmails.filter((e) => e !== email));
  };

  const handleNext = () => {
    if (name.trim() && description.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Create a custom dashboard to visualize and track your analytics data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sales Analytics"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this dashboard..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                <Label>Visibility Settings</Label>
                <div className="grid gap-4">
                  <button
                    type="button"
                    className={cn(
                      "flex items-start space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors",
                      isPublic && "border-primary bg-primary/5"
                    )}
                    onClick={() => setIsPublic(true)}
                  >
                    <Globe className={cn(
                      "h-5 w-5 mt-0.5",
                      isPublic ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 space-y-1 text-left">
                      <p className="font-medium leading-none">Public Dashboard</p>
                      <p className="text-sm text-muted-foreground">
                        Anyone with the link can view this dashboard
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex items-start space-x-4 rounded-lg border p-4 hover:bg-accent transition-colors",
                      !isPublic && "border-primary bg-primary/5"
                    )}
                    onClick={() => setIsPublic(false)}
                  >
                    <Lock className={cn(
                      "h-5 w-5 mt-0.5",
                      !isPublic ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 space-y-1 text-left">
                      <p className="font-medium leading-none">Private Dashboard</p>
                      <p className="text-sm text-muted-foreground">
                        Only shared users can access this dashboard
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {!isPublic && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Share with Team Members
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {sharedEmails.length} member{sharedEmails.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="pl-9"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addEmail();
                          }
                        }}
                      />
                    </div>
                    <Button type="button" onClick={addEmail} variant="secondary">
                      Add
                    </Button>
                  </div>
                  {sharedEmails.length > 0 && (
                    <div className="space-y-2">
                      {sharedEmails.map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between rounded-lg border bg-card p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {email[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{email}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEmail(email)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit">
                  Create Dashboard
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDashboardModal; 