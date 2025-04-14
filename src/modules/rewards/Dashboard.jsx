import { Link } from 'react-router-dom';
import { FaTrophy, FaMedal, FaCalendarAlt, FaUsers, FaGift } from 'react-icons/fa';

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
      icon: <FaTrophy className="text-3xl text-yellow-500" />
    },
    {
      id: 2,
      title: "Inclusive Banking Branch Championship",
      description: "Branch with highest combined inclusive banking product sales",
      duration: "Full Financial Year",
      prize: "Branch Trophy & ₹500 Vouchers",
      progress: 45,
      participants: 25,
      icon: <FaMedal className="text-3xl text-blue-500" />
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
      icon: <FaGift className="text-3xl text-pink-500" />
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

function ChallengeCard({ challenge, type }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                {challenge.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{challenge.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{challenge.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <FaCalendarAlt className="mr-2 text-blue-500" />
                {type === 'ongoing' ? `Duration: ${challenge.duration}` : `Starts: ${challenge.startDate}`}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaUsers className="mr-2 text-blue-500" />
                {challenge.participants} participants
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaGift className="mr-2 text-blue-500" />
                {challenge.prize}
              </div>
            </div>
          </div>
        </div>

        {type === 'ongoing' && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>{challenge.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${challenge.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <Link 
          to={`/challenge/${challenge.id}`}
          className="mt-6 inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ongoing Challenges</h2>
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
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Challenges</h2>
          <div className="text-sm text-gray-500">Showing {challenges.upcoming.length} upcoming challenges</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.upcoming.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} type="upcoming" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard; 