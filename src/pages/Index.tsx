import { MainLayout } from "@/components/MainLayout";
import { SearchInput } from "@/components/SearchInput";
import { VideoCard } from "@/components/VideoCard";
import { TrainingCard } from "@/components/TrainingCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";

const Index = () => {
  return (
    <MainLayout userName="Vraj" greeting="Good evening">
      <div className="max-w-6xl animate-slide-up">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Enterprise Knowledge Hub</h1>
          <p className="text-muted-foreground text-lg mb-8">Find and access all your company information in one place</p>
          <SearchInput />
        </div>
        
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Recommended for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1">
            <VideoCard 
              title="New HL Interest Rates" 
              description="please make sure to watch this video about change in the HL interest rates. Connect with John Doe if any doubts" 
              thumbnailUrl="/lovable-uploads/022f9b48-bc94-41b5-b63b-b1c88d0b94b0.png" 
            />
          </div>
          <div className="lg:col-span-1">
            <TrainingCard />
          </div>
          <div className="lg:col-span-1">
            <LeaderboardCard />
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Company Announcements</h2>
          <AnnouncementCard />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
