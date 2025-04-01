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
    <div className="space-y-4">
      {sortedData.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.trophy ? (
              <Trophy className="w-5 h-5 text-[#3551F3]" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                {item.rank}
              </span>
            )}
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          <span className="text-sm text-gray-600">₹{item.points} L</span>
        </div>
      ))}
    </div>
  );
} 