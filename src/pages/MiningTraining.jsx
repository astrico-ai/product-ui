import React, { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Download, Clock, Star, Trophy, CheckCircle, ArrowRight, GraduationCap, Building2, Factory, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MiningTrainingReportModal } from "@/components/MiningTrainingReportModal";
import { TrainingScenario } from "@/components/TrainingScenario";
import { TrainingIframeModal } from "@/components/TrainingIframeModal";

const pendingScenarios = [
  {
    id: 1,
    title: "Strategic Sales Negotiation Drill",
    description: "Practice high-stakes negotiations with key industry decision-makers. Focus on value proposition, technical specifications, and long-term partnership benefits.",
    difficulty: "hard",
    timeInMinutes: 20,
    skills: ["Negotiation", "Value Selling", "Technical Knowledge"],
    icon: Building2
  },
  {
    id: 2,
    title: "Handling Procurement Pushback on New Vendor Onboarding",
    description: "Learn to address common procurement objections, demonstrate compliance requirements, and navigate vendor registration processes effectively.",
    difficulty: "medium",
    timeInMinutes: 15,
    skills: ["Objection Handling", "Process Knowledge", "Stakeholder Management"],
    icon: Factory
  },
  {
    id: 3,
    title: "Pitching a New Product Line to a Resistant Plant Head",
    description: "Master the art of presenting technical innovations to experienced plant heads. Focus on operational benefits, ROI, and implementation ease.",
    difficulty: "hard",
    timeInMinutes: 25,
    skills: ["Technical Selling", "ROI Analysis", "Change Management"],
    icon: Users
  },
  {
    id: 4,
    title: "Reviving a Dormant Industrial Client Relationship",
    description: "Develop strategies to re-engage with inactive clients, understand their current challenges, and present relevant solutions.",
    difficulty: "medium",
    timeInMinutes: 18,
    skills: ["Relationship Building", "Need Analysis", "Solution Selling"],
    icon: Briefcase
  }
//   {
//     id: 5,
//     title: "Technical Product Demo for Mining Engineers",
//     description: "Practice delivering compelling product demonstrations focusing on technical specifications, performance metrics, and practical applications.",
//     difficulty: "medium",
//     timeInMinutes: 20,
//     skills: ["Product Knowledge", "Technical Communication", "Demo Skills"]
//   }
];

const completedScenarios = [
  {
    id: 101,
    title: "Strategic Negotiation Drill",
    completedDate: "2024-04-15",
    score: 70,
  },
  {
    id: 102,
    title: "Cost Optimization Presentation",
    completedDate: "2024-04-10",
    score: 89,
  },
  {
    id: 103,
    title: "Equipment Upgrade Proposal",
    completedDate: "2024-04-05",
    score: 92,
  }
];

const topPerformers = [
  { id: 1, name: "Mohit Sharma", score: 94, scenariosCompleted: 8, trend: "up" },
  { id: 2, name: "Kavita Mehta", score: 92, scenariosCompleted: 7, trend: "up" },
  { id: 3, name: "Rohit Nair", score: 90, scenariosCompleted: 6, trend: "down" },
  { id: 4, name: "Ankit Sharma", score: 88, scenariosCompleted: 6, trend: "up" },
  { id: 5, name: "Megha Rao", score: 86, scenariosCompleted: 5, trend: "same" }
];

function DifficultyBadge({ difficulty }) {
  const styles = {
    easy: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    hard: "bg-purple-50 text-purple-700 border-purple-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

export default function MiningTraining() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false);
  const videoUrl = "https://drive.google.com/file/d/1YbLMB-q8jhMJGB6-HrZrYNIM65HPwe4b/view";

  const handleStartScenario = (scenario) => {
    setSelectedScenario(scenario);
    setIsIframeModalOpen(true);
  };

  const handleDownloadReport = (scenario) => {
    setSelectedScenario(scenario);
    setIsReportOpen(true);
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Video Player */}
        <VideoPlayer
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={videoUrl}
        />

        {/* Training Scenario Modal */}
        <TrainingScenario
          isOpen={isTrainingOpen}
          onClose={() => setIsTrainingOpen(false)}
          scenario={selectedScenario}
        />

        {/* Training Iframe Modal */}
        <TrainingIframeModal
          isOpen={isIframeModalOpen}
          onClose={() => setIsIframeModalOpen(false)}
          scenario={selectedScenario}
        />

        {/* Report Modal */}
        <MiningTrainingReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          scenario={selectedScenario}
        />

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#3551F3]/5 to-purple-50/50 rounded-2xl p-8 border border-[#3551F3]/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-[#3551F3]/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#3551F3]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">B2B Industry Sales Training</h1>
                <p className="text-gray-600">Master complex B2B sales scenarios with our AI-powered training simulations.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Pending Scenarios Section */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Training Scenarios</h2>
                  <p className="text-sm text-gray-500 mt-1">Practice real-world B2B industry sales situations</p>
                </div>
                
                <div className="p-8 space-y-5">
                  {pendingScenarios.map((scenario) => (
                    <div key={scenario.id} className="group p-6 rounded-xl border border-gray-100 hover:border-[#3551F3]/20 hover:bg-[#3551F3]/[0.02] transition-all">
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-[#3551F3] transition-colors">{scenario.title}</h3>
                            <DifficultyBadge difficulty={scenario.difficulty} />
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{scenario.description}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-[#3551F3]" />
                              <span className="text-sm text-gray-600">{scenario.timeInMinutes} mins</span>
                            </div>
                            <div className="flex gap-2">
                              {scenario.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="bg-gray-50">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#3551F3] text-white hover:bg-[#3551F3]/90"
                          onClick={() => handleStartScenario(scenario)}
                        >
                          Start Scenario
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Top Performers Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
                  <p className="text-sm text-gray-500 mt-1">Leading sales professionals this month</p>
                </div>
                
                <div className="px-8 py-6 space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between py-2.5 group">
                      <div className="flex items-center gap-3">
                        {index < 3 ? (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            index === 0 ? 'bg-amber-50 text-amber-600' :
                            index === 1 ? 'bg-slate-50 text-slate-600' :
                            'bg-orange-50 text-orange-600'
                          } group-hover:scale-110 transition-transform`}>
                            <Trophy className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                          <div className="text-xs text-gray-500">{performer.scenariosCompleted} scenarios</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{performer.score}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Scenarios Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-emerald-50/30">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
                    <p className="text-sm text-gray-500 mt-1">Your finished scenarios</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 hover:bg-green-50/50">
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                </div>
                
                <div className="px-8 py-6 space-y-4">
                  {completedScenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{scenario.title}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(scenario.completedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{scenario.score}%</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-gray-900 hover:bg-green-50/50"
                          onClick={() => handleDownloadReport(scenario)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 