import { useParams } from 'react-router-dom';
import { FaTrophy, FaMedal, FaChartLine, FaAward, FaCrown, FaStar, FaUsers } from 'react-icons/fa';
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

// Mock data - In a real app, this would come from an API
const challengeData = {
  1: {
    title: "NPS Champion of the Year",
    description: "Compete to enroll the highest number of NPS customers",
    duration: "Full Financial Year",
    prize: "Marriott Family Dinner Vouchers & Certificate",
    progress: 65,
    currentRank: 3,
    sales: 45,
    target: 100,
    leaderboard: [
      { name: "John Doe", branch: "Mumbai Central", score: 78, avatar: "JD" },
      { name: "Jane Smith", branch: "Delhi South", score: 65, avatar: "JS" },
      { name: "You", branch: "Bangalore East", score: 45, avatar: "ME" },
      { name: "Mike Johnson", branch: "Chennai North", score: 42, avatar: "MJ" },
      { name: "Sarah Williams", branch: "Kolkata West", score: 38, avatar: "SW" }
    ],
    medalProgress: {
      gold: 80,
      silver: 60,
      bronze: 40
    }
  }
};

function LeaderboardRow({ entry, index }) {
  const isCurrentUser = entry.name === "You";
  const medalColors = {
    0: "text-yellow-500",
    1: "text-gray-400",
    2: "text-amber-700"
  };

  return (
    <tr className={`group transition-all duration-300 ${isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {index < 3 ? (
            <FaCrown className={`text-xl mr-2 ${medalColors[index]}`} />
          ) : (
            <span className="text-gray-500 font-medium">{index + 1}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {entry.avatar}
            </div>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
              {entry.name}
            </div>
            <div className="text-sm text-gray-500">{entry.branch}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">{entry.score}</div>
      </td>
    </tr>
  );
}

function ChallengeDetails() {
  const { id } = useParams();
  const challenge = challengeData[id];

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  const progressData = {
    labels: ['Current Progress'],
    datasets: [
      {
        label: 'Sales',
        data: [challenge.sales],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderRadius: 8,
      },
      {
        label: 'Target',
        data: [challenge.target],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progress Towards Target',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{challenge.title}</h1>
            <p className="text-gray-600 mt-2">{challenge.description}</p>
            <div className="mt-4 flex items-center text-gray-500">
              <FaChartLine className="mr-2 text-blue-500" />
              <span>Duration: {challenge.duration}</span>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">#{challenge.currentRank}</div>
            <div className="text-sm text-gray-500">Current Rank</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Your Progress</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-blue-600">{challenge.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${challenge.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="h-64">
              <Bar data={progressData} options={options} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Medal Progress</h2>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-yellow-50 p-3 rounded-lg mr-4">
                <FaTrophy className="text-yellow-500 text-2xl" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Gold</span>
                  <span className="text-sm font-medium text-gray-700">{challenge.medalProgress.gold}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full transition-all duration-500" style={{ width: `${challenge.medalProgress.gold}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg mr-4">
                <FaMedal className="text-gray-400 text-2xl" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Silver</span>
                  <span className="text-sm font-medium text-gray-700">{challenge.medalProgress.silver}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gray-400 h-3 rounded-full transition-all duration-500" style={{ width: `${challenge.medalProgress.silver}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-amber-50 p-3 rounded-lg mr-4">
                <FaAward className="text-amber-700 text-2xl" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bronze</span>
                  <span className="text-sm font-medium text-gray-700">{challenge.medalProgress.bronze}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-amber-700 h-3 rounded-full transition-all duration-500" style={{ width: `${challenge.medalProgress.bronze}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Top 5 Leaderboard</h2>
          <div className="flex items-center text-sm text-gray-500">
            <FaUsers className="mr-2" />
            {challenge.leaderboard.length} Participants
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challenge.leaderboard.map((entry, index) => (
                <LeaderboardRow key={index} entry={entry} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ChallengeDetails; 