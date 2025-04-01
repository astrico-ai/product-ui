import React from "react";
import { Trophy } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Rahul Sharma", points: 4.8, trophy: true },
  { rank: 2, name: "Neha Verma", points: 4.2, trophy: true },
  { rank: 3, name: "Arjun Mehta", points: 3.5, trophy: true },
  { rank: 4, name: "Priya Kapoor", points: 3.2, trophy: false },
  { rank: 5, name: "Amit Desai", points: 3.8, trophy: false },
  { rank: 6, name: "Sneha Reddy", points: 3.5, trophy: false },
];

export function LeaderboardCard({ sortOrder = "desc" }) {
  const sortedData = [...leaderboardData]
    .sort((a, b) => sortOrder === "desc" ? b.points - a.points : a.points - b.points)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      trophy: index < 3 // Top 3 get trophies
    }));

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 pb-4 bg-gradient-to-r from-amber-50 to-yellow-50/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
            <p className="text-sm text-gray-500">Top performers this month</p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4 space-y-4">
        {sortedData.map((item, index) => (
          <div key={index} className="flex items-center justify-between group py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
            <div className="flex items-center gap-3">
              {item.trophy ? (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  index === 0 ? 'bg-amber-50 text-amber-600' :
                  index === 1 ? 'bg-slate-50 text-slate-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  <Trophy className="w-4 h-4" />
                </div>
              ) : (
                <span className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-600">
                  {item.rank}
                </span>
              )}
              <span className="text-sm font-medium text-gray-900 group-hover:text-[#3551F3] transition-colors">{item.name}</span>
            </div>
            <span className="text-sm text-gray-600">₹{item.points} L</span>
          </div>
        ))}
      </div>
    </div>
  );
} 