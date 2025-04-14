import { MainLayout } from "@/components/MainLayout";
import React, { useState } from 'react';
import { FaTrophy, FaMedal, FaCertificate, FaUserCircle, FaChartLine, FaCrown, FaArrowRight } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock data
const challenges = {
  ongoing: [
    {
      id: 1,
      title: "NPS Champion of the Year",
      description: "Compete to enroll the highest number of NPS customers",
      duration: "Full Financial Year",
      prize: "Marriott Family Dinner Vouchers & Certificate",
      progress: 65,
      participants: 120,
      target: 15,
      icon: <FaTrophy className="text-3xl text-yellow-500" />,
      lastWinner: {
        name: "Priya Sharma",
        achievement: "15/15 NPS Accounts",
        prize: "Marriott Family Dinner Vouchers & Certificate"
      },
      leaderboard: [
        { 
          position: 1, 
          name: "Rajesh Kumar", 
          sales: 14,
          initials: "1"
        },
        { 
          position: 2, 
          name: "Anita Desai", 
          sales: 12,
          initials: "2"
        },
        { 
          position: 3, 
          name: "Suresh Patel", 
          sales: 11,
          initials: "3"
        },
        { 
          position: 4, 
          name: "You", 
          sales: 9,
          initials: "4"
        },
        { 
          position: 5, 
          name: "Meera Singh", 
          sales: 8,
          initials: "5"
        }
      ],
      prizeDistribution: [
        { position: 1, prize: "Marriott Family Dinner Vouchers & Certificate" },
        { position: 2, prize: "₹5000 Vouchers & Certificate" },
        { position: 3, prize: "₹3000 Vouchers & Certificate" }
      ],
      motivationalPrompt: "Just 3 more sales to overtake 2nd spot!"
    },
    {
      id: 2,
      title: "Inclusive Banking Branch Championship",
      description: "Branch with highest combined inclusive banking product sales",
      duration: "Full Financial Year",
      prize: "Branch Trophy & ₹500 Vouchers",
      progress: 45,
      participants: 25,
      icon: <FaMedal className="text-3xl text-blue-500" />,
      lastWinner: {
        name: "Mumbai Fort Branch",
        achievement: "580 Inclusive Banking Policies",
        prize: "Branch Trophy & ₹5000 Vouchers"
      },
      leaderboard: [
        { position: 1, name: "Mumbai Andheri Branch", sales: 120, avatar: "X" },
        { position: 2, name: "Mumbai Bandra Branch", sales: 115, avatar: "Y" },
        { position: 3, name: "Your Branch", sales: 110, avatar: "Y" },
        { position: 4, name: "Mumbai Dadar Branch", sales: 95, avatar: "Z" },
        { position: 5, name: "Mumbai Worli Branch", sales: 90, avatar: "W" }
      ],
      prizeDistribution: [
        { position: 1, prize: "Branch Trophy & ₹5000 Vouchers" },
        { position: 2, prize: "₹3000 Vouchers" },
        { position: 3, prize: "₹2000 Vouchers" }
      ],
      motivationalPrompt: "Just 5 more policies to reach the top spot!"
    }
  ],
  upcoming: [
    {
      id: 3,
      title: "Sukanya 5X Drive",
      description: "Sell 5 Sukanya Samriddhi Accounts",
      startDate: "May 2025",
      prize: "₹800-₹400 Vouchers & Certificate",
      participants: 0,
      icon: <FaCrown className="text-3xl text-pink-500" />
    },
    {
      id: 4,
      title: "APY Stars Drive",
      description: "Maximum APY enrollments",
      startDate: "June 2025",
      prize: "Vouchers & APY Superstar Certificate",
      participants: 0,
      icon: <FaMedal className="text-3xl text-green-500" />
    }
  ]
};

const achievements = {
  certificates: [
    {
      id: 1,
      title: "NPS Champion of the Year",
      date: "March 2024",
      description: "Achieved top position in NPS enrollments",
      image: "/certificates/nps-champion.png",
      downloadUrl: "/downloads/nps-champion.pdf"
    }
  ],
  badges: [
    {
      id: 1,
      title: "Fast Starter",
      description: "Achieved 50% of target within first month",
      icon: <FaChartLine className="text-4xl" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    }
  ]
};

const quickChallenges = {
  daily: {
    id: "daily",
    title: "Daily Sprint",
    goal: "First to book ₹50K in NPS Today",
    prize: "₹1000 Gift Voucher",
    endTime: "Today, 6:00 PM",
    lastWinner: {
      name: "Amit Shah",
      branch: "Mumbai Andheri",
      achievement: "Booked ₹75K in NPS"
    },
    leaderboard: [
      { position: 1, name: "Priya Sharma", amount: 45000 },
      { position: 2, name: "Rahul Verma", amount: 35000 },
      { position: 3, name: "Neha Patel", amount: 30000 }
    ]
  },
  weekly: {
    id: "weekly",
    title: "Weekly Mission",
    goal: "5 Senior Citizen Savings Accounts",
    prize: "₹1000 Gift Voucher",
    endTime: "Sunday, 6:00 PM",
    lastWinner: {
      name: "Rajesh Kumar",
      branch: "Mumbai Dadar",
      achievement: "Opened 7 Accounts"
    },
    leaderboard: [
      { position: 1, name: "Sanjay Mehta", count: 4 },
      { position: 2, name: "Anita Desai", count: 3 },
      { position: 3, name: "You", count: 2 }
    ]
  },
  monthly: {
    id: "monthly",
    title: "Monthly Quest",
    goal: "5 Atal Pension Yojana Accounts",
    prize: "₹1000 Gift Voucher",
    endTime: "March 31, 6:00 PM",
    lastWinner: {
      name: "Meera Singh",
      branch: "Mumbai Fort",
      achievement: "Enrolled 8 APY Accounts"
    },
    leaderboard: [
      { position: 1, name: "Deepak Shah", count: 3 },
      { position: 2, name: "Kavita Patel", count: 2 },
      { position: 3, name: "Suresh Kumar", count: 2 }
    ]
  }
};

function LeaderboardRow({ entry }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
          {entry.initials}
        </div>
        <span className="font-medium text-gray-900">{entry.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-gray-600">
          <span className="font-semibold">{entry.sales}</span>
          <span className="text-gray-400">/15</span>
        </div>
        <div className={`
          flex items-center justify-center w-8 h-8 
          ${entry.position === 1 ? 'bg-orange-500' : 
            entry.position === 2 ? 'bg-orange-400' : 
            entry.position === 3 ? 'bg-orange-300' :
            'bg-gray-400'} 
          text-white font-bold rounded-lg
          relative
          after:content-[''] after:absolute after:right-[-6px] after:top-[50%]
          after:transform after:translate-y-[-50%]
          after:border-[6px] after:border-transparent
          ${entry.position === 1 ? 'after:border-l-orange-500' : 
            entry.position === 2 ? 'after:border-l-orange-400' : 
            entry.position === 3 ? 'after:border-l-orange-300' :
            'after:border-l-gray-400'}
        `}>
          #{entry.position}
        </div>
      </div>
    </div>
  );
}

function PrizeDistribution({ prizes }) {
  return (
    <div className="space-y-2">
      {prizes.map((prize, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-semibold">
            {prize.position}
          </div>
          <div className="text-gray-600">{prize.prize}</div>
        </div>
      ))}
    </div>
  );
}

function ChallengeCard({ challenge, type }) {
  if (challenge.id === 1) { // Special layout for NPS challenge
    return (
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl shadow-lg">
              {React.cloneElement(challenge.icon, { className: "text-2xl text-white" })}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-1">{challenge.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{challenge.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaChartLine className="text-blue-500" />
                  <span>{challenge.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaUserCircle className="text-blue-500" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">Overall Progress</span>
              <span className="text-xs font-medium text-blue-600">{challenge.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out group-hover:from-blue-600 group-hover:to-blue-700"
                style={{ width: `${challenge.progress}%` }}
              >
                <div className="absolute top-1/2 right-0 w-2 h-2 bg-white rounded-full shadow-sm transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-2">
            {challenge.leaderboard.map((entry, index) => (
              <div 
                key={entry.position} 
                className={`flex items-center justify-between p-2.5 rounded-lg ${
                  entry.name === 'You' ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
                } transition-all duration-200`}
              >
                {/* Left side - Name and Position */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base shadow-sm ${
                    entry.position === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                    entry.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    entry.position === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                    'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800'
                  }`}>
                    {entry.position}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{entry.name}</div>
                    <div className="text-xs">
                      {entry.position === 1 && (
                        <div className="flex items-center gap-1.5 text-yellow-700">
                          <FaMedal className="text-sm" />
                          <span className="font-medium">Marriott Family Dinner Vouchers & Certificate</span>
                        </div>
                      )}
                      {entry.position === 2 && (
                        <div className="flex items-center gap-1.5 text-blue-700">
                          <FaMedal className="text-sm" />
                          <span className="font-medium">₹3000 Vouchers</span>
                        </div>
                      )}
                      {entry.position === 3 && (
                        <div className="flex items-center gap-1.5 text-orange-700">
                          <FaMedal className="text-sm" />
                          <span className="font-medium">₹3000 Vouchers & Certificate</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Sales Count */}
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">{entry.sales}</span>
                  <span className="text-sm text-gray-500">/{challenge.target}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Motivational Prompt */}
          {challenge.motivationalPrompt && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <FaChartLine className="text-sm" />
                <span className="text-sm font-medium">{challenge.motivationalPrompt}</span>
              </div>
            </div>
          )}

          {/* Last Month's Winner */}
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-lg shadow-md">
                  <FaTrophy className="text-lg text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-yellow-800 mb-0.5">Last Month's Champion</div>
                  <div className="text-sm font-semibold text-gray-900">{challenge.lastWinner.name}</div>
                  <div className="text-xs font-medium text-yellow-700 mt-0.5">{challenge.lastWinner.achievement}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-600 mb-0.5">Prize Won</div>
                <div className="text-sm font-medium text-gray-900">{challenge.lastWinner.prize}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            {React.cloneElement(challenge.icon, { className: "text-2xl text-white" })}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-1">{challenge.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{challenge.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaChartLine className="text-blue-500" />
                <span>{type === 'ongoing' ? `Duration: ${challenge.duration}` : `Starts: ${challenge.startDate}`}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaUserCircle className="text-blue-500" />
                <span>{challenge.participants} participants</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaTrophy className="text-blue-500" />
                <span>{challenge.prize}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {type === 'ongoing' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">Overall Progress</span>
              <span className="text-xs font-medium text-blue-600">{challenge.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${challenge.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {type === 'ongoing' && challenge.leaderboard && (
          <div className="space-y-2">
            {challenge.leaderboard.map((entry) => (
              <div 
                key={entry.position} 
                className={`flex items-center justify-between p-2.5 rounded-lg ${
                  entry.name === 'Your Branch' ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
                } transition-all duration-200`}
              >
                {/* Left side - Name and Position */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base shadow-sm ${
                    entry.position === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                    entry.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    entry.position === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                    'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800'
                  }`}>
                    {entry.position}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{entry.name}</div>
                    <div className="text-xs">
                      {entry.position === 1 && (
                        <div className="flex items-center gap-1.5 text-blue-700">
                          <FaMedal className="text-sm" />
                          <span className="font-medium">Branch Trophy & ₹5000 Vouchers</span>
                        </div>
                      )}
                      {entry.position === 2 && (
                        <div className="flex items-center gap-1.5 text-blue-700">
                          <FaMedal className="text-sm" />
                          <span className="font-medium">₹3000 Vouchers</span>
                        </div>
                      )}
                      {entry.position === 3 && (
                        <div className="flex items-center gap-1.5 text-blue-700">
                          <FaMedal className="text-sm" />
                          <span className="font-medium">₹2000 Vouchers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Sales Count */}
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">{entry.sales}</span>
                  <span className="text-sm text-gray-500"> policies</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Motivational Prompt */}
        {challenge.motivationalPrompt && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <FaChartLine className="text-sm" />
              <span className="text-sm font-medium">{challenge.motivationalPrompt}</span>
            </div>
          </div>
        )}

        {/* Last Year's Winner */}
        {challenge.lastWinner && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-md">
                  <FaTrophy className="text-lg text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-800 mb-0.5">Last FY Champion</div>
                  <div className="text-sm font-semibold text-gray-900">{challenge.lastWinner.name}</div>
                  <div className="text-xs font-medium text-blue-700 mt-0.5">{challenge.lastWinner.achievement}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-600 mb-0.5">Prize Won</div>
                <div className="text-sm font-medium text-gray-900">{challenge.lastWinner.prize}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`${achievement.bgColor} p-4 rounded-full mb-4`}>
            <div className={achievement.color}>
              {achievement.icon}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{achievement.title}</h3>
          <p className="text-gray-600 mt-2">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}

function QuickChallengeCard({ challenge }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-shadow duration-300">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{challenge.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ends {challenge.endTime}</p>
          </div>
          <div className="bg-blue-50 px-2 py-1 rounded-md">
            <span className="text-xs font-medium text-blue-700">₹1K Prize</span>
          </div>
        </div>

        {/* Goal */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3">
          <div className="text-sm font-medium text-gray-900">{challenge.goal}</div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-2 mb-3">
          {challenge.leaderboard.map((entry) => (
            <div 
              key={entry.position}
              className={`flex items-center justify-between ${
                entry.name === 'You' ? 'bg-blue-50 rounded-lg p-1.5' : 'p-1.5'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-medium ${
                  entry.position === 1 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                  entry.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                  'bg-gradient-to-br from-orange-300 to-orange-400 text-white'
                }`}>
                  {entry.position}
                </div>
                <span className="text-xs font-medium text-gray-900">{entry.name}</span>
              </div>
              <div className="text-xs font-medium text-gray-700">
                {entry.amount ? `₹${(entry.amount/1000).toFixed(1)}K` : `${entry.count} Accounts`}
              </div>
            </div>
          ))}
        </div>

        {/* Last Winner */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 rounded shadow-sm">
              <FaTrophy className="text-xs text-white" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-blue-800">Last Winner</div>
              <div className="text-xs font-medium text-gray-900">{challenge.lastWinner.name}</div>
              <div className="text-[11px] text-blue-700">{challenge.lastWinner.achievement}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('challenges');

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-100">
      <main className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-2xl font-bold text-gray-800">Rewards Dashboard</h1>
      </div>
        {/* Quick Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickChallengeCard challenge={quickChallenges.daily} />
          <QuickChallengeCard challenge={quickChallenges.weekly} />
          <QuickChallengeCard challenge={quickChallenges.monthly} />
        </div>

        {/* Detailed Challenge Information */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Ongoing Challenges Details</h2>
              <div className="text-sm text-gray-500">Showing {challenges.ongoing.length} active challenges</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.ongoing.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="ongoing" />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Challenges Details</h2>
              <div className="text-sm text-gray-500">Showing {challenges.upcoming.length} upcoming challenges</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.upcoming.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="upcoming" />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
    </MainLayout>
  );
}

export default App;
