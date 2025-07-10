import React, { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Download, Clock, Star, Trophy, CheckCircle, ArrowRight, GraduationCap, UserCircle, List, Plus, X, Users, ChevronDown, MessageCircle, Shield, MoreVertical, Edit2, Trash2, Play, AlertCircle, DollarSign, HelpCircle, UserX, UserPlus, RefreshCw, Brain, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TrainingReportModal } from "@/components/TrainingReportModal";
import { TrainingScenario } from "@/components/TrainingScenario";
import { TrainingIframeModal } from "@/components/TrainingIframeModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const pendingScenarios = [
  {
    id: 1,
    title: "Helping a Customer Switch Their Home Loan Provider",
    description: "Learn how to speak with a customer who is frustrated with their current home loan lender and is exploring a balance transfer.",
    difficulty: "medium",
    timeInMinutes: 12,
    skills: ["Negotiation", "Product Knowledge", "Value Proposition"]
  },
  {
    id: 2,
    title: "Handling an Angry Customer's Credit Card Issue",
    description: "Learn to manage a heated conversation with a customer who's payment has been debited from their account twice while maintaining professionalism and finding a resolution.",
    difficulty: "hard",
    timeInMinutes: 15,
    skills: ["Conflict Resolution", "Empathy", "Policy Communication"]
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
    title: "Switching Home Loan Provider",
    completedDate: "2025-07-11",
    score: 85,
  },
  {
    id: 102,
    title: "First-Time Borrower Guidance",
    completedDate: "2025-06-01",
    score: 88,
  },
  {
    id: 103,
    title: "Payment Default Resolution",
    completedDate: "2025-05-22",
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

// Constants for dropdowns
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

// Emoji mapping for each persona type
const personaEmojis = {
  'Angry': '😠',
  'Price Sensitive': '🤔',
  'Distrustful': '🤨',
  'Silent Resistor': '😶',
  'First-Time Buyer': '😊',
  'Repeat Customer': '🤝',
  'Indecisive': '🤷',
  'Brand Conscious': '🎯'
};

// Employee feedback data
const employeeFeedbacks = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Customer Service Representative",
    completedScenarios: [
      { id: 101, title: "Switching Home Loan Provider", date: "2025-07-11" }
    ]
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Senior Customer Advisor",
    completedScenarios: [
      { id: 102, title: "First-Time Borrower Guidance", date: "2025-06-01" }
    ]
  },
  {
    id: 3,
    name: "Amit Kumar",
    role: "Loan Officer",
    completedScenarios: [
      { id: 103, title: "Payment Default Resolution", date: "2025-05-22" }
    ]
  },
  {
    id: 4,
    name: "Neha Verma",
    role: "Customer Relations Manager",
    completedScenarios: [
      { id: 104, title: "Handling Angry Customer's Credit Card Issue", date: "2025-05-15" }
    ]
  }
];

function CustomerServiceFeedbackModal({ isOpen, onClose, employee, onSubmit }) {
  const [formData, setFormData] = useState({
    communication: '',
    empathy: '',
    problemSolving: '',
    productKnowledge: '',
    professionalism: '',
    followUp: '',
    additionalComments: ''
  });

  // Helper function to get color classes based on option
  const getOptionColorClasses = (option) => {
    switch (option.toLowerCase()) {
      case 'excellent':
      case 'always':
        return {
          radio: 'checked:border-green-500 checked:border-6',
          text: 'group-hover:text-green-700',
          bg: 'group-hover:bg-green-50'
        };
      case 'poor':
      case 'never':
        return {
          radio: 'checked:border-red-500 checked:border-6',
          text: 'group-hover:text-red-700',
          bg: 'group-hover:bg-red-50'
        };
      case 'good':
      case 'sometimes':
        return {
          radio: 'checked:border-blue-500 checked:border-6',
          text: 'group-hover:text-blue-700',
          bg: 'group-hover:bg-blue-50'
        };
      case 'fair':
      case 'rarely':
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
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-primary to-purple-600 text-transparent bg-clip-text">Customer Service Feedback</h2>
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
              {/* Communication Skills */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  How would you rate this employee's communication skills during customer interactions?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    'communication',
                    formData.communication,
                    (e) => setFormData({ ...formData, communication: e.target.value })
                  )}
                </div>
              </div>

              {/* Empathy & Understanding */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Does the employee show empathy and understanding when dealing with customer concerns?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Always', 'Sometimes', 'Rarely', 'Never'],
                    'empathy',
                    formData.empathy,
                    (e) => setFormData({ ...formData, empathy: e.target.value })
                  )}
                </div>
              </div>

              {/* Problem-Solving */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  How effectively does the employee solve customer problems and provide solutions?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    'problemSolving',
                    formData.problemSolving,
                    (e) => setFormData({ ...formData, problemSolving: e.target.value })
                  )}
                </div>
              </div>

              {/* Product Knowledge */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Does the employee demonstrate adequate product knowledge when explaining services to customers?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    'productKnowledge',
                    formData.productKnowledge,
                    (e) => setFormData({ ...formData, productKnowledge: e.target.value })
                  )}
                </div>
              </div>

              {/* Professionalism */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  How would you rate the employee's professionalism and courtesy during customer interactions?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    'professionalism',
                    formData.professionalism,
                    (e) => setFormData({ ...formData, professionalism: e.target.value })
                  )}
                </div>
              </div>

              {/* Follow-up */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <label className="block text-base font-medium text-gray-800 mb-4">
                  Does the employee follow up appropriately with customers after resolving their issues?
                </label>
                <div className="flex flex-wrap gap-4">
                  {renderRadioOptions(
                    ['Always', 'Sometimes', 'Rarely', 'Not Observed'],
                    'followUp',
                    formData.followUp,
                    (e) => setFormData({ ...formData, followUp: e.target.value })
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
                  placeholder="Enter any additional observations or suggestions for improvement..."
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

            {/* Status Badge */}
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

      <CustomerServiceFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        employee={employee}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}

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

function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'scenarios', label: 'Scenarios', icon: List },
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
            className={cn(
              "flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none",
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <tab.icon className={cn(
              "w-5 h-5",
              activeTab === tab.id ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
            )} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function CustomDropdown({ value, onChange, options, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 bg-white/50 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-auto"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`w-full px-4 py-2.5 text-left hover:bg-primary/5 transition-colors ${
                value === option ? 'text-primary bg-primary/5' : 'text-gray-700'
              }`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

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
              <CustomDropdown
                label="Age Group"
                value={formData.ageGroup}
                onChange={(value) => setFormData({ ...formData, ageGroup: value })}
                options={AGE_GROUPS}
              />

              <CustomDropdown
                label="Language"
                value={formData.language}
                onChange={(value) => setFormData({ ...formData, language: value })}
                options={LANGUAGES}
              />
            </div>

            <CustomDropdown
              label="Persona Type"
              value={formData.personaType}
              onChange={(value) => setFormData({ ...formData, personaType: value })}
              options={PERSONA_TYPES}
            />

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
              <CustomDropdown
                label="Tone"
                value={formData.tone}
                onChange={(value) => setFormData({ ...formData, tone: value })}
                options={TONES}
              />

              <CustomDropdown
                label="Objection Style"
                value={formData.objectionStyle}
                onChange={(value) => setFormData({ ...formData, objectionStyle: value })}
                options={OBJECTION_STYLES}
              />
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
      {/* Menu Button */}
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
            {personaEmojis[persona.personaType] || '👤'}
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

        {/* Start Training Button - Only visible on hover */}
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

      {/* Training Modal with iframe */}
      <TrainingIframeModal
        isOpen={showTrainingModal}
        onClose={() => setShowTrainingModal(false)}
        scenario={persona}
      />
    </motion.div>
  );
}

export default function Training() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios');
  const [isCreatePersonaOpen, setIsCreatePersonaOpen] = useState(false);
  const [personas, setPersonas] = useState(() => {
    // Initialize personas from localStorage
    const storedPersonas = localStorage.getItem('personas');
    return storedPersonas ? JSON.parse(storedPersonas) : [];
  });
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isEditPersonaOpen, setIsEditPersonaOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const videoUrl = "https://drive.google.com/file/d/1YbLMB-q8jhMJGB6-HrZrYNIM65HPwe4b/view";

  // Add new state for iframe modal
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false);

  // Update localStorage whenever personas change
  useEffect(() => {
    localStorage.setItem('personas', JSON.stringify(personas));
  }, [personas]);

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
      // This is an edit operation
      setPersonas(prevPersonas => 
        prevPersonas.map(p => p.id === newPersona.id ? newPersona : p)
      );
    } else {
      // This is a create operation
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

  const handleConfirmDelete = () => {
    if (selectedPersona) {
      setPersonas(prevPersonas => prevPersonas.filter(p => p.id !== selectedPersona.id));
      setIsDeleteConfirmOpen(false);
      setSelectedPersona(null);
    }
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

        {/* Replace the old iframe modal with TrainingIframeModal */}
        <TrainingIframeModal
          isOpen={isIframeModalOpen}
          onClose={() => setIsIframeModalOpen(false)}
          scenario={selectedScenario}
        />

        {/* Report Modal */}
        <TrainingReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
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
                  onClick={handleConfirmDelete}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}

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

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {activeTab === 'personas' ? (
                  <>
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
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
                ) : activeTab === 'feedback' ? (
                  <>
                    <div className="px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900">Employee Feedback</h2>
                      <p className="text-sm text-gray-500 mt-1">Review and provide feedback on completed training scenarios</p>
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
                ) : (
                  <div className="p-4 space-y-5">
                    <div className="px-8 py-3 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900">Training Scenarios</h2>
                      <p className="text-sm text-gray-500 mt-1">Complete these scenarios to improve your customer service skills</p>
                    </div>
                    
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
                          <Button 
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#3551F3] text-white hover:bg-[#3551F3]/90"
                            onClick={() => handleStartScenario(scenario)}
                          >
                            Start Training
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Unchanged */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Top Performers Section */}
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