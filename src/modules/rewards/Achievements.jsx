import { FaCertificate, FaTrophy, FaStar, FaAward, FaDownload } from 'react-icons/fa';

// Mock data - In a real app, this would come from an API
const achievements = {
  certificates: [
    {
      id: 1,
      title: "NPS Champion of the Year",
      date: "March 2024",
      description: "Achieved top position in NPS enrollments",
      image: "/certificates/nps-champion.png",
      downloadUrl: "/downloads/nps-champion.pdf"
    },
    {
      id: 2,
      title: "Sukanya Star Performer",
      date: "February 2024",
      description: "Exceeded Sukanya Samriddhi Account targets",
      image: "/certificates/sukanya-star.png",
      downloadUrl: "/downloads/sukanya-star.pdf"
    }
  ],
  badges: [
    {
      id: 1,
      title: "Fast Starter",
      description: "Achieved 50% of target within first month",
      icon: <FaStar className="text-4xl" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      id: 2,
      title: "Consistent Performer",
      description: "Maintained top 5 position for 3 consecutive months",
      icon: <FaTrophy className="text-4xl" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: "Branch Champion",
      description: "Led branch to top position in Branch Wars",
      icon: <FaAward className="text-4xl" />,
      color: "text-green-500",
      bgColor: "bg-green-50"
    }
  ]
};

function CertificateCard({ certificate }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <FaCertificate className="text-3xl text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{certificate.title}</h3>
            <p className="text-gray-600 mt-1">{certificate.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Awarded on {certificate.date}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <img 
            src={certificate.image} 
            alt={certificate.title}
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <a 
            href={certificate.downloadUrl}
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FaDownload className="mr-2" />
            Download Certificate
          </a>
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`${badge.bgColor} p-4 rounded-full mb-4`}>
            <div className={badge.color}>
              {badge.icon}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{badge.title}</h3>
          <p className="text-gray-600 mt-2">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}

function Achievements() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Certificates</h2>
          <div className="text-sm text-gray-500">
            {achievements.certificates.length} certificates earned
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {achievements.certificates.map(certificate => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Badges</h2>
          <div className="text-sm text-gray-500">
            {achievements.badges.length} badges unlocked
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Achievements; 