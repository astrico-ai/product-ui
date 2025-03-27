import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Sources() {
  const handleConnect = () => {
    // Open in a new tab
    window.open('/auth/google', '_blank');
  };

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Sources</h1>
          <p className="text-muted-foreground">
            Connect your marketing and analytics accounts
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-lg bg-[#4285F4] flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21.0713 10.4284H19.2856V8.57129H17.5V10.4284H15.7144V12.1427H17.5V13.9998H19.2856V12.1427H21.0713V10.4284Z"
                      fill="white"
                    />
                    <path
                      d="M9.28571 10.4284C11.1283 10.4284 12.8571 8.69957 12.8571 6.857C12.8571 5.01443 11.1283 3.28557 9.28571 3.28557C7.44314 3.28557 5.71429 5.01443 5.71429 6.857C5.71429 8.69957 7.44314 10.4284 9.28571 10.4284Z"
                      fill="white"
                    />
                    <path
                      d="M9.28571 12.1427C6.21429 12.1427 0 13.687 0 16.7584V20.7141H18.5714V16.7584C18.5714 13.687 12.3571 12.1427 9.28571 12.1427Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Google Ads</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Google Ads accounts
                  </p>
                </div>
              </div>
              <div className="flex-1" />
              <Button 
                onClick={handleConnect}
                className="w-full"
              >
                Connect
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 