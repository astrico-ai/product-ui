import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X as XIcon, Plus, Brain } from "lucide-react";
import { toast } from "sonner";

export default function AlertModal({ isOpen, onClose, widgetTitle }) {
  const [activeTab, setActiveTab] = useState("threshold");
  const [aiInput, setAiInput] = useState("");
  const [thresholdForm, setThresholdForm] = useState({
    name: "",
    condition: "",
    threshold: "",
    frequency: "",
    emails: []
  });
  // Add state for custom date
  const [scheduledForm, setScheduledForm] = useState({
    name: "",
    frequency: "",
    time: "",
    day: "",
    customDate: "",
    emails: []
  });

  const handleThresholdAiInterpret = () => {
    // Mock AI interpretation
    setThresholdForm({
      name: "Cost Alert",
      condition: "gt",
      threshold: "100000",
      frequency: "6",
      emails: []
    });
  };

  const handleScheduledAiInterpret = () => {
    // Mock AI interpretation
    setScheduledForm({
      name: "Daily Report",
      frequency: "daily",
      time: "09:00",
      day: "",
      emails: []
    });
  };

  const handleEmailAdd = (formType) => {
    if (formType === 'threshold') {
      setThresholdForm(prev => ({
        ...prev,
        emails: [...prev.emails, ""]
      }));
    } else {
      setScheduledForm(prev => ({
        ...prev,
        emails: [...prev.emails, ""]
      }));
    }
  };

  const handleEmailRemove = (formType, index) => {
    if (formType === 'threshold') {
      setThresholdForm(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    } else {
      setScheduledForm(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    }
  };

  const handleEmailChange = (formType, index, value) => {
    if (formType === 'threshold') {
      setThresholdForm(prev => ({
        ...prev,
        emails: prev.emails.map((email, i) => i === index ? value : email)
      }));
    } else {
      setScheduledForm(prev => ({
        ...prev,
        emails: prev.emails.map((email, i) => i === index ? value : email)
      }));
    }
  };

  // Add email input state
  const [emailInput, setEmailInput] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailKeyDown = (e, formType) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      e.preventDefault();
      const email = emailInput.trim();
      
      if (!email) return;

      if (!validateEmail(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (formType === 'threshold') {
        setThresholdForm(prev => ({
          ...prev,
          emails: [...prev.emails, email]
        }));
      } else {
        setScheduledForm(prev => ({
          ...prev,
          emails: [...prev.emails, email]
        }));
      }
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (formType, emailToRemove) => {
    if (formType === 'threshold') {
      setThresholdForm(prev => ({
        ...prev,
        emails: prev.emails.filter(email => email !== emailToRemove)
      }));
    } else {
      setScheduledForm(prev => ({
        ...prev,
        emails: prev.emails.filter(email => email !== emailToRemove)
      }));
    }
  };

  const renderEmailSection = (formType) => {
    const emails = formType === 'threshold' ? thresholdForm.emails : scheduledForm.emails;
    
    return (
      <div className="space-y-2">
        <div className="flex flex-col gap-1.5">
          <Label>Subscribers</Label>
        </div>
        <div className="space-y-2">
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(formType, email)}
                    className="hover:text-blue-900"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Input
            placeholder="Enter email address and press Enter"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const email = emailInput.trim();
                
                if (!email) return;

                if (!validateEmail(email)) {
                  toast.error("Please enter a valid email address");
                  return;
                }

                if (formType === 'threshold') {
                  setThresholdForm(prev => ({
                    ...prev,
                    emails: [...prev.emails, email]
                  }));
                } else {
                  setScheduledForm(prev => ({
                    ...prev,
                    emails: [...prev.emails, email]
                  }));
                }
                setEmailInput('');
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-none px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Create Alert</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6">
            <TabsList className="flex w-full">
              <TabsTrigger value="threshold" className="flex-1 rounded-none">Threshold</TabsTrigger>
              <TabsTrigger value="scheduled" className="flex-1 rounded-none">Scheduled</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <TabsContent value="threshold" className="space-y-6 mt-0 data-[state=inactive]:hidden">
              {/* AI Quick Setup */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium text-blue-500">Quick Setup with AI</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your alert, e.g., Alert me when cost > 100000 every 6 hours"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="flex-none" onClick={handleThresholdAiInterpret}>Interpret</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Alert Name</Label>
                  <Input
                    placeholder="Enter alert name"
                    value={thresholdForm.name}
                    onChange={(e) => setThresholdForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={thresholdForm.condition}
                    onValueChange={(value) => setThresholdForm(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Greater than</SelectItem>
                      <SelectItem value="gte">Greater than or equal to</SelectItem>
                      <SelectItem value="lt">Less than</SelectItem>
                      <SelectItem value="lte">Less than or equal to</SelectItem>
                      <SelectItem value="eq">Equal to</SelectItem>
                      <SelectItem value="neq">Not equal to</SelectItem>
                      <SelectItem value="change">Changes by (%)</SelectItem>
                      <SelectItem value="increase">Increases by (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Threshold Value</Label>
                    <Input
                      type="number"
                      placeholder="Enter threshold value"
                      value={thresholdForm.threshold}
                      onChange={(e) => setThresholdForm(prev => ({ ...prev, threshold: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Check Frequency</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Every</span>
                      <Input
                        type="number"
                        className="w-20"
                        value={thresholdForm.frequency}
                        onChange={(e) => setThresholdForm(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                  </div>
                </div>

                {renderEmailSection('threshold')}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6 mt-0 data-[state=inactive]:hidden">
              {/* AI Quick Setup */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium text-blue-500">Quick Setup with AI</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your schedule, e.g., Send me a report every Monday at 9 AM"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="flex-none" onClick={handleScheduledAiInterpret}>Interpret</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Alert Name</Label>
                  <Input
                    placeholder="Enter alert name"
                    value={scheduledForm.name}
                    onChange={(e) => setScheduledForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={scheduledForm.frequency}
                      onValueChange={(value) => setScheduledForm(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={scheduledForm.time}
                      onChange={(e) => setScheduledForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                {scheduledForm.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select
                      value={scheduledForm.day}
                      onValueChange={(value) => setScheduledForm(prev => ({ ...prev, day: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {scheduledForm.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Select
                      value={scheduledForm.day}
                      onValueChange={(value) => setScheduledForm(prev => ({ ...prev, day: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {scheduledForm.frequency === 'custom' && (
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={scheduledForm.customDate}
                      onChange={(e) => setScheduledForm(prev => ({ ...prev, customDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}

                {renderEmailSection('scheduled')}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 p-6 border-t flex-none bg-gray-50">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Create Alert</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 