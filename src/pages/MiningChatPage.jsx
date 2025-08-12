import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp, ChevronRight, ThumbsUp, ThumbsDown, Copy, Share2, X, CheckCircle2 } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { TypewriterText } from "@/components/TypewriterText";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useLocation } from "react-router-dom";
import MiningDataVisualization from "@/components/MiningDataVisualization";
import MonthlySalesVisualization from "@/components/MonthlySalesVisualization";
import LostCustomersVisualization from "@/components/LostCustomersVisualization";
import AramidContributionVisualization from "@/components/AramidContributionVisualization";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import ErrorBoundary from '../components/ErrorBoundary';
import Chart from "react-apexcharts";


// Mock chat history data
const chatHistory = {
  today: [
    { id: 1, title: "Compare ore extraction rates..." },
    { id: 2, title: "Get me the total mineral output..." }
  ],
  yesterday: [
    { id: 3, title: "Which mine has the highest efficiency ratio?" },
  ],
  previousWeek: [
    { id: 4, title: "Production rates in Northern site" }
  ],
  previousMonth: [
    { id: 5, title: "Equipment maintenance schedules" }
  ]
};

// Mock chat messages for each chat
const mockChatMessages = {};

// New hybrid matching system
const topicMatcher = {
  smart_eps: {
    keywords: ["smart eps", "eps", "features", "capabilities", "fitur", "kemampuan", "फीचर्स", "स्मार्ट"],
    subtopics: {
      features: {
        keywords: ["features", "fitur", "capabilities", "can do", "what does", "apa saja", "tell me about", "कौन", "क्या", "फीचर्स"],
        response: {
          en: {
            text: "**Features of ECS Smart EPS Solution**\n\n• Forecasted energy and GHG performance to achieve set targets\n• Achievement of performance milestones\n• Achievement of set targets\n• Assurance of priority project viability\n• Focused energy and GHG reduction plan by Emission type\n• Transition Roadmap to Net Carbon Zero",
            showVisualization: false,
            showFollowUp: false,
            showFeedback: true
          },
          id: {
            text: "**Fitur-fitur ECS Smart EPS Solution**\n\n• Perkiraan kinerja energi dan GHG untuk mencapai target yang ditetapkan\n• Pencapaian milestone kinerja\n• Pencapaian target yang ditetapkan\n• Jaminan kelayakan proyek prioritas\n• Rencana pengurangan energi dan GHG yang terfokus berdasarkan jenis Emisi\n• Peta Jalan Transisi menuju Net Carbon Zero",
            showVisualization: false,
            showFollowUp: false,
            showFeedback: true
          },
          hi: {
            text: "**ECS Smart EPS Solution की खास बातें**\n\n• लक्ष्य पूरे करने के लिए ऊर्जा और GHG प्रदर्शन का पहले से अनुमान लगाना\n• प्रदर्शन से जुड़ी उपलब्धियों को समय पर पूरा करना\n• तय किए गए लक्ष्य हासिल करना\n• ज़रूरी परियोजनाओं के सफल होने का भरोसा देना\n• उत्सर्जन के हर प्रकार के लिए ऊर्जा और GHG कम करने की साफ़ योजना\n• Net Carbon Zero तक पहुँचने के लिए एक तयशुदा रास्ता",
            showVisualization: false,
            showFollowUp: false,
            showFeedback: true
          }
        }
      },
      ghg: {
        keywords: ["ghg", "prediction", "forecast", "memprediksi", "tersedia", "predict"],
        response: {
          en: {
            text: "To forecast GHG, you can use **ECS Smart EPS Solution** — an innovative digital tool that gives you the ability to forecast your future energy usage and carbon emissions with accuracy and precision.\n\nThe tool is used to simulate the impact of proposed energy and carbon reduction projects in order to evaluate which projects will yield the most sustainable benefits.\n\n**🎥 Here is a short video about Smart EPS:**",
            videoUrl: "https://www.youtube.com/embed/HTXsNqAwYYE",
            videoThumbnail: "https://img.youtube.com/vi/HTXsNqAwYYE/maxresdefault.jpg",
            showVisualization: false,
            showFollowUp: true,
            showFeedback: true
          },
          id: {
            text: "Untuk memproyeksikan GHG, Anda dapat menggunakan **ECS Smart EPS Solution** — sebuah alat digital inovatif yang memberikan Anda kemampuan untuk memprediksi penggunaan energi dan emisi karbon di masa depan dengan akurasi dan presisi tinggi.\n\nAlat ini digunakan untuk mensimulasikan dampak dari proyek pengurangan energi dan karbon yang diusulkan, guna mengevaluasi proyek mana yang akan memberikan manfaat berkelanjutan terbesar.\n\n**🎥 Berikut adalah video singkat tentang Smart EPS:**",
            videoUrl: "https://www.youtube.com/embed/HTXsNqAwYYE",
            videoThumbnail: "https://img.youtube.com/vi/HTXsNqAwYYE/maxresdefault.jpg",
            showVisualization: false,
            showFollowUp: true,
            showFeedback: true
          }
        }
      }
    }
  },
  copper: {
    keywords: ["copper", "price", "performance", "market", "tembaga", "last" , "3"],
    subtopics: {
      performance: {
        keywords: ["performance", "performing", "permformed","price", "market", "kinerja", "harga", "how is", "bagaimana"],
        response: {
          en: {
            text: "Over the past three months (January 2025 to March 2025), copper prices have experienced notable fluctuations, influenced by various economic and geopolitical factors.\n\n**Current Market Price:** $9358.00 (-0.34%) (As on 13th April '25)\n\n**Copper Price Trend: January 2025 – March 2025**\n\n**January 2025:** Copper prices averaged approximately $8,916 per metric ton, reflecting a slight decrease from the previous month.\n\n**February 2025:** Prices rebounded modestly to around $8,991 per metric ton, driven by increased demand from manufacturing sectors\n\n**March 2025:** Copper prices continued their upward trend, reaching approximately $9,200 per metric ton by mid-February, influenced by supply constraints and positive economic indicators from major economies.",
            showVisualization: true,
            showFollowUp: false,
            showFeedback: true,
            visualizationType: "copper"
          }
        }
      }
    }
  },
  sales: {
    keywords: ["sales", "prospect", "meeting", "plant head", "cement", "probing", "questions", "ask"],
    subtopics: {
      probing_questions: {
        keywords: ["probing questions", "discovery", "questions to ask", "first meeting", "plant head", "cement"],
        response: {
          en: {
            text: "**Probing Questions for First Meeting with Cement Plant Head**\n\nSince you are meeting the plant head for the first time, you can ask some open-ended questions to begin with so that you can gain maximum insights. Plant heads are responsible for delivering production goals and are concerned about machine availability and uptime. Here are some questions you can ask:\n\n• What are the machine makes, models, and numbers in the plant?\n\n• Which of these machines and applications are considered most critical to uptime?\n\n• What are the machine running patterns and current utilization levels?\n\n• Can you share some historical breakdowns that affected uptime?\n\n• How do bearing-related failures affect production rates and what is their cost impact?",
            showVisualization: false,
            showFollowUp: true,
            showFeedback: true,
            followUpQuestions: [
              "How to do a RCA for bearing failures?",
              "What would be the probing questions for a maintenance head?"
            ]
          }
        }
      }
    }
  },
  bearing_failures: {
    keywords: ["bearing", "failures", "impact", "production", "parameters", "compute", "cost", "formula"],
    subtopics: {
      impact_parameters: {
        keywords: ["parameters", "impact", "compute", "consider", "key", "production"],
        response: {
          en: {
            text: "**Key Parameters to Compute Total Bearing Failure Cost**\n\nHere are some of the key parameters that can be considered to compute total failure cost:\n\n• Number of Bearing Failures\n\n• Downtime per Failure (hours)\n\n• Production Rate (tons/hour or ₹/hour)\n\n• Product Value (₹/ton)\n\n• Bearing Replacement Cost\n\n• Labor Cost for Replacement\n\n• Total Operating Hours",
            showVisualization: false,
            showFollowUp: true,
            showFeedback: true,
            followUpQuestions: [
              "Create a formula to compute the total failure cost"
            ]
          }
        }
      },
      cost_formula: {
        keywords: ["formula", "cost", "compute", "calculate", "total", "failure"],
        response: {
          en: {
            text: "**Formula to Calculate Total Bearing Failure Cost**\n\nTotal Cost = Direct Costs + Indirect Costs\n\nWhere:\n\n**Direct Costs**\n• Bearing Component Cost (BC)\n• Labor Cost for Replacement (LC)\n\n**Indirect Costs**\n• Production Loss = Downtime (hrs) × Production Rate (tons/hr) × Product Value (₹/ton)\n• Maintenance Overhead = Setup Time × Maintenance Rate\n\n**Complete Formula:**\nTotal Cost = (BC + LC) + (Downtime × Production Rate × Product Value) + (Setup Time × Maintenance Rate)\n\n**Annual Impact:**\nYearly Cost = Total Cost per Failure × Number of Failures per Year",
            showVisualization: false,
            showFollowUp: false,
            showFeedback: true
          }
        }
      }
    }
  },
  prime_industries: {
    keywords: ["prime", "industries", "limited", "discussions", "lead", "summary", "summarize"],
    subtopics: {
      lead_summary: {
        keywords: ["summary", "summarize", "discussions", "lead", "so far"],
        response: {
          en: {
            text: "**Summary of Discussions with Prime Industries Limited**\n\n**Application Area:**\n• Crusher Gearbox – Bearings (Critical Equipment)\n\n**Identified Needs / Pain Points:**\n• Frequent bearing failures causing unplanned downtime (3+ breakdowns/year)\n• High production loss due to unreliable supply and long lead times\n• Limited on-site bearing inventory – need for faster replenishment\n\n**Commercial Opportunity:**\n• Initial trial order for 2 crusher gearboxes (3-month trial)\n• Potential annual contract for full crusher line bearings\n• Value: ₹5–10 lakhs/year (conservatively), potential for ₹25+ lakhs with spares & other bearings",
            showVisualization: false,
            showFollowUp: true,
            showFeedback: true,
            followUpQuestions: [
              "Push this to SFDC"
            ]
          }
        }
      },
      sfdc_push: {
        keywords: ["push", "sfdc", "salesforce"],
        response: {
          en: {
            text: "✅ **Summary Pushed to Salesforce**\n\nThe lead summary has been updated in SFDC with the following details:\n\n• **Account:** Prime Industries Limited\n\n• **Opportunity Stage:** Qualification\n\n• **Product Interest:** Industrial Bearings\n\n• **Identified Needs / Pain Points:**\n  1. Frequent bearing failures causing unplanned downtime (3+ breakdowns/year)\n  2. High production loss due to unreliable supply and long lead times\n  3. Limited on-site bearing inventory – need for faster replenishment\n\n• **Expected Value:** ₹25+ lakhs/year\n\n• **Next Steps:** Schedule technical assessment for crusher gearbox specifications\n\nYou can view the complete opportunity details in SFDC under opportunity ID: **OPP-2025-PIL-001**.",
            showVisualization: false,
            showFollowUp: false,
            showFeedback: true
          }
        }
      }
    }
  },
  monthly_sales: {
    keywords: ["monthly", "split", "product", "april", "sept", "september"],
    subtopics: {
      product_split: {
        keywords: ["split", "product", "monthly", "april", "sept", "september", "apr", 'sep"'],
        response: {
          en: {
            text: "Here is a monthly sales split as per the products.\n\nThere is an increase of 10% in Aramid fibre and a dip of -3 % for Glass Fibre and -1% for Hybrid Fibre compared to last month.",
            showVisualization: true,
            showFollowUp: false,
            showFeedback: true,
            visualizationType: "monthly_sales"
          }
        }
      }
    }
  },
  lost_customers: {
    keywords: ["lost", "customers", "dip", "glass", "hybrid", "fibre", "list","customers"],
    subtopics: {
      product_customers: {
        keywords: ["list", "share", "customers", "lost", "products", "dip"],
        response: {
          en: {
            text: "Here is the list of lost customers for Glass Fibre and Hybrid Fibre products:",
            showVisualization: true,
            showFollowUp: false,
            showFeedback: true,
            visualizationType: "lost_customers"
          }
        }
      }
    }
  },
  sales_contribution: {
    keywords: ["contribution", "mohits", "aramid", "fibre", "sales", "team", "compared"],
    subtopics: {
      team_contribution: {
        keywords: ["contribution", "show", "mohits", "aramid", "sales", "compared", "team"],
        response: {
          en: {
            text: "Mohit has contributed 23.68% of overall Aramid Fibre sales in Q1 2025 compared to the team",
            showVisualization: true,
            showFollowUp: false,
            showFeedback: true,
            visualizationType: "aramid_contribution",
          }
        }
      }
    }
  }
};

// Add this constant at the top of the file with other constants
const BILLING_DATA = {
  labels: [
    'Spares and Accessories Shop',
    'Independent Workshops (IWS)',
    'Lube Shop',
    'Motul Garage - PCMO',
    'Motul Garage - MCO',
    'Motul Rural Distributor',
    'PCMO Premium Club'
  ],
  percentages: [45.75, 41.36, 44.44, 35.38, 89.62, 84.86, 58.37]
};

// Add this function to generate the pie chart configuration
const getBillingChartConfig = () => {
  return {
    series: [{
      name: 'Billing Percentage',
      data: BILLING_DATA.percentages
    }],
    options: {
      chart: {
        type: 'bar',
        height: 400,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%'
        }
      },
      colors: ['#D97706'],  // Changed to orange
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val.toFixed(1) + '%';
        },
        style: {
          fontSize: '13px',
          fontWeight: '500',
          colors: ['#ffffff']
        },
        textAnchor: 'start',
        offsetX: 5,
        dropShadow: {
          enabled: false
        },
        background: {
          enabled: false
        }
      },
      xaxis: {
        categories: BILLING_DATA.labels,
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: '400'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        max: 100
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: '400'
          },
          maxWidth: undefined,
          minHeight: undefined,
          trim: false
        }
      },
      grid: {
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: false
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return val.toFixed(1) + '%';
          }
        }
      }
    }
  };
};

// Update the response function to use the new chart configuration
const getBillingAnalysisResponse = () => {
  const highestBilling = Math.max(...BILLING_DATA.percentages);
  const lowestBilling = Math.min(...BILLING_DATA.percentages);
  const avgBilling = BILLING_DATA.percentages.reduce((a, b) => a + b, 0) / BILLING_DATA.percentages.length;
  
  const highestChannel = BILLING_DATA.labels[BILLING_DATA.percentages.indexOf(highestBilling)];
  const lowestChannel = BILLING_DATA.labels[BILLING_DATA.percentages.indexOf(lowestBilling)];

  return {
    text: `Based on the **July'25** billing data analysis:

• The average billing percentage across all channels is **${avgBilling.toFixed(2)}%**
• **${highestChannel}** shows the highest billing rate at **${highestBilling}%**, demonstrating strong performance in payment collection.
• **${lowestChannel}** has the lowest billing rate at **${lowestBilling}%**, indicating potential areas for improvement in payment collection.
• Most traditional channels (**Spares Shops**, **Lube Shops**) maintain moderate billing rates (**40-50%**)`,
    showVisualization: true,
    chartConfig: getBillingChartConfig()
  };
};

// Add after the BILLING_DATA constant
const DROP_SIZE_DATA = {
  labels: [
    'Spares and Accessories Shop',
    'Independent Workshops (IWS)',
    'Lube Shop',
    'Motul Garage - PCMO',
    'Motul Garage - MCO',
    'Motul Rural Distributor',
    'PCMO Premium Club'
  ],
  values: [49, 44, 68, 61, 54, 158, 113]
};

// Add the new chart configuration function
const getDropSizeChartConfig = () => {
  return {
    series: [{
      name: 'Average Drop Size',
      data: DROP_SIZE_DATA.values
    }],
    options: {
      chart: {
        type: 'bar',
        height: 500,  // Increased height to accommodate labels
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          dataLabels: {
            position: 'top'
          }
        }
      },
      colors: ['#3551F3'],
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val + ' L';
        },
        style: {
          fontSize: '12px',
          fontWeight: '500',
          colors: ['#000000']
        },
        offsetY: -20
      },
      xaxis: {
        categories: DROP_SIZE_DATA.labels,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '400'
          },
          rotate: -45,
          offsetY: 5,
          maxHeight: 150,
          trim: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '400'
          },
          formatter: function(val) {
            return val + ' L';
          }
        }
      },
      grid: {
        yaxis: {
          lines: {
            show: true
          }
        },
        xaxis: {
          lines: {
            show: false
          }
        },
        padding: {
          bottom: 20  // Added padding at bottom
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return val + ' L';
          }
        }
      }
    }
  };
};

// Add the response function for drop size query
const getDropSizeAnalysisResponse = () => {
  const highestDrop = Math.max(...DROP_SIZE_DATA.values);
  const lowestDrop = Math.min(...DROP_SIZE_DATA.values);
  const avgDrop = DROP_SIZE_DATA.values.reduce((a, b) => a + b, 0) / DROP_SIZE_DATA.values.length;
  
  const highestChannel = DROP_SIZE_DATA.labels[DROP_SIZE_DATA.values.indexOf(highestDrop)];
  const lowestChannel = DROP_SIZE_DATA.labels[DROP_SIZE_DATA.values.indexOf(lowestDrop)];

  return {
    text: `Based on the analysis of **Average Drop Size Per Order** by channel:

• The overall average drop size across all channels is **${avgDrop.toFixed(0)} L.**
• **${highestChannel}** shows the highest average drop size at **${highestDrop} L**, indicating larger bulk orders.
• **${lowestChannel}** has the lowest average drop size at **${lowestDrop} L**, suggesting smaller, more frequent orders.
• **Traditional channels** (Spares Shops, Lube Shops) maintain moderate drop sizes between **44-68 L** per order.`,
    showVisualization: true,
    chartConfig: getDropSizeChartConfig()
  };
};

// Utility functions for the hybrid matching system
const normalizeText = (text) => {
  return text.toLowerCase().trim();
};

const calculateSimilarity = (str1, str2) => {
  // Simple Levenshtein distance implementation
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }
  
  return 1 - (matrix[str2.length][str1.length] / Math.max(str1.length, str2.length));
};

const detectLanguage = (text) => {
  // Simple language detection based on common words
  const indonesianWords = ['apa', 'bagaimana', 'siapa', 'mengapa', 'kapan', 'dimana', 'berapa', 'apakah'];
  const hindiWords = ['क्या', 'कौन', 'कैसे', 'क्यों', 'कब', 'कहाँ', 'में', 'की', 'है', 'हैं'];
  const normalizedText = normalizeText(text);
  
  if (hindiWords.some(word => normalizedText.includes(word))) {
    return 'hi';
  }
  if (indonesianWords.some(word => normalizedText.includes(word))) {
    return 'id';
  }
  return 'en';
};

const findBestMatch = (query, context = null) => {
  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(' ').filter(w => w.length > 2); // ignore small words
  
  let bestMatch = null;
  let highestScore = 0;
  
  Object.entries(topicMatcher).forEach(([topicKey, topic]) => {
    // Topic Score: Check each word against keywords
    const topicScore = topic.keywords.reduce((max, keyword) => {
      const wordScores = words.map(word => calculateSimilarity(word, keyword));
      return Math.max(max, Math.max(...wordScores));
    }, 0);
    
    Object.entries(topic.subtopics).forEach(([subtopicKey, subtopic]) => {
      // Subtopic Score: Check each word against keywords
      const subtopicScore = subtopic.keywords.reduce((max, keyword) => {
        const wordScores = words.map(word => calculateSimilarity(word, keyword));
        return Math.max(max, Math.max(...wordScores));
      }, 0);
      
      // Weight exact matches more heavily
      const exactMatchBonus = words.some(word => 
        topic.keywords.includes(word) || subtopic.keywords.includes(word)
      ) ? 0.3 : 0;
      
      const combinedScore = (topicScore + subtopicScore) / 2 + exactMatchBonus;
      
      if (combinedScore > highestScore) {
        highestScore = combinedScore;
        bestMatch = {
          topic: topicKey,
          subtopic: subtopicKey,
          score: combinedScore
        };
      }
    });
  });
  
  return bestMatch && bestMatch.score >= 0.2 ? bestMatch : null;
};

export default function MiningChatPage() {
  const location = useLocation();
  const { toast } = useToast();
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistorySearch, setChatHistorySearch] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showSteps, setShowSteps] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [currentContext, setCurrentContext] = useState(null);
  const initialized = useRef(false);
  const [searchPill, setSearchPill] = useState(null);

  const loadingSteps = [
    {
      title: "Understanding your query..."
    },
    {
      title: "Scanning mining data for key insights..."
    },
    {
      title: "Analyzing data for relevant context..."
    },
    {
      title: "Compiling structured insights..."
    },
    {
      title: "Generating response and next best actions..."
    }
  ];

  const getCustomLoadingSteps = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    const language = detectLanguage(query);
    
    if (language === 'hi' && normalizedQuery.includes('फीचर्स')) {
      return [
        {
          title: "आपका सवाल समझा जा रहा है..."
        },
        {
          title: "Mining डेटा को ध्यान से देखा रहा है ताकि ज़रूरी बातें निकाली जा सकें..."
        },
        {
          title: "सही संदर्भ में डेटा का विश्लेषण किया जा रहा है..."
        },
        {
          title: "ज़रूरी जानकारी को अच्छे से तैयार किया जा रहा है..."
        },
        {
          title: "अब जवाब और अगला सबसे अच्छा कदम तैयार किया जा रहा है..."
        }
      ];
    }
    
    if (normalizedQuery.includes('billed') || normalizedQuery.includes('billing') || 
        normalizedQuery.includes('drop size') || normalizedQuery.includes('average drop')) {
      return [
        {
          title: "Checking conversation context..."
        },
        {
          title: "Parsing the user query..."
        },
        {
          title: "Analyzing formulas and calculations..."
        },
        {
          title: "Retrieving and analyzing data..."
        },
        {
          title: "Generating a response..."
        },
        {
          title: "Generating visualizations..."
        }
      ];
    }

    if (normalizedQuery.includes('monthly') && normalizedQuery.includes('sales')) {
      return [
        {
          title: "Retrieving data from the current dashboard..."
        },
        {
          title: "Extracting the context..."
        },
        {
          title: "Extracting Sales data from Salesforce for the products..."
        },
        {
          title: "Generating response and next best actions..."
        }
      ];
    }
    
    if (normalizedQuery.includes('lost') || normalizedQuery.includes('customers')) {
      return [
        {
          title: "Retrieving data from the current dashboard..."
        },
        {
          title: "Extracting the context..."
        },
        {
          title: "Extracting Lost Customer data from Salesforce for the products..."
        },
        {
          title: "Generating response and next best actions..."
        }
      ];
    }
    
    if (normalizedQuery.includes('contribution') && normalizedQuery.includes('mohit')) {
      return [
        {
          title: "Retrieving data from the current dashboard..."
        },
        {
          title: "Extracting the context..."
        },
        {
          title: "Extracting Sales data from Salesforce for the products..."
        },
        {
          title: "Generating response and next best actions..."
        }
      ];
    }

    if (normalizedQuery.includes('copper') || normalizedQuery.includes('performing')) {
      return [
        {
          title: "Understanding your query..."
        },
        {
          title: "Fetching copper price data from the London Metal Exchange..."
        },
        {
          title: "Analyzing price fluctuations over the past three months..."
        },
        {
          title: "Gathering insights from market analysts and investment reports..."
        },
        {
          title: "Generating structured response and next best actions..."
        }
      ];
    }
    if (normalizedQuery.includes('bearing') || (normalizedQuery.includes('failures') || normalizedQuery.includes('impact'))) {
      return [
        {
          title: "Retrieving machine downtime and maintenance logs from SAP..."
        },
        {
          title: "Extracting historical bearing failure incidents from RCA reports..."
        },
        {
          title: "Analyzing production loss and maintenance cost details..."
        },
        {
          title: "Referring to SOP documents for standard impact assessment methods..."
        },
        {
          title: "Compiling complete impact analysis of bearing failures on production..."
        }
      ];
    }
    if (normalizedQuery === 'apakah tersedia alat untuk memprediksi ghg?') {
      return [
        {
          title: "Memahami pertanyaan Anda..."
        },
        {
          title: "Memindai data pertambangan untuk mendapatkan wawasan utama..."
        },
        {
          title: "Menganalisis data untuk konteks yang relevan..."
        },
        {
          title: "Menyusun wawasan secara terstruktur..."
        },
        {
          title: "Menghasilkan respons dan tindakan terbaik berikutnya..."
        }
      ];
    }
    if (normalizedQuery.includes('plant head') || normalizedQuery.includes('probing questions')) {
      return [
        {
          title: "Searching internal Sales Playbooks for discovery frameworks..."
        },
        {
          title: "Extracting relevant probing questions for plant-level prospects..."
        },
        {
          title: "Retrieving additional insights from Salesforce Knowledge base..."
        },
        {
          title: "Identifying common challenges faced by Plant Heads in cement industry..."
        },
        {
          title: "Compiling best practices from past successful engagements..."
        },
        {
          title: "Preparing final recommended probing questions..."
        }
      ];
    }
    if (normalizedQuery.includes('push') && normalizedQuery.includes('sfdc')) {
      return [
        {
          title: "Preparing lead summary for Salesforce upload..."
        },
        {
          title: "Verifying account and opportunity details..."
        },
        {
          title: "Mapping fields to Salesforce data structure..."
        },
        {
          title: "Pushing the summary to Salesforce (SFDC)..."
        },
        {
          title: "Confirming successful update in Salesforce..."
        }
      ];
    }
    if (normalizedQuery.includes('prime') || normalizedQuery.includes('industries')) {
      return [
        {
          title: "Retrieving chat history..."
        },
        {
          title: "Extracting key discussion points..."
        },
        {
          title: "Summarizing outcomes..."
        }
      ];
    }
    return loadingSteps;
  };

  const getCustomSources = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    const language = detectLanguage(query);
    
    if (language === 'hi' && normalizedQuery.includes('फीचर्स')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "ECS वेबसाइट"
        }
      ];
    }
    
    if (normalizedQuery.includes('billed') || normalizedQuery.includes('billing') || 
        normalizedQuery.includes('drop size') || normalizedQuery.includes('average drop')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Secondary_Data.csv"
        }
      ];
    }
    
    if (normalizedQuery.includes('monthly') && normalizedQuery.includes('sales') ||
        normalizedQuery.includes('lost') || normalizedQuery.includes('customers') ||
        normalizedQuery.includes('contribution') || normalizedQuery.includes('mohit')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Dashboard"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Salesforce"
        }
      ];
    }

    if (normalizedQuery.includes('copper') || normalizedQuery.includes('performing')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "London Metal Exchange"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Investment Reports"
        }
      ];
    }
    if (normalizedQuery.includes('bearing') || (normalizedQuery.includes('failures') || normalizedQuery.includes('impact'))) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "SAP"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "RCA Reports"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "SOP Documents"
        }
      ];
    }
    if (normalizedQuery === 'apakah tersedia alat untuk memprediksi ghg?') {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Website ECS"
        }
      ];
    }
    if (normalizedQuery.includes('plant head') || normalizedQuery.includes('probing questions')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Sales Playbook"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Salesforce Knowledge"
        }
      ];
    }
    if (normalizedQuery.includes('push') && normalizedQuery.includes('sfdc')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Salesforce"
        }
      ];
    }
    if (normalizedQuery.includes('prime') || normalizedQuery.includes('industries')) {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Conversation History"
        }
      ];
    }
    return [
      {
        icon: <FileText className="w-4 h-4" />,
        text: "ECS Website"
      }
    ];
  };

  // Handle initial message from search or session storage
  useEffect(() => {
    const processInitialQuery = async () => {
      const initialQuery = sessionStorage.getItem('initialChatQuery');
      
      if (initialQuery && !initialized.current && messages.length === 0) {
        initialized.current = true;
        
        const newChat = {
          id: Date.now(),
          title: initialQuery.length > 30 ? `${initialQuery.slice(0, 30)}...` : initialQuery
        };
        
        setCurrentChat(newChat);
        
        const userMessage = {
          id: Date.now(),
          text: initialQuery,
          sender: 'user'
        };
        
        setMessages([userMessage]);
        await handleSearch(initialQuery);
        
        // Clear the session storage
        sessionStorage.removeItem('initialChatQuery');
      }
    };

    processInitialQuery();
  }, []);

  // Handle initial pill from session storage
  useEffect(() => {
    const pillTitle = sessionStorage.getItem('chatPillTitle');
    if (pillTitle) {
      setSearchPill(pillTitle);
      sessionStorage.removeItem('chatPillTitle'); // Clear after reading
    }
  }, []);

  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setInputValue("");
    setChatHistorySearch("");
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
    setInputValue("");
    setChatHistorySearch("");
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep(0);
    setShowVisualization(false);
    setCompletedSteps([]);
    setCurrentQuery(query.trim());
    
    if (query.toLowerCase().includes('billed') || query.toLowerCase().includes('billing')) {
      const customSteps = getCustomLoadingSteps(query.trim());
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + 2;  // Increase by 2 instead of 1
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= customSteps.length - 1) {
            clearInterval(stepInterval);
            setLoadingProgress(100);  // Ensure we reach 100%
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = getBillingAnalysisResponse();
      const messageResponse = {
        id: Date.now(),
        text: response.text,
        sender: 'assistant',
        showVisualization: response.showVisualization,
        chartConfig: response.chartConfig,
        showFollowUp: false,
        showFeedback: true
      };
      
      setMessages(prev => [...prev, messageResponse]);
      setIsLoading(false);
      setShowVisualization(true);
      setCurrentStep(customSteps.length - 1);
      setCompletedSteps(customSteps.map((_, index) => index));
      setLoadingProgress(100);  // Ensure 100% when complete
      
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      return;
    }

    if (query.toLowerCase().includes('drop size') || query.toLowerCase().includes('average drop')) {
      const customSteps = getCustomLoadingSteps(query.trim());
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + 2;  // Increase by 2 instead of 1
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= customSteps.length - 1) {
            clearInterval(stepInterval);
            setLoadingProgress(100);  // Ensure we reach 100%
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = getDropSizeAnalysisResponse();
      const messageResponse = {
        id: Date.now(),
        text: response.text,
        sender: 'assistant',
        showVisualization: response.showVisualization,
        chartConfig: response.chartConfig,
        showFollowUp: false,
        showFeedback: true
      };
      
      setMessages(prev => [...prev, messageResponse]);
      setIsLoading(false);
      setShowVisualization(true);
      setCurrentStep(customSteps.length - 1);
      setCompletedSteps(customSteps.map((_, index) => index));
      setLoadingProgress(100);  // Ensure 100% when complete
      
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      return;
    }

    try {
      const match = findBestMatch(query, currentContext);
      const language = detectLanguage(query);
      
      if (!match) {
        const defaultResponse = {
          id: Date.now(),
          text: language === 'id' 
            ? "Maaf, saya tidak dapat menemukan informasi yang tepat untuk pertanyaan Anda. Mohon coba dengan pertanyaan yang berbeda atau lebih spesifik."
            : "I'm sorry, I couldn't find the exact information for your query. Please try rephrasing your question or be more specific.",
          sender: 'assistant',
          showVisualization: false,
          showFollowUp: false,
          showFeedback: true
        };
        
        setMessages(prev => [...prev, defaultResponse]);
        setCurrentContext(null);
        return;
      }
      
      setCurrentContext({
        currentTopic: match.topic,
        currentSubtopic: match.subtopic
      });
      
      const matchedResponse = topicMatcher[match.topic].subtopics[match.subtopic].response[language] || 
                            topicMatcher[match.topic].subtopics[match.subtopic].response.en;
      
      const customSteps = getCustomLoadingSteps(query.trim());
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 1, 100));
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= customSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsTyping(true);
      
      const searchResponse = {
        id: Date.now(),
        text: matchedResponse.text,
        sender: 'assistant',
        videoUrl: matchedResponse.videoUrl,
        videoThumbnail: matchedResponse.videoThumbnail,
        showVisualization: matchedResponse.showVisualization,
        showFollowUp: matchedResponse.showFollowUp,
        showFeedback: matchedResponse.showFeedback,
        visualizationType: matchedResponse.visualizationType,
        followUpQuestions: matchedResponse.followUpQuestions
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(prev => [...prev, searchResponse]);
      
      setIsTyping(false);
      if (searchResponse.showVisualization && (searchResponse.visualizationType === 'copper' || searchResponse.visualizationType === 'monthly_sales')) {
        setShowVisualization(true);
      }
      setCurrentStep(customSteps.length - 1);
      setCompletedSteps(customSteps.map((_, index) => index));
      
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      
    } catch (error) {
      console.error('Error processing search:', error);
      const errorResponse = {
        id: Date.now(),
        text: detectLanguage(query) === 'id'
          ? "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi."
          : "Sorry, there was an error processing your request. Please try again.",
        sender: 'assistant',
        showVisualization: false,
        showFollowUp: false,
        showFeedback: true
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    if (!currentChat) {
      const newChat = {
        id: Date.now(),
        title: inputValue.length > 30 ? `${inputValue.slice(0, 30)}...` : inputValue
      };
      setCurrentChat(newChat);
    }

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    await handleSearch(userMessage.text);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset the file input
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(file => file.id !== id));
  };

  const handleRemoveFile = (fileToRemove) => {
    setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleRemovePill = () => {
    setSearchPill(null);
  };

  const filteredHistory = Object.entries(chatHistory).reduce((acc, [key, chats]) => {
    const filtered = chats.filter(chat => 
      chat.title.toLowerCase().includes(chatHistorySearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[key] = filtered;
    }
    return acc;
  }, {});

  const handleFollowUpClick = async (query) => {
    const userMessage = {
      id: Date.now(),
      text: query,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    await handleSearch(query);
  };

  const handlePin = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden relative">
        {/* Custom Toast */}
        <div
          className={`
            fixed top-4 right-4 z-50
            flex items-center gap-2 
            bg-white text-gray-900 
            px-4 py-3 rounded-lg shadow-lg
            transform transition-all duration-300 ease-in-out
            ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}
          `}
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="font-medium">Chart is pinned to the dashboard</span>
        </div>

        {/* Chat Sidebar */}
        <div className="w-[280px] bg-white border-r flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
              <p className="text-sm text-gray-500">Your conversation history</p>
            </div>
            <button 
              onClick={startNewChat}
              className="w-full bg-[#3551F3] hover:bg-[#2B41D9] text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-4">
              {/* Today's Chats */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Today</h3>
                {chatHistory.today.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>

              {/* Yesterday's Chats */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Yesterday</h3>
                {chatHistory.yesterday.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>

              {/* Previous Week */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Previous 7 Days</h3>
                {chatHistory.previousWeek.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>

              {/* Previous Month */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Previous 30 Days</h3>
                {chatHistory.previousMonth.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl ${
                      currentChat?.id === chat.id 
                        ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#FAFBFD]">
          {!currentChat ? (
            // New Chat View
            <div className="h-full flex flex-col items-center justify-center max-w-[800px] mx-auto px-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Hello, Vraj</h1>
              <p className="text-lg text-gray-500 mb-8 text-center">Ask me anything and search through your knowledge base</p>
              <div className="w-full">
                <div className="relative flex flex-col gap-3">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <div className="w-full flex items-center gap-2 pl-12 pr-24 py-2 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#3551F3] focus-within:border-transparent transition-all">
                      {searchPill && (
                        <div className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-sm">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[200px] truncate">{searchPill}</span>
                          <button
                            onClick={handleRemovePill}
                            className="hover:bg-[#3551F3] hover:text-white p-0.5 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[100px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(file.id)}
                            className="hover:bg-[#3551F3] hover:text-white p-0.5 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={chatHistorySearch}
                        onChange={(e) => setChatHistorySearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && chatHistorySearch.trim()) {
                            e.preventDefault();
                            const query = chatHistorySearch.trim();
                            
                            const newChat = {
                              id: Date.now(),
                              title: query.length > 30 ? `${query.slice(0, 30)}...` : query
                            };
                            setCurrentChat(newChat);
                            
                            // Add user message before search
                            const userMessage = {
                              id: Date.now(),
                              text: query,
                              sender: 'user'
                            };
                            setMessages([userMessage]);
                            
                            handleSearch(query);
                            setAttachments([]);
                            setChatHistorySearch('');
                            setSearchPill(null);
                          }
                        }}
                        placeholder="Search for information about operations, equipment, safety protocols, and more..."
                        className="flex-1 text-base text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg transition-colors text-[#3551F3] hover:bg-[#EEF2FF]"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (chatHistorySearch.trim()) {
                            const query = chatHistorySearch.trim();
                            
                            const newChat = {
                              id: Date.now(),
                              title: query.length > 30 ? `${query.slice(0, 30)}...` : query
                            };
                            setCurrentChat(newChat);
                            
                            // Add user message before search
                            const userMessage = {
                              id: Date.now(),
                              text: query,
                              sender: 'user'
                            };
                            setMessages([userMessage]);
                            
                            handleSearch(query);
                            setAttachments([]);
                            setChatHistorySearch('');
                            setSearchPill(null);
                          }
                        }}
                        className="p-2 rounded-lg transition-colors bg-[#3551F3] text-white hover:bg-[#2B41D9]"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat View
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-5xl mx-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {msg.sender === 'assistant' && messages[index - 1]?.sender === 'user' && completedSteps.length > 0 && (
                        <button
                          onClick={() => setShowSteps(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                          className="flex items-center gap-1.5 mb-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {showSteps[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          View Processing Steps
                        </button>
                      )}
                      {showSteps[msg.id] && (
                        <div className="w-full mb-3 bg-white rounded-2xl p-6 space-y-5 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold text-gray-900">Sources:</h3>
                            <div className="flex gap-3">
                              {getCustomSources(currentQuery).map((source, index) => (
                                <div key={index} className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2 rounded-xl text-sm font-medium">
                                  {source.icon}
                                  {source.text}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-base font-semibold text-gray-900">Request processed</h3>
                              <span className="text-sm text-gray-500 font-medium">{Math.round(loadingProgress)}%</span>
                            </div>
                            <Progress value={loadingProgress} className="h-1.5" />
                          </div>
                          
                          <LoadingSteps steps={getCustomLoadingSteps(currentQuery)} currentStep={currentStep} />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl py-2.5 px-4 ${
                          msg.sender === 'user'
                            ? 'bg-[#EEF2FF] text-gray-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {msg.sender === 'assistant' ? (
                          <div className="w-full space-y-4">
                            <div className="whitespace-pre-wrap leading-relaxed">
                              <TypewriterText 
                                text={msg.text} 
                                delay={5} 
                                onComplete={() => {
                                  if (msg.showVisualization) {
                                    const vizElement = document.querySelector(`#viz-${msg.id}`);
                                    if (vizElement) {
                                      vizElement.style.opacity = '1';
                                      vizElement.style.transform = 'translateY(0)';
                                    }
                                  }
                                  const actionsElement = document.querySelector(`#actions-${msg.id}`);
                                  if (actionsElement) {
                                    actionsElement.style.opacity = '1';
                                    actionsElement.style.transform = 'translateY(0)';
                                  }
                                  const followUpElement = document.querySelector(`#follow-up-${msg.id}`);
                                  if (followUpElement) {
                                    followUpElement.style.opacity = '1';
                                    followUpElement.style.transform = 'translateY(0)';
                                  }
                                }}
                              />
                              {msg.videoUrl && (
                                <div 
                                  id={`video-${msg.id}`}
                                  className="mt-6 w-full max-w-2xl transition-all duration-500"
                                  style={{ 
                                    opacity: 0,
                                    transform: 'translateY(20px)',
                                    display: 'none'
                                  }}
                                >
                                  <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                      src={msg.videoUrl}
                                      title="Smart EPS Video"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    />
                                  </div>
                                </div>
                              )}
                              {msg.showVisualization && msg.chartConfig ? (
                                <div 
                                  id={`viz-${msg.id}`}
                                  className="transition-all duration-500"
                                  style={{ opacity: 0, transform: 'translateY(20px)' }}
                                >
                                  <ErrorBoundary>
                                    <MiningDataVisualization
                                      show={true}
                                      chartConfig={msg.chartConfig}
                                      onPin={handlePin}
                                    />
                                  </ErrorBoundary>
                                </div>
                              ) : null}
                              {msg.showVisualization && msg.visualizationType && !msg.chartConfig && (
                                <>
                                  {msg.visualizationType === 'copper' && (
                                    <div 
                                      className="mt-6 transition-all duration-500"
                                      style={{ 
                                        opacity: showVisualization ? 1 : 0,
                                        transform: showVisualization ? 'translateY(0)' : 'translateY(20px)',
                                        display: showVisualization ? 'block' : 'none'
                                      }}
                                    >
                                      <MiningDataVisualization 
                                        show={showVisualization}
                                        onPin={handlePin}
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                              {msg.showVisualization && msg.visualizationType === 'monthly_sales' && (
                                <div 
                                  className="mt-6 transition-all duration-500"
                                  style={{ 
                                    opacity: showVisualization ? 1 : 0,
                                    transform: showVisualization ? 'translateY(0)' : 'translateY(20px)',
                                    display: showVisualization ? 'block' : 'none'
                                  }}
                                >
                                  <MonthlySalesVisualization 
                                    show={showVisualization}
                                    onPin={handlePin}
                                    chatQuery={currentQuery}
                                  />
                                </div>
                              )}
                              {msg.showVisualization && msg.visualizationType === 'lost_customers' && (
                                <div 
                                  className="mt-6 transition-all duration-500"
                                  style={{ 
                                    opacity: showVisualization ? 1 : 0,
                                    transform: showVisualization ? 'translateY(0)' : 'translateY(20px)',
                                    display: showVisualization ? 'block' : 'none'
                                  }}
                                >
                                  <LostCustomersVisualization 
                                    show={showVisualization}
                                    onPin={handlePin}
                                  />
                                </div>
                              )}
                              {msg.showVisualization && msg.visualizationType === 'aramid_contribution' && (
                                <div 
                                  className="mt-6 transition-all duration-500"
                                  style={{ 
                                    opacity: showVisualization ? 1 : 0,
                                    transform: showVisualization ? 'translateY(0)' : 'translateY(20px)',
                                    display: showVisualization ? 'block' : 'none'
                                  }}
                                >
                                  <AramidContributionVisualization 
                                    show={showVisualization}
                                    onPin={handlePin}
                                  />
                                </div>
                              )}
                            </div>
                            <div 
                              id={`actions-${msg.id}`}
                              className="flex items-center gap-2 transition-all duration-500"
                              style={{ opacity: 0, transform: 'translateY(20px)' }}
                            >
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ThumbsUp className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ThumbsDown className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Copy className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Share2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            {msg.showFollowUp && (
                              <div 
                                id={`follow-up-${msg.id}`}
                                className="mt-4 transition-all duration-500"
                                style={{ 
                                  opacity: 0, 
                                  transform: 'translateY(20px)',
                                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                                }}
                              >
                                {currentQuery === "Apakah tersedia alat untuk memprediksi GHG?" ? (
                                  <button 
                                    onClick={() => handleFollowUpClick("Apa saja fitur dari Smart EPS?")}
                                    className="inline-block px-4 py-2 bg-[#EEF2FF] text-[#3551F3] rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
                                  >
                                    Apa saja fitur dari Smart EPS?
                                  </button>
                                ) : msg.followUpQuestions ? (
                                  <div className="flex flex-wrap gap-2">
                                    {msg.followUpQuestions.map((question, index) => (
                                      <button
                                        key={index}
                                        onClick={() => handleFollowUpClick(question)}
                                        className="inline-block px-4 py-2 bg-[#EEF2FF] text-[#3551F3] rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
                                      >
                                        {question}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleFollowUpClick("What are the features of Smart EPS?")}
                                    className="inline-block px-4 py-2 bg-[#EEF2FF] text-[#3551F3] rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
                                  >
                                    What are the features of Smart EPS?
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="bg-white rounded-2xl p-6 space-y-5 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-900">Sources:</h3>
                        <div className="flex gap-3">
                          {getCustomSources(currentQuery).map((source, index) => (
                            <div key={index} className="flex items-center gap-2 bg-[#3551F3] text-white px-4 py-2 rounded-xl text-sm font-medium">
                              {source.icon}
                              {source.text}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-semibold text-gray-900">Processing your request</h3>
                          <span className="text-sm text-gray-500 font-medium">{Math.round(loadingProgress)}%</span>
                        </div>
                        <Progress value={loadingProgress} className="h-1.5" />
                      </div>
                      
                      <LoadingSteps steps={getCustomLoadingSteps(currentQuery)} currentStep={currentStep} />
                    </div>
                  )}

                  {isTyping && !isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl p-4">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-6">
                <div className="max-w-5xl mx-auto relative flex items-center">
                  <div className="w-full flex items-center bg-white border border-gray-200 rounded-xl pr-24 focus-within:border-gray-200 ring-0">
                    <div className="flex items-center gap-2 flex-shrink-0 py-2 px-3">
                      {attachments.map(file => (
                        <div key={file.id} className="flex items-center bg-blue-50 rounded-full px-3 py-1 text-xs text-blue-700">
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeAttachment(file.id)}
                            className="ml-1.5 hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                      placeholder="Type your message..."
                      className="border-0 shadow-none focus-visible:ring-0 focus:ring-0 ring-0 text-base bg-transparent h-[52px] focus-visible:ring-offset-0"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="p-2 rounded-lg bg-[#3551F3] text-white hover:bg-[#2B41D9] transition-colors"
                      disabled={isLoading}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Toaster />

      {/* File attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg"
            >
              <span className="text-sm text-gray-600">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(file)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
} 