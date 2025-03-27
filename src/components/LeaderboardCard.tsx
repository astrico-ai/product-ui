import { Trophy } from "lucide-react";

interface LeaderboardItemProps {
  name: string;
  score: string;
  rank: number;
}

const LeaderboardItem = ({ name, score, rank }: LeaderboardItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-secondary/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        {rank <= 3 ? (
          <Trophy className={`h-5 w-5 ${
            rank === 1 ? 'trophy-gold' : 
            rank === 2 ? 'trophy-silver' : 
            'trophy-bronze'
          }`} />
        ) : (
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-500">{rank}</span>
          </div>
        )}
        <span className="font-medium">{name}</span>
      </div>
      <span className="text-sm font-semibold text-navy-700">{score}</span>
    </div>
  );
};

export function LeaderboardCard() {
  const leaderboardData = [
    { name: "Rahul Sharma", score: "₹4.8 L" },
    { name: "Neha Verma", score: "₹4.2 L" },
    { name: "Arjun Mehta", score: "₹3.5 L" },
    { name: "Priya Kapoor", score: "₹3.2 L" },
    { name: "Amit Desai", score: "₹3.8 L" },
    { name: "Sneha Reddy", score: "₹3.5 L" },
    { name: "Varun Joshi", score: "₹3.2 L" },
    { name: "Ritu Sharma", score: "₹3.1 L" },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-subtle overflow-hidden animate-fade-in">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold">Leaderboard - Feb'25</h3>
      </div>
      <div className="divide-y divide-border/50">
        {leaderboardData.map((item, index) => (
          <LeaderboardItem
            key={item.name}
            name={item.name}
            score={item.score}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
