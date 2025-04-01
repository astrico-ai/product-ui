import React from "react";
import { MainLayout } from "@/components/MainLayout";
import { Download, Clock, Star, Trophy, CheckCircle, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pendingScenarios = [
  {
    id: 1,
    title: "Handling an Angry Customer's Loan Default",
    description: "Learn to manage a heated conversation with a customer who's defaulted on their loan payments while maintaining professionalism and finding a resolution.",
    difficulty: "hard",
    timeInMinutes: 15,
    skills: ["Conflict Resolution", "Empathy", "Policy Communication"]
  },
  {
    id: 2,
    title: "Negotiating Two-Wheeler Loan Interest Rates",
    description: "Practice negotiating interest rates with a customer who's comparing rates with competitors while highlighting your product's unique benefits.",
    difficulty: "medium",
    timeInMinutes: 12,
    skills: ["Negotiation", "Product Knowledge", "Value Proposition"]
  },
  {
    id: 3,
    title: "Explaining Complex Loan Terms",
    description: "Master the art of breaking down complicated loan terms and conditions in simple language that customers can easily understand.",
    difficulty: "medium",
    timeInMinutes: 10,
    skills: ["Communication", "Product Knowledge", "Simplification"]
  },
  {
    id: 4,
    title: "Handling Service Delays",
    description: "Learn to manage customer expectations and provide timely updates during loan processing delays while maintaining customer satisfaction.",
    difficulty: "easy",
    timeInMinutes: 10,
    skills: ["Communication", "Expectation Management", "Problem Solving"]
  },
  {
    id: 5,
    title: "Upselling Financial Products",
    description: "Practice identifying opportunities to suggest relevant financial products based on customer needs without being pushy.",
    difficulty: "hard",
    timeInMinutes: 15,
    skills: ["Sales", "Need Analysis", "Product Knowledge"]
  }
];

const completedScenarios = [
  {
    id: 101,
    title: "Customer Retention Strategies",
    completedDate: "2024-04-15",
    score: 92,
  },
  {
    id: 102,
    title: "First-Time Borrower Guidance",
    completedDate: "2024-04-10",
    score: 88,
  },
  {
    id: 103,
    title: "Payment Default Resolution",
    completedDate: "2024-04-05",
    score: 95,
  }
];

const topPerformers = [
  { id: 1, name: "Rahul Sharma", score: 95, scenariosCompleted: 12, trend: "up" },
  { id: 2, name: "Priya Patel", score: 92, scenariosCompleted: 10, trend: "up" },
  { id: 3, name: "Amit Kumar", score: 88, scenariosCompleted: 11, trend: "down" },
  { id: 4, name: "Neha Verma", score: 87, scenariosCompleted: 9, trend: "up" },
  { id: 5, name: "Raj Singh", score: 85, scenariosCompleted: 8, trend: "same" }
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

export default function Training() {
  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#3551F3]/5 to-purple-50/50 rounded-2xl p-8 border border-[#3551F3]/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-[#3551F3]/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-[#3551F3]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">AI-Powered Training Scenarios</h1>
                <p className="text-gray-600">Practice real-life customer interactions with our AI agent to improve your skills.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Pending Scenarios Section */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Scenarios</h2>
                  <p className="text-sm text-gray-500 mt-1">Complete these scenarios to improve your customer service skills</p>
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
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#3551F3]" />
                            <span className="text-sm text-gray-600">{scenario.timeInMinutes} mins</span>
                          </div>
                        </div>
                        <Button className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#3551F3] text-white hover:bg-[#3551F3]/90">
                          Start Scenario
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performers Section */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
                  <p className="text-sm text-gray-500 mt-1">This month's best performers</p>
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
                    <div key={scenario.id} className="flex items-center justify-between py-2.5 group">
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
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 hover:bg-green-50/50">
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