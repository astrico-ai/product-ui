import React, { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { 
  Download, 
  Clock, 
  Star, 
  Trophy, 
  CheckCircle, 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  Factory, 
  Users, 
  Briefcase, 
  MessageSquare,
  UserCircle, 
  ChevronDown, 
  X,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Play,
  Shield,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MiningTrainingReportModal } from "@/components/MiningTrainingReportModal";
import { TrainingScenario } from "@/components/TrainingScenario";
import { TrainingIframeModal } from "@/components/TrainingIframeModal";
import { motion } from "framer-motion";

const pendingScenarios = [
  {
    id: 1,
    title: "Heat Stress | Kiln Safety Scenario",
    description: "Learn how to identify early symptoms of heat stress, take immediate peer-level action, and escalate responsibly in a high-temperature industrial setting.",
    difficulty: "medium",
    timeInMinutes: 15,
    skills: ["Judgement", "Peer Intervention", "Safety Escalation", "Incident Reporting"],
    icon: "AlertTriangle"
  },
  {
    id: 2,
    title: "Strategic Sales Negotiation Drill",
    description: "Practice high-stakes negotiations with key industry decision-makers. Focus on value proposition, technical specifications, and long-term partnership benefits.",
    difficulty: "hard",
    timeInMinutes: 20,
    skills: ["Negotiation", "Value Selling", "Technical Knowledge"],
    icon: Building2
  },
  {
    id: 2,
    title: "PPE Compliance During Shutdown",
    description: "Understand how to consistently follow PPE protocols during shutdowns, including high-risk zones and interactions with multiple teams. Learn how to spot and correct non-compliance in real time.",
    difficulty: "medium",
    timeInMinutes: 12,
    skills: ["PPE Awareness", "Zone Compliance", "Peer Correction", "Risk Anticipation"],
    icon: "ShieldCheck"
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
    title: "Heat Stress | Kiln Safety Scenario",
    completedDate: "2024-04-10",
    score: 72,
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

// New feedback data
const employeeFeedbacks = [
  {
    id: 1,
    name: "Mohit Sharma",
    role: "Material Handling Operator",
    completedScenarios: [
      { id: 101, title: "Safe Material Handling", date: "2025-06-06" }
    ]
  },
  {
    id: 2,
    name: "Kavita Mehta",
    role: "Maintenance Technician",
    completedScenarios: [
      { id: 102, title: "PPE Compliance During Shutdown", date: "2025-06-05" }
    ]
  },
  {
    id: 3,
    name: "Rohit Nair",
    role: "Loading Supervisorr",
    completedScenarios: [
      { id: 103, title: "Unsafe Stacking & Warehouse Safety", date: "2025-06-01" }
    ]
  },
  {
    id: 4,
    name: "Ankit Sharma",
    role: "Shift Quality Inspector",
    completedScenarios: [
      { id: 107, title: "Sampling Hazard During Active Belt Movement", date: "2025-05-30" }
    ]
  }
];

// Add these constants at the top after the existing constants
const AGE_GROUPS = ['20-30', '30-40', '40-50', '50-60', '60+'];
const PERSONA_TYPES = [
  'Angry',
  'Price Sensitive',
  'Distrustful',
  'Silent Resistor',
  'First-Time Buyer',
  'Repeat Customer',
  'Indecisive',
  'Brand Conscious'
];
const TONES = ['Friendly', 'Skeptical', 'Aggressive', 'Confused', 'Passive'];
const OBJECTION_STYLES = ['Passive', 'Assertive', 'Defensive', 'Avoidant'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Malayalam', 'Tamil', 'Telugu', 'Punjabi'];

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

function SafetyFeedbackModal({ isOpen, onClose, employee, onSubmit }) {
  const [formData, setFormData] = useState({
    materialHandling: '',
    liftingPosture: '',
    liftingAids: '',
    communication: '',
    nearMisses: '',
    reportingUnsafe: '',
    additionalComments: ''
  });

  // Helper function to get color classes based on option
  const getOptionColorClasses = (option) => {
    switch (option.toLowerCase()) {
      case 'yes':
      case 'always':
        return {
          radio: 'checked:border-green-500 checked:border-6',
          text: 'group-hover:text-green-700',
          bg: 'group-hover:bg-green-50'
        };
      case 'no':
      case 'rarely':
        return {
          radio: 'checked:border-red-500 checked:border-6',
          text: 'group-hover:text-red-700',
          bg: 'group-hover:bg-red-50'
        };
      case 'sometimes':
        return {
          radio: 'checked:border-yellow-500 checked:border-6',
          text: 'group-hover:text-yellow-700',
          bg: 'group-hover:bg-yellow-50'
        };
      case 'not applicable':
      case 'not observed':
        return {
          radio: 'checked:border-gray-500 checked:border-6',
          text: 'group-hover:text-gray-700',
          bg: 'group-hover:bg-gray-50'
        };
      default:
        return {
          radio: 'checked:border-primary checked:border-6',
          text: 'group-hover:text-primary',
          bg: 'group-hover:bg-primary/5'
        };
    }
  };

  // Helper function to render radio options
  const renderRadioOptions = (options, name, value, onChange) => {
    return options.map((option) => {
      const colorClasses = getOptionColorClasses(option);
      return (
        <label
          key={option}
          className={`relative flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${colorClasses.bg}`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            className={`w-5 h-5 border-2 border-gray-300 rounded-full appearance-none transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.radio}`}
          />
          <span className={`text-gray-600 font-medium transition-colors ${colorClasses.text}`}>
            {option}
          </span>
        </label>
      );
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-500/5 via-primary/10 to-purple-500/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-primary to-purple-600 text-transparent bg-clip-text">Safety Feedback</h2>
            <p className="text-sm text-gray-600 mt-1">Providing feedback for {employee?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid gap-8">
              {/* Material Handling */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Have you observed this employee handling materials (e.g., bags, drums, tools) safely during loading/unloading tasks?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Yes', 'No'],
                    'materialHandling',
                    formData.materialHandling,
                    (e) => setFormData({ ...formData, materialHandling: e.target.value })
                  )}
                </div>
              </div>

              {/* Lifting Posture */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Does the employee consistently follow safe lifting posture (e.g., bending knees, keeping back straight, using both hands)?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Always', 'Sometimes', 'Rarely'],
                    'liftingPosture',
                    formData.liftingPosture,
                    (e) => setFormData({ ...formData, liftingPosture: e.target.value })
                  )}
                </div>
              </div>

              {/* Lifting Aids */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Have they used available lifting aids or equipment (e.g., trolleys, hooks, cranes) instead of manual handling where appropriate?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Yes', 'No', 'Not Applicable'],
                    'liftingAids',
                    formData.liftingAids,
                    (e) => setFormData({ ...formData, liftingAids: e.target.value })
                  )}
                </div>
              </div>

              {/* Communication */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Does the employee maintain clear communication with others during shared handling activities (e.g., signaling, confirming load release)?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Yes', 'Sometimes', 'No'],
                    'communication',
                    formData.communication,
                    (e) => setFormData({ ...formData, communication: e.target.value })
                  )}
                </div>
              </div>

              {/* Near Misses */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Have you noticed any near-misses or unsafe practices (e.g., sudden movements, stacking imbalance, lifting beyond capacity) by this employee?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Yes', 'No'],
                    'nearMisses',
                    formData.nearMisses,
                    (e) => setFormData({ ...formData, nearMisses: e.target.value })
                  )}
                </div>
              </div>

              {/* Reporting Unsafe */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Does the employee report unsafe conditions like broken pallets, wet floors, or overloaded trolleys in the handling zone?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Yes', 'No', 'Not Observed'],
                    'reportingUnsafe',
                    formData.reportingUnsafe,
                    (e) => setFormData({ ...formData, reportingUnsafe: e.target.value })
                  )}
                </div>
              </div>

              {/* Additional Comments */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Additional comments or observations:
                </label>
                <textarea
                  value={formData.additionalComments}
                  onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white placeholder-gray-400"
                  rows={4}
                  placeholder="Enter any additional observations or comments..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 border-gray-200 hover:bg-gray-50/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 bg-gradient-to-r from-blue-600 via-primary to-purple-600 text-white hover:opacity-90"
              >
                Submit Feedback
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function EmployeeFeedbackCard({ employee }) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState('pending');

  const handleFeedbackSubmit = (formData) => {
    console.log('Feedback submitted:', formData);
    setFeedbackStatus('completed');
    setShowFeedbackModal(false);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 hover:shadow-md transition-all p-6 group"
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/5 to-purple-50/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <UserCircle className="w-7 h-7 text-primary/70" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors truncate">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.role}</p>
              </div>
            </div>

            {/* Status Badge - Moved to the right side */}
            {feedbackStatus === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 flex-shrink-0"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-medium text-green-600 whitespace-nowrap">Feedback Submitted</span>
              </motion.div>
            )}
          </div>
              
          <div className="space-y-2">
            {employee.completedScenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate mr-4">{scenario.title}</span>
                <span className="text-gray-500 text-xs flex-shrink-0">
                  {new Date(scenario.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Give Feedback Button - Only visible on hover and when feedback is pending */}
          {feedbackStatus === 'pending' && (
            <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-200">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => setShowFeedbackModal(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Give Feedback
                </Button>
              </motion.div>
            </div>
          )}

          {/* View Feedback Button - Only visible on hover when feedback is completed */}
          {feedbackStatus === 'completed' && (
            <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-200">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => setShowFeedbackModal(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Feedback
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <SafetyFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        employee={employee}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}

function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'scenarios', label: 'Scenarios', icon: Briefcase },
    { id: 'personas', label: 'AI Personas', icon: UserCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${
              activeTab === tab.id ? "text-primary" : "text-gray-400"
            }`} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function PersonaCard({ persona, onEdit, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBadgeColor = (type) => {
    const colors = {
      'Angry': 'bg-red-50 text-red-700 border-red-200',
      'Price Sensitive': 'bg-amber-50 text-amber-700 border-amber-200',
      'Distrustful': 'bg-purple-50 text-purple-700 border-purple-200',
      'Silent Resistor': 'bg-slate-50 text-slate-700 border-slate-200',
      'First-Time Buyer': 'bg-green-50 text-green-700 border-green-200',
      'Repeat Customer': 'bg-blue-50 text-blue-700 border-blue-200',
      'Indecisive': 'bg-orange-50 text-orange-700 border-orange-200',
      'Brand Conscious': 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 hover:shadow-md transition-all p-6 group"
    >
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
          >
            <button
              onClick={() => {
                onEdit(persona);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete(persona);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/5 to-purple-50/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform text-2xl">
            {persona.emoji || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors mb-2">{persona.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className={`${getBadgeColor(persona.personaType)} group-hover:border-current`}>
                {persona.personaType}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 group-hover:border-gray-300">
                {persona.ageGroup}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 group-hover:border-current">
                {persona.language}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{persona.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                Tone: {persona.tone}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Style: {persona.objectionStyle}
              </span>
            </div>
          </div>
        </div>

        <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-200">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => setShowTrainingModal(true)}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Training
            </Button>
          </motion.div>
        </div>
      </div>

      {showTrainingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[80vh] relative"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowTrainingModal(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <iframe
              src={`https://training.astrico.ai/agent`}
              className="w-full h-full rounded-2xl"
              title="Training Session"
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// Add this component before the MiningTraining component
function CreatePersonaModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(() => ({
    id: initialData?.id || null,
    name: initialData?.name || '',
    ageGroup: initialData?.ageGroup || AGE_GROUPS[0],
    personaType: initialData?.personaType || PERSONA_TYPES[0],
    description: initialData?.description || '',
    tone: initialData?.tone || TONES[0],
    objectionStyle: initialData?.objectionStyle || OBJECTION_STYLES[0],
    language: initialData?.language || LANGUAGES[0]
  }));

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        ageGroup: initialData.ageGroup,
        personaType: initialData.personaType,
        description: initialData.description,
        tone: initialData.tone,
        objectionStyle: initialData.objectionStyle,
        language: initialData.language
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    // Only reset if it's not an edit operation
    if (!initialData) {
      setFormData({
        id: null,
        name: '',
        ageGroup: AGE_GROUPS[0],
        personaType: PERSONA_TYPES[0],
        description: '',
        tone: TONES[0],
        objectionStyle: OBJECTION_STYLES[0],
        language: LANGUAGES[0]
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-purple-50/50">
          <h2 className="text-2xl font-semibold text-gray-900">
            {initialData ? 'Edit AI Persona' : 'Create AI Persona'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {initialData ? 'Modify your AI training partner\'s characteristics' : 'Configure your AI training partner\'s characteristics'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Persona Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50"
                placeholder="Enter persona name"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50"
                >
                  {AGE_GROUPS.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Persona Type</label>
              <select
                value={formData.personaType}
                onChange={(e) => setFormData({ ...formData, personaType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50"
              >
                {PERSONA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50 h-24 resize-none"
                placeholder="Describe the persona's characteristics and behavior..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50"
                >
                  {TONES.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objection Style</label>
                <select
                  value={formData.objectionStyle}
                  onChange={(e) => setFormData({ ...formData, objectionStyle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50"
                >
                  {OBJECTION_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-primary text-white hover:bg-primary/90"
            >
              {initialData ? 'Save Changes' : 'Create Persona'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function MiningTraining() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios');
  const videoUrl = "https://drive.google.com/file/d/1YbLMB-q8jhMJGB6-HrZrYNIM65HPwe4b/view";
  const [personas, setPersonas] = useState(() => {
    const storedPersonas = localStorage.getItem('personas');
    return storedPersonas ? JSON.parse(storedPersonas) : [];
  });
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isCreatePersonaOpen, setIsCreatePersonaOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleStartScenario = (scenario) => {
    setSelectedScenario(scenario);
    setIsIframeModalOpen(true);
  };

  const handleDownloadReport = (scenario) => {
    setSelectedScenario(scenario);
    setIsReportOpen(true);
  };

  const handleCreatePersona = (newPersona) => {
    if (newPersona.id) {
      setPersonas(prevPersonas => 
        prevPersonas.map(p => p.id === newPersona.id ? newPersona : p)
      );
    } else {
      setPersonas(prevPersonas => [...prevPersonas, { ...newPersona, id: Date.now() }]);
    }
  };

  const handleEditClick = (persona) => {
    setSelectedPersona(persona);
    setIsCreatePersonaOpen(true);
  };

  const handleDeleteClick = (persona) => {
    setSelectedPersona(persona);
    setIsDeleteConfirmOpen(true);
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

        {/* Create/Edit Persona Modal */}
        <CreatePersonaModal
          isOpen={isCreatePersonaOpen}
          onClose={() => {
            setIsCreatePersonaOpen(false);
            setSelectedPersona(null);
          }}
          onSave={handleCreatePersona}
          initialData={selectedPersona}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Persona</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedPersona?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setSelectedPersona(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setPersonas(prevPersonas => prevPersonas.filter(p => p.id !== selectedPersona.id));
                    setIsDeleteConfirmOpen(false);
                    setSelectedPersona(null);
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}

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
                <h1 className="text-2xl font-semibold text-gray-900">B2B Industry Safety Training</h1>
                <p className="text-gray-600">Master complex B2B safety scenarios with our AI-powered training simulations.</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {activeTab === 'scenarios' ? (
                  <>
                    <div className="px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900">Training Scenarios</h2>
                      <p className="text-sm text-gray-500 mt-1">Practice real-world B2B industry safety situations</p>
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
                  </>
                ) : activeTab === 'personas' ? (
                  <>
                    <div className="px-8 py-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">AI Personas</h2>
                          <p className="text-sm text-gray-500 mt-1">Create and manage AI personas for training</p>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedPersona(null);
                            setIsCreatePersonaOpen(true);
                          }}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Persona
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {personas.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-12 w-12 text-primary" />
                          </div>
                          <p className="text-lg font-medium text-gray-900">No personas created yet</p>
                          <p className="text-sm text-gray-500 mt-1">Create your first AI persona to start training</p>
                          <Button
                            onClick={() => {
                              setSelectedPersona(null);
                              setIsCreatePersonaOpen(true);
                            }}
                            className="mt-6 bg-primary text-white hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Persona
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {personas.map((persona) => (
                            <PersonaCard
                              key={persona.id}
                              persona={persona}
                              onEdit={handleEditClick}
                              onDelete={handleDeleteClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900">Employee Feedback</h2>
                      <p className="text-sm text-gray-500 mt-1">Review and provide feedback on completed scenarios</p>
                    </div>
                    
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {employeeFeedbacks.map((employee) => (
                          <EmployeeFeedbackCard
                            key={employee.id}
                            employee={employee}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Top Performers Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
                  <p className="text-sm text-gray-500 mt-1">Leading safety professionals this month</p>
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