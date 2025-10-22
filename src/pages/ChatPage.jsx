import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp, ChevronRight, ThumbsUp, ThumbsDown, Copy, Share2, X } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { TypewriterText } from "@/components/TypewriterText";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useLocation } from "react-router-dom";
import { DataVisualization } from "@/components/DataVisualization";

// Mock chat history data
const chatHistory = {
  today: [
    { id: 1, title: "Tata Signa 4830.T के जैसे और कौन-कौन से ट्रक हैं?" },
    { id: 2, title: "भारी वाहनों की तुलना" }
  ],
  yesterday: [
    { id: 3, title: "ट्रक की वारंटी और सर्विसिंग" },
    { id: 4, title: "डीजल इंजन की क्षमता" }
  ],
  previousWeek: [
    { id: 5, title: "ट्रक खरीदने के लिए दस्तावेज" }
  ],
  previousMonth: [
    { id: 6, title: "ट्रक की कीमत और EMI" }
  ]
};

// Mock chat messages for each chat
const mockChatMessages = {
  1: [
    { id: 1, text: "Show me the loan leads assigned to me today", sender: 'user' },
    { id: 2, text: "Here are your assigned loan leads for today...", sender: 'assistant' }
  ],
  2: [
    { id: 1, text: "What documents are needed for home loan?", sender: 'user' },
    { id: 2, text: "Here's the list of required documents for home loan...", sender: 'assistant' }
  ]
};

export default function ChatPage() {
  const location = useLocation();
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
  const [tableVisibleByMessageId, setTableVisibleByMessageId] = useState({});
  const fileInputRef = useRef(null);

  const loadingSteps = [
    {
      title: "Understanding your query..."
    },
    {
      title: "Scanning SOP documents for key insights..."
    },
    {
      title: "Analyzing video content for relevant context..."
    },
    {
      title: "Compiling structured recommendations..."
    },
    {
      title: "Generating response and next best actions..."
    }
  ];

  // Hardcoded Hindi query and steps
  const HARD_CODED_HINDI_QUERY = "Tata Signa 4830.T के जैसे और कौन-कौन से ट्रक हैं?";
  const getHindiLoadingSteps = () => ([
    { title: "सवाल समझा जा रहा है..." },
    { title: "डाटा लोड और विश्लेषण किया जा रहा है..." },
    { title: "जवाब तैयार किया जा रहा है..." }
  ]);

  // Shared hardcoded Hindi response with comparison table
  const HINDI_TRUCK_RESPONSE = {
    text: "Tata Signa 4830.T एक बहुत ही मजबूत और लोकप्रिय ट्रक है। इस सेगमेंट में इसके मुख्य प्रतियोगी हैं Bharat Benz, Eicher, और Ashok Leyland।\n\nइसी तरह की कैटेगरी में आने वाले कुछ ट्रक हैं –\n\n1. Bharat Benz 4832R-95\n2. Eicher Pro 6048XP\n3. Ashok Leyland 10X2\n\n**पावर और परफॉर्मेंस – Tata का फायदा**\n\n• Tata Signa 4830.T में है 300 HP की पावर और 1100 Nm का टॉर्क, जो इसे बहुत दमदार बनाता है। इससे गाड़ी को ज्यादा खींचने की ताकत और तेज़ काम पूरा करने की क्षमता मिलती है।\n\n• Bharat Benz 4832R-95 में है 306 HP और 1200 Nm, यानी थोड़ा ज़्यादा पावर। लेकिन Tata की 300 HP पावर हर भारी काम के लिए काफी है और इसका परफॉर्मेंस संतुलित और भरोसेमंद है।\n\n• Eicher Pro 6048XP में है 296 HP, जबकि Ashok Leyland 10X2 सिर्फ 247 HP देता है। पावर और टॉर्क में Tata, Ashok Leyland से काफी आगे है – यानी ऊबड़-खाबड़ रास्तों और भारी माल दोनों में बढ़िया प्रदर्शन।\n\n**फ्यूल टैंक – ज़्यादा दूरी, कम रुकावट**\n\n• Tata Signa 4830.T में है 365 लीटर का फ्यूल टैंक, जिससे ट्रक लंबी दूरी तय कर सकता है और कम बार रुकना पड़ता है। इससे समय की बचत और कमाई में बढ़ोतरी होती है।\n\n• Bharat Benz में 330 लीटर, Eicher में 350 लीटर, और Ashok Leyland में 375 लीटर टैंक है। Tata का टैंक Bharat Benz और Eicher से बड़ा है — यानी बेहतर रनिंग और कम स्टॉप्स।\n\n• हालांकि Ashok Leyland का टैंक थोड़ा बड़ा है, लेकिन Tata की पावर + वारंटी इसे बेहतर चुनाव बनाती है।\n\n**वारंटी – भरोसे की पहचान**\n\n• Tata Signa 4830.T के साथ मिलती है 6 साल या 6 लाख किमी की वारंटी, जो इस सेगमेंट में सबसे बढ़िया है। इससे ग्राहक को मिलता है भरोसा और निश्चिंतता, क्योंकि Tata को अपने ट्रक की मजबूती और टिकाऊपन पर पूरा भरोसा है।\n\n• Ashok Leyland और Eicher सिर्फ 4 साल की वारंटी देते हैं, जबकि Bharat Benz की वारंटी जानकारी साफ नहीं है।\n\n• Tata की लंबी वारंटी का मतलब है – कम खर्च, ज़्यादा चलने की गारंटी, और अच्छा रीसेल वैल्यू।\n\n**उपयोग – हर काम के लिए तैयार**\n\nTata Signa 4830.T हर तरह के काम में फिट बैठता है, जैसे –\n\n• इंडस्ट्रियल सामान\n\n• कृषि उत्पाद\n\n• टैंकर\n\n• सीमेंट बैग\n\n• कोयला, अयस्क (ore) और मिनरल\n\n• स्टील ट्रांसपोर्ट",
    showFollowUp: false,
    showFeedback: true,
    tableTitle: "विस्तृत तुलना",
    tableColumns: [
      { key: 'manufacturer', label: 'निर्माता' },
      { key: 'model', label: 'मॉडल' },
      { key: 'gvwKg', label: 'GVW (kg)' },
      { key: 'numCylinders', label: 'सिलेंडर की संख्या' },
      { key: 'fuelType', label: 'ईंधन का प्रकार' },
      { key: 'rearTyre', label: 'पीछे का टायर' },
      { key: 'brakeType', label: 'ब्रेक का प्रकार' },
      { key: 'cabinType', label: 'केबिन का प्रकार' },
      { key: 'frontTyre', label: 'आगे का टायर' },
      { key: 'clutchType', label: 'क्लच का प्रकार' },
      { key: 'engineType', label: 'इंजन का प्रकार' },
      { key: 'usage', label: 'उपयोग' },
      { key: 'engineModel', label: 'इंजन मॉडल' },
      { key: 'maxPowerKw', label: 'अधिकतम पावर (kW में)' },
      { key: 'gearboxModel', label: 'गियरबॉक्स मॉडल' },
      { key: 'gradeability', label: 'चढ़ाई क्षमता (%)' },
      { key: 'horsepowerHp', label: 'हॉर्सपावर (HP)' },
      { key: 'maxPowerRpm', label: 'अधिकतम पावर RPM' },
      { key: 'maxTorqueNm', label: 'अधिकतम टॉर्क (Nm)' },
      { key: 'emission', label: 'उत्सर्जन मानक (BS-VI आदि)' },
      { key: 'warrantyYears', label: 'वारंटी (सालों में)' },
      { key: 'wheelbaseMm', label: 'व्हीलबेस (mm में)' },
      { key: 'engineLiters', label: 'इंजन क्षमता (लीटर में)' },
      { key: 'clutchDiameterMm', label: 'क्लच डायमीटर (mm में)' },
      { key: 'fuelTankL', label: 'फ्यूल टैंक क्षमता (लीटर में)' },
      { key: 'warrantyKm', label: 'वारंटी दूरी (किमी में)' },
      { key: 'maxTorqueRpmHigh', label: 'अधिकतम टॉर्क RPM रेंज (ऊपरी सीमा)' },
      { key: 'maxTorqueRpmLow', label: 'अधिकतम टॉर्क RPM रेंज (निचली सीमा)' }
    ],
    tableData: [
      { manufacturer: 'Tata Motors', model: 'Tata Motors 4830.T', gvwKg: '47,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '11R20', brakeType: 'एयर ब्रेक', cabinType: '—', frontTyre: '11R20', clutchType: 'सिंगल प्लेट ड्राई फ्रिक्शन पुश टाइप क्लच', engineType: 'कमिंस 6.7 लीटर OBD-II इंजन', usage: 'औद्योगिक सामान, कृषि उत्पाद, टैंकर, सीमेंट बैग, कोयला, अयस्क व मिनरल, स्टील परिवहन', engineModel: 'कमिंस ISBe 6.7 लीटर OBD-II इंजन मॉडल', maxPowerKw: '224 किलोवाट पावर', gearboxModel: 'G 1150', gradeability: '-', horsepowerHp: '300 HP', maxPowerRpm: '2300 RPM', maxTorqueNm: '1100 Nm टॉर्क', emission: 'बीएस-VI उत्सर्जन मानक', warrantyYears: '6 साल वारंटी', wheelbaseMm: '7200 मिमी व्हीलबेस', engineLiters: '6.7 लीटर इंजन क्षमता', clutchDiameterMm: '430 मिमी क्लच डायमीटर', fuelTankL: '365 लीटर', warrantyKm: '6,00,000 किमी वारंटी दूरी', maxTorqueRpmHigh: '1700 RPM', maxTorqueRpmLow: '1100 RPM' },
      { manufacturer: 'Ashok Leyland', model: 'Ashok Leyland 4X2', gvwKg: '45,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '—', brakeType: 'ड्रम ब्रेक', cabinType: 'एम-इकोनॉमी केबिन, यू-वैल्यू केबिन, एन-प्रीमियम केबिन और जी काउल', frontTyre: '—', clutchType: 'सिंगल प्लेट ड्राई टाइप क्लच', engineType: 'कंप्रेशन इग्निशन टर्बो-चार्ज्ड इंटर-कूल्ड इंजन', usage: 'मार्केट लोड, सीमेंट, केमिकल्स, वेयरहाउसिंग, टैंकर', engineModel: 'एच-सीरीज़ 6 सिलेंडर इंजन', maxPowerKw: '147 किलोवाट पावर', gearboxModel: '6MT 86', gradeability: '-', horsepowerHp: '197 HP', maxPowerRpm: '-', maxTorqueNm: '700 Nm टॉर्क', emission: 'बीएस-VI उत्सर्जन मानक', warrantyYears: '4 साल वारंटी', wheelbaseMm: '3400 मिमी व्हीलबेस', engineLiters: '5.7 लीटर इंजन क्षमता', clutchDiameterMm: '380 मिमी क्लच डायमीटर', fuelTankL: '375 लीटर', warrantyKm: '4,00,000 किमी वारंटी दूरी', maxTorqueRpmHigh: '-', maxTorqueRpmLow: '-' },
      { manufacturer: 'Ashok Leyland', model: 'Ashok Leyland 10X2', gvwKg: '48,000', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '—', brakeType: 'ड्रम ब्रेक', cabinType: 'एम-इकोनॉमी केबिन, यू-वैल्यू केबिन, एन-प्रीमियम केबिन और जी काउल', frontTyre: '—', clutchType: '—', engineType: 'कंप्रेशन इग्निशन टर्बो-चार्ज्ड इंटर-कूल्ड इंजन', usage: 'बल्क हॉलिज (सीमेंट, स्टील, कोयला), कंस्ट्रक्शन, लॉन्ग-हॉल', engineModel: 'एच सीरीज़ 6 सिलेंडर / ए सीरीज़ 4 सिलेंडर इंजन', maxPowerKw: '184 किलोवाट पावर', gearboxModel: '9S1110', gradeability: '-', horsepowerHp: '247 HP', maxPowerRpm: '-', maxTorqueNm: '900 Nm टॉर्क', emission: 'बीएस-VI उत्सर्जन मानक', warrantyYears: '4 साल वारंटी', wheelbaseMm: '6600 मिमी व्हीलबेस', engineLiters: '6.0 लीटर इंजन क्षमता', clutchDiameterMm: '-', fuelTankL: '375 लीटर', warrantyKm: '4,00,000 किमी वारंटी दूरी', maxTorqueRpmHigh: '-', maxTorqueRpmLow: '-' },
      { manufacturer: 'Bharat Benz', model: 'Bharat Benz 4832R-95', gvwKg: '47,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '295/90R20', brakeType: 'ड्रम ब्रेक', cabinType: '—', frontTyre: '295/90R20', clutchType: 'सिंगल ड्राई प्लेट - ऑर्गेनिक क्लच', engineType: '6D26 BSVI OBD-II इंजन', usage: 'भारी सामान, स्टील, लंबी दूरी और अधिक लोड ट्रांसपोर्ट', engineModel: '6D26 BSVI OBD-II इंजन', maxPowerKw: '228 किलोवाट पावर', gearboxModel: 'G131 गियरबॉक्स', gradeability: '-', horsepowerHp: '306 हॉर्सपावर', maxPowerRpm: '2300 RPM', maxTorqueNm: '1200 Nm टॉर्क', emission: 'OBD-II उत्सर्जन मानक', warrantyYears: '-', wheelbaseMm: '6575 मिमी व्हीलबेस', engineLiters: '6.7 लीटर इंजन क्षमता', clutchDiameterMm: '430 मिमी क्लच डायमीटर', fuelTankL: '330 लीटर', warrantyKm: '6,00,000 किमी वारंटी दूरी', maxTorqueRpmHigh: '1500 RPM', maxTorqueRpmLow: '1200 RPM' },
      { manufacturer: 'Bharat Benz', model: 'Bharat Benz 4628T-4X2-85', gvwKg: '45,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '295/90R20 रेडियल', brakeType: 'ड्रम ब्रेक', cabinType: 'स्लीपर केबिन', frontTyre: '295/90R20 रेडियल', clutchType: 'सिंगल ड्राई प्लेट, हाइड्रोलिक कंट्रोल क्लच', engineType: 'OM 926 इंजन', usage: 'ट्रेलर (प्राइम मूवर), बल्क हॉलिज, ओडीसी, कंस्ट्रक्शन', engineModel: 'OM 926 इंजन', maxPowerKw: '210 किलोवाट पावर', gearboxModel: 'G131', gradeability: '18.7%', horsepowerHp: '282 HP', maxPowerRpm: '2200 RPM', maxTorqueNm: '1100 Nm', emission: 'BS-VI उत्सर्जन मानक', warrantyYears: '-', wheelbaseMm: '3600 मिमी व्हीलबेस', engineLiters: '7.2 लीटर इंजन क्षमता', clutchDiameterMm: '430 मिमी क्लच डायमीटर', fuelTankL: '455 लीटर', warrantyKm: '6,00,000 किमी वारंटी दूरी', maxTorqueRpmHigh: '1600 RPM', maxTorqueRpmLow: '1200 RPM' },
      { manufacturer: 'Bharat Benz', model: 'Bharat Benz 4828RT-66', gvwKg: '47,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '—', brakeType: 'ड्रम ब्रेक', cabinType: '—', frontTyre: '—', clutchType: 'सिंगल ड्राई प्लेट, हाइड्रोलिक कंट्रोल क्लच', engineType: 'OM 926 इंजन', usage: 'रिजिड टिपर, माइनिंग, कंस्ट्रक्शन मटेरियल हॉलिज', engineModel: 'OM 926 इंजन', maxPowerKw: '210 किलोवाट पावर', gearboxModel: 'G131', gradeability: '28.2%', horsepowerHp: '282 HP', maxPowerRpm: '2200 RPM', maxTorqueNm: '1100 Nm', emission: 'भारत स्टेज VI - OBD-II उत्सर्जन मानक', warrantyYears: '-', wheelbaseMm: '6575 मिमी व्हीलबेस', engineLiters: '7.2 लीटर इंजन क्षमता', clutchDiameterMm: '430 मिमी क्लच डायमीटर', fuelTankL: '330 लीटर', warrantyKm: '6,00,000 किमी वारंटी दूरी', maxTorqueRpmHigh: '1600 RPM', maxTorqueRpmLow: '1200 RPM' },
      { manufacturer: 'Eicher', model: 'Eicher Pro 6046', gvwKg: '45,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '11R20 / 295/90R20 (विकल्प)', brakeType: 'एयर ब्रेक', cabinType: 'स्लीपर केबिन', frontTyre: '11R20', clutchType: '—', engineType: '6 सिलेंडर, BS-VI इंजन', usage: 'सीमेंट, ISO कंटेनर, रीफर, स्टील कॉइल, टैंकर, टिप ट्रेलर', engineModel: 'VEDX8 इंजन', maxPowerKw: '191 किलोवाट पावर', gearboxModel: 'ET140S9', gradeability: '26%', horsepowerHp: '256 HP', maxPowerRpm: '2200 RPM', maxTorqueNm: '1000 Nm', emission: 'BS-VI उत्सर्जन मानक', warrantyYears: '4 साल वारंटी', wheelbaseMm: '3200 मिमी व्हीलबेस', engineLiters: '7.7 लीटर इंजन क्षमता', clutchDiameterMm: '430 मिमी क्लच डायमीटर', fuelTankL: '350 लीटर फ्यूल टैंक', warrantyKm: '-', maxTorqueRpmHigh: '1700 RPM', maxTorqueRpmLow: '1000 RPM' },
      { manufacturer: 'Eicher', model: 'Eicher Pro 6048XP', gvwKg: '47,500', numCylinders: '6', fuelType: 'डीज़ल', rearTyre: '295/90R20', brakeType: 'एयर ब्रेक', cabinType: 'स्लीपर केबिन', frontTyre: '295/90R20', clutchType: 'ड्राई सिंगल प्लेट क्लच', engineType: '6 सिलेंडर BS-VI इंजन', usage: 'कोयला, मार्केट लोड, सीमेंट, औद्योगिक सामान, टैंकर', engineModel: 'VEDX8 इंजन', maxPowerKw: '221 किलोवाट पावर', gearboxModel: 'ET140S9', gradeability: '-', horsepowerHp: '296 HP', maxPowerRpm: '2200 RPM', maxTorqueNm: '1200 Nm', emission: 'BS-VI उत्सर्जन मानक', warrantyYears: '4 साल वारंटी', wheelbaseMm: '6800 मिमी व्हीलबेस', engineLiters: '7.7 लीटर इंजन क्षमता', clutchDiameterMm: '430 मिमी क्लच डायमीटर', fuelTankL: '350 लीटर', warrantyKm: '-', maxTorqueRpmHigh: '1600 RPM', maxTorqueRpmLow: '1100 RPM' }
    ]
  };

  // Debug utilities
  const DEBUG_CHAT = true;
  const debugLog = (...args) => { if (DEBUG_CHAT && typeof window !== 'undefined') { console.log('[ChatPage]', ...args); } };

  // Normalize and detect the Hindi trucks query even with small variations
  const normalize = (text) => (text || "")
    .toLowerCase()
    .replace(/[\s\u200c\u200d]+/g, " ") // collapse spaces and ZW chars
    .replace(/[\-_.:,/\\|]/g, " ") // common punctuations to space
    .replace(/\s+/g, " ")
    .trim();

  const isHindiTruckQuery = (text) => {
    const t = normalize(text);
    const hasTataSigna = t.includes("tata signa 4830");
    const hasTruck = t.includes("ट्रक") || t.includes("truck");
    const result = hasTataSigna && hasTruck;
    debugLog('isHindiTruckQuery', { 
      text, 
      normalized: t, 
      hasTataSigna, 
      hasTruck, 
      result 
    });
    return result;
  };

  const detectLanguage = (text) => {
    // Simple language detection based on common words
    const marathiWords = ['कार', 'लोन', 'कागदपत्रे', 'आहे', 'साठी', 'कंपनी'];
    const hindiWords = ['ट्रक', 'हैं', 'कौन', 'जैसे', 'और', 'की', 'में', 'है', 'के', 'से', 'को', 'पर', 'तक', 'तो', 'भी', 'ही', 'सभी', 'कुछ', 'बहुत', 'अधिक', 'कम', 'बेहतर', 'अच्छा', 'मजबूत', 'लोकप्रिय', 'प्रतियोगी', 'कैटेगरी', 'पावर', 'परफॉर्मेंस', 'फायदा', 'टॉर्क', 'दमदार', 'ताकत', 'क्षमता', 'पुलिंग', 'काम', 'पूरा', 'करने', 'गाड़ी', 'खींचने', 'ज्यादा', 'तेज़', 'भारी', 'संतुलित', 'भरोसेमंद', 'आगे', 'ऊबड़', 'खाबड़', 'रास्तों', 'माल', 'दोनों', 'बढ़िया', 'प्रदर्शन', 'फ्यूल', 'टैंक', 'दूरी', 'रुकावट', 'लंबी', 'तय', 'कर', 'सकता', 'कम', 'बार', 'रुकना', 'पड़ता', 'समय', 'बचत', 'कमाई', 'बढ़ोतरी', 'होती', 'बड़ा', 'बेहतर', 'रनिंग', 'स्टॉप्स', 'हालांकि', 'थोड़ा', 'चुनाव', 'बनाती', 'वारंटी', 'भरोसे', 'पहचान', 'मिलती', 'साल', 'लाख', 'किमी', 'सेगमेंट', 'सबसे', 'बढ़िया', 'ग्राहक', 'मिलता', 'भरोसा', 'निश्चिंतता', 'मजबूती', 'टिकाऊपन', 'पूरा', 'देते', 'जानकारी', 'साफ', 'नहीं', 'लंबी', 'मतलब', 'खर्च', 'चलने', 'गारंटी', 'रीसेल', 'वैल्यू', 'उपयोग', 'तैयार', 'तरह', 'फिट', 'बैठता', 'इंडस्ट्रियल', 'सामान', 'कृषि', 'उत्पाद', 'टैंकर', 'सीमेंट', 'बैग', 'कोयला', 'अयस्क', 'ओरे', 'मिनरल', 'स्टील', 'ट्रांसपोर्ट', 'बहुउपयोगिता', 'वर्सेटिलिटी', 'डीलर्स', 'आत्मविश्वास', 'सुझा', 'सकते', 'चाहे', 'बिज़नेस', 'कोई', 'भी', 'हो'];
    const normalizedText = text.toLowerCase();
    
    if (marathiWords.some(word => text.includes(word))) {
      return 'mr';
    }
    if (hindiWords.some(word => text.includes(word))) {
      return 'hi';
    }
    return 'en';
  };

  const getCustomLoadingSteps = (query) => {
    const q = query || '';
    
    // If query is empty, return default steps (don't override with empty queries)
    if (!q.trim()) {
      debugLog('getCustomLoadingSteps:returning', 'Empty query - Default English steps');
      return loadingSteps;
    }
    
    const normalizedQuery = normalize(q);
    const normalizedHardCoded = normalize(HARD_CODED_HINDI_QUERY);
    const isExactMatch = normalizedQuery === normalizedHardCoded;
    const isHindi = isHindiTruckQuery(q);
    const lang = detectLanguage(q);
    
    debugLog('getCustomLoadingSteps', { 
      query: q, 
      normalized: normalizedQuery, 
      hardCodedQuery: HARD_CODED_HINDI_QUERY,
      normalizedHardCoded,
      isExactMatch,
      isHindi, 
      detectedLang: lang
    });
    
    // First check for exact match with hardcoded query
    if (isExactMatch) {
      debugLog('getCustomLoadingSteps:returning', 'Exact match - Hindi truck steps');
      return getHindiLoadingSteps();
    }
    
    // Then check for Hindi truck query pattern
    if (isHindi) {
      debugLog('getCustomLoadingSteps:returning', 'Hindi truck pattern - Hindi truck steps');
      return getHindiLoadingSteps();
    }
    
    // Then check for general Hindi language
    if (lang === 'hi') {
      debugLog('getCustomLoadingSteps:returning', 'Hindi language - Hindi steps');
      return getHindiLoadingSteps();
    }
    
    if (lang === 'mr') {
      debugLog('getCustomLoadingSteps:returning', 'Marathi steps');
      return [
        {
          title: "तुमचा प्रश्न समजत आहे..."
        },
        {
          title: "स्रोतांमधून उपयोगी माहिती काढत आहे..."
        },
        {
          title: "सोपी उत्तर तयार करत आहे आणि पुढे काय करायचं ते सांगत आहे..."
        }
      ];
    }
    
    debugLog('getCustomLoadingSteps:returning', 'Default English steps');
    return loadingSteps;
  };

  const getCustomSources = (query) => {
    const language = detectLanguage(query);
    
    if (language === 'mr') {
      return [
        {
          icon: <FileText className="w-4 h-4" />,
          text: "SOP डॉक्युमेंट्स"
        },
        {
          icon: <Video className="w-4 h-4" />,
          text: "RBL व्हिडिओ फाइल्स"
        }
      ];
    }
    
    return [
      {
        icon: <FileText className="w-4 h-4" />,
        text: "SOP Documents"
      },
      {
        icon: <Video className="w-4 h-4" />,
        text: "RBL Video Files"
      }
    ];
  };

  // Handle initial message from search
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage) {
      const searchMessage = {
        id: Date.now(),
        text: initialMessage,
        sender: 'user'
      };

      const newChat = {
        id: Date.now(),
        title: initialMessage.length > 30 ? `${initialMessage.slice(0, 30)}...` : initialMessage
      };

      // Set initial state
      setCurrentChat(newChat);
      setMessages([searchMessage]);

      // Clear location state immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      // Process the search
      handleSearch(initialMessage);
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
    
    const queryLanguage = detectLanguage(query);
    const customSteps = getCustomLoadingSteps(query);
    debugLog('handleSearch:start', { 
      query, 
      normalized: normalize(query), 
      queryLanguage, 
      isHindi: isHindiTruckQuery(query),
      customSteps,
      stepsLength: customSteps.length
    });
    
    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 1, 100));
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          // Use the pre-calculated steps instead of calling getCustomLoadingSteps again
          debugLog('handleSearch:stepInterval', { prev, stepsLength: customSteps.length, steps: customSteps });
          if (prev >= customSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hardcoded queries and their responses
      const queries = {
        "I spoke with Mr John Doe and he was interested in getting 5L loan for a new Maruti Suzuki Car Swift Desire. He will put a down payment of 2L and he wants the loan for 5 years. Please push this to @SFDC": {
          text: "Great, I will push this to SFDC. Before that, I will need to know the interest at which you have agreed to the transaction. And, I will also need a few documents:\n\n1. Pan card of the owner\n2. Income proof",
          showFollowUp: false,
          showFeedback: true
        },
        "9% and I don't have the documents right now": {
          text: "No worries. I have created a lead in the funnel **Opportunity Feb 2025** with the following details:\n\n**SDFC ID** - 2345632\n**Status** - Open\n**Car Details** - Maruti Suzuki Swift Desire\n**Interest** - 9% p.a\n**Years** - 4\n**Down Payment** - ₹2,00,000\n**Owner** - John Doe\n**Agent ID** - 246\n\nPlease use this link to access the lead:\n@https://rbl.salesforce.com/lightning/r/Opportunity/0065G00000XYZ123/view",
          showFollowUp: false,
          showFeedback: true
        },
        "कार लोनसाठी प्रायव्हेट लिमिटेड कंपनीला कोणते कागदपत्रे लागतात?": {
          text: "नवीन कार लोनसाठी प्रायव्हेट लिमिटेड कंपनीसाठी दोन प्रकारचे कागदपत्रे लागतात.\n\n📌 सामान्य कागदपत्रे:\n\nअर्ज फॉर्म (Application Form)\nप्रोफॉर्मा इनव्हॉइस (Performa Invoice)\nपासपोर्ट साइज फोटो\nKYC प्रूफ\n\n📑 याशिवाय लागणारी अतिरिक्त कागदपत्रे:\n\nमागील दोन वर्षांचे ऑडिटेड बॅलन्स शीट\nशेवटच्या तीन महिन्यांचे बॅलन्स शीट\nMSME नोंदणी प्रमाणपत्र / आस्थापना प्रमाणपत्र\nशेअरहोल्डिंग पॅटर्न",
          showFollowUp: false,
          showFeedback: true
        },
        [HARD_CODED_HINDI_QUERY]: HINDI_TRUCK_RESPONSE
      };
      
      let searchResponse;
      
      // Check for exact match first
      const exactMatch = Object.keys(queries).find(key => query.trim() === key.trim());
      if (exactMatch) {
        const response = queries[exactMatch];
        searchResponse = {
          id: Date.now() + 1,
          text: response.text,
          sender: 'assistant',
          showFollowUp: response.showFollowUp,
          showFeedback: response.showFeedback,
          language: queryLanguage,
          tableColumns: response.tableColumns,
          tableData: response.tableData
        };
      } else {
        // Check for Hindi truck query with normalization
        const normalizedQuery = normalize(query);
        const normalizedHardCoded = normalize(HARD_CODED_HINDI_QUERY);
        const isHindiTruck = isHindiTruckQuery(query);
        
        if (normalizedQuery === normalizedHardCoded || isHindiTruck) {
          const response = HINDI_TRUCK_RESPONSE;
          searchResponse = {
            id: Date.now() + 1,
            text: response.text,
            sender: 'assistant',
            showFollowUp: response.showFollowUp,
            showFeedback: response.showFeedback,
            language: 'hi',
            tableColumns: response.tableColumns,
            tableData: response.tableData
          };
        } else {
          searchResponse = {
            id: Date.now() + 1,
            text: queryLanguage === 'mr' 
              ? "नवीन कार लोनसाठी प्रायव्हेट लिमिटेड कंपनीसाठी दोन प्रकारचे कागदपत्रे लागतात.\n\n📌 सामान्य कागदपत्रे:\n\nअर्ज फॉर्म (Application Form)\nप्रोफॉर्मा इनव्हॉइस (Performa Invoice)\nपासपोर्ट साइज फोटो\nKYC प्रूफ\n\n📑 याशिवाय लागणारी अतिरिक्त कागदपत्रे:\n\nमागील दोन वर्षांचे ऑडिटेड बॅलन्स शीट\nशेवटच्या तीन महिन्यांचे बॅलन्स शीट\nMSME नोंदणी प्रमाणपत्र / आस्थापना प्रमाणपत्र\nशेअरहोल्डिंग पॅटर्न"
              : `**There are two sets of documents that you'll need to take for a new car loan for a Pvt Ltd company.**\n\n**📌 General documents are:**\n1. Application Form\n2. Performa Invoice\n3. Passport size photo\n4. KYC proof\n\n**📑 Apart from these, you'll also need:**\n1. Audited balance sheet for last two years\n2. Last three months' balance sheet\n3. MSME registration certificate / Establishment certificate\n4. Shareholding pattern`,
          sender: 'assistant',
          showFollowUp: true,
          showFeedback: true,
          language: queryLanguage
        };
        }
      }
      
      setIsTyping(true);
      
      // Add response after a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(prev => {
        // Only add response if it's not already in the messages
        const isDuplicate = prev.some(msg => 
          msg.sender === 'assistant' && msg.text === searchResponse.text
        );
        return isDuplicate ? prev : [...prev, searchResponse];
      });
      
      setIsTyping(false);
      setShowVisualization(true);
      setCurrentStep(getCustomLoadingSteps(query).length - 1);
      setCompletedSteps(getCustomLoadingSteps(query).map((_, index) => index));
      
      // Clean up intervals
      clearInterval(progressInterval);
      clearInterval(stepInterval);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setChatHistorySearch("");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);
    setLoadingProgress(0);
    setShowVisualization(false);

    const customSteps = getCustomLoadingSteps(inputValue);
    debugLog('handleSendMessage:start', { 
      inputValue, 
      customSteps,
      stepsLength: customSteps.length
    });

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          // Use the pre-calculated steps instead of calling getCustomLoadingSteps again
          debugLog('handleSendMessage:stepInterval', { prev, stepsLength: customSteps.length, steps: customSteps });
          if (prev >= customSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          setCompletedSteps(current => [...current, prev]);
          return prev + 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use the same query matching logic as handleSearch
      const queries = {
        "I spoke with Mr John Doe and he was interested in getting 5L loan for a new Maruti Suzuki Car Swift Desire. He will put a down payment of 2L and he wants the loan for 5 years. Please push this to @SFDC": {
          text: "Great, I will push this to SFDC. Before that, I will need to know the interest at which you have agreed to the transaction. And, I will also need a few documents:\n\n1. Pan card of the owner\n2. Income proof",
          showFollowUp: false,
          showFeedback: true
        },
        "9% and I don't have the documents right now": {
          text: "No worries. I have created a lead in the funnel **Opportunity Feb 2025** with the following details:\n\n**SDFC ID** - 2345632\n**Status** - Open\n**Car Details** - Maruti Suzuki Swift Desire\n**Interest** - 9% p.a\n**Years** - 4\n**Down Payment** - ₹2,00,000\n**Owner** - John Doe\n**Agent ID** - 246\n\nPlease use this link to access the lead:\n@https://rbl.salesforce.com/lightning/r/Opportunity/0065G00000XYZ123/view",
          showFollowUp: false,
          showFeedback: true
        },
        "कार लोनसाठी प्रायव्हेट लिमिटेड कंपनीला कोणते कागदपत्रे लागतात?": {
          text: "नवीन कार लोनसाठी प्रायव्हेट लिमिटेड कंपनीसाठी दोन प्रकारचे कागदपत्रे लागतात.\n\n📌 सामान्य कागदपत्रे:\n\nअर्ज फॉर्म (Application Form)\nप्रोफॉर्मा इनव्हॉइस (Performa Invoice)\nपासपोर्ट साइज फोटो\nKYC प्रूफ\n\n📑 याशिवाय लागणारी अतिरिक्त कागदपत्रे:\n\nमागील दोन वर्षांचे ऑडिटेड बॅलन्स शीट\nशेवटच्या तीन महिन्यांचे बॅलन्स शीट\nMSME नोंदणी प्रमाणपत्र / आस्थापना प्रमाणपत्र\nशेअरहोल्डिंग पॅटर्न",
          showFollowUp: false,
          showFeedback: true
        },
        [HARD_CODED_HINDI_QUERY]: HINDI_TRUCK_RESPONSE
      };
      
      let response;
      
      // Check for exact match first
      const exactMatch = Object.keys(queries).find(key => inputValue.trim() === key.trim());
      if (exactMatch) {
        const matchedResponse = queries[exactMatch];
        response = {
          id: Date.now() + 1,
          text: matchedResponse.text,
          sender: 'assistant',
          showFollowUp: matchedResponse.showFollowUp,
          showFeedback: matchedResponse.showFeedback,
          tableColumns: matchedResponse.tableColumns,
          tableData: matchedResponse.tableData
        };
      } else {
        // Check for Hindi truck query with normalization
        const normalizedQuery = normalize(inputValue);
        const normalizedHardCoded = normalize(HARD_CODED_HINDI_QUERY);
        const isHindiTruck = isHindiTruckQuery(inputValue);
        
        if (normalizedQuery === normalizedHardCoded || isHindiTruck) {
          const matchedResponse = HINDI_TRUCK_RESPONSE;
          response = {
            id: Date.now() + 1,
            text: matchedResponse.text,
            sender: 'assistant',
            showFollowUp: matchedResponse.showFollowUp,
            showFeedback: matchedResponse.showFeedback,
            tableColumns: matchedResponse.tableColumns,
            tableData: matchedResponse.tableData
          };
        } else {
          const defaultResponse = detectLanguage(inputValue) === 'mr' 
            ? "नवीन कार लोनसाठी प्रायव्हेट लिमिटेड कंपनीसाठी दोन प्रकारचे कागदपत्रे लागतात.\n\n📌 सामान्य कागदपत्रे:\n\nअर्ज फॉर्म (Application Form)\nप्रोफॉर्मा इनव्हॉइस (Performa Invoice)\nपासपोर्ट साइज फोटो\nKYC प्रूफ\n\n📑 याशिवाय लागणारी अतिरिक्त कागदपत्रे:\n\nमागील दोन वर्षांचे ऑडिटेड बॅलन्स शीट\nशेवटच्या तीन महिन्यांचे बॅलन्स शीट\nMSME नोंदणी प्रमाणपत्र / आस्थापना प्रमाणपत्र\nशेअरहोल्डिंग पॅटर्न"
            : `**There are two sets of documents that you'll need to take for a new car loan for a Pvt Ltd company.**\n\n**📌 General documents are:**\n1. Application Form\n2. Performa Invoice\n3. Passport size photo\n4. KYC proof\n\n**📑 Apart from these, you'll also need:**\n1. Audited balance sheet for last two years\n2. Last three months' balance sheet\n3. MSME registration certificate / Establishment certificate\n4. Shareholding pattern`;

          response = {
            id: Date.now() + 1,
            text: defaultResponse,
            sender: 'assistant',
            showFollowUp: true,
            showFeedback: true
          };
        }
      }
      
      setIsTyping(true);
      setMessages(prev => [...prev, response]);
      
      if (currentChat) {
        mockChatMessages[currentChat.id] = [
          ...(mockChatMessages[currentChat.id] || []),
          newMessage,
          response
        ];
      }

      setTimeout(() => {
        setIsTyping(false);
        setShowVisualization(true);
        setCurrentStep(getCustomLoadingSteps(inputValue).length - 1);
        setCompletedSteps(getCustomLoadingSteps(inputValue).map((_, index) => index));
      }, 500);

      // Make sure to clear both intervals
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (query) => {
    const newMessage = {
      id: Date.now(),
      text: query,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);
    setLoadingProgress(0);
    setShowVisualization(false);

    const customSteps = getCustomLoadingSteps(query);
    debugLog('handleFollowUpClick:start', { 
      query, 
      customSteps,
      stepsLength: customSteps.length
    });

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          // Use the pre-calculated steps instead of calling getCustomLoadingSteps again
          debugLog('handleFollowUpClick:stepInterval', { prev, stepsLength: customSteps.length, steps: customSteps });
          if (prev >= customSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Simulate API delay
      setTimeout(async () => {
        const responseText = `Yes but one additional document is also required in the case of partnership firms: **Board resolution for Trust.**`;
        
        setIsTyping(true);
        
        const response = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'assistant',
          showFollowUp: true,
          hideFollowUpQuery: true
        };

        setMessages(prev => [...prev, response]);
        
        if (currentChat) {
          mockChatMessages[currentChat.id] = [
            ...(mockChatMessages[currentChat.id] || []),
            newMessage,
            response
          ];
        }

        setTimeout(() => {
          setIsTyping(false);
          setShowVisualization(true);
        }, 500);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setIsLoading(false);
      }, 5000);

    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    // Reset file input
    e.target.value = '';
  };

  const removeAttachment = (fileName) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex">
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
              <p className="text-lg text-gray-500 mb-8 text-center">Ask me anything or search through your knowledge base</p>
              <div className="w-full">
                <div className="relative flex flex-col gap-3">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <div className="w-full flex items-center gap-2 pl-12 pr-24 py-2 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#3551F3] focus-within:border-transparent transition-all">
                      {attachments.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[100px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(file.name)}
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
                            const newMessage = {
                              id: Date.now(),
                              text: chatHistorySearch.trim(),
                              sender: 'user',
                              attachments: attachments
                            };
                            const newChat = {
                              id: Date.now(),
                              title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                            };
                            setCurrentChat(newChat);
                            setMessages([newMessage]);
                            handleSearch(chatHistorySearch);
                            setAttachments([]);
                          }
                        }}
                        placeholder="Search for information, documents, people, and more..."
                        className="flex-1 text-base text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
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
                            const newMessage = {
                              id: Date.now(),
                              text: chatHistorySearch.trim(),
                              sender: 'user',
                              attachments: attachments
                            };
                            const newChat = {
                              id: Date.now(),
                              title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                            };
                            setCurrentChat(newChat);
                            setMessages([newMessage]);
                            handleSearch(chatHistorySearch);
                            setAttachments([]);
                          }
                        }}
                        className="p-2 rounded-lg transition-colors bg-[#3551F3] text-white hover:bg-[#2B41D9]"
                      >
                        <Send className="w-5 h-5" />
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
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-base font-semibold text-gray-900">
                                {msg.language === 'mr' ? 'प्रक्रिया सुरू आहे' : 'Request processed'}
                              </h3>
                              <span className="text-sm text-gray-500 font-medium">{Math.round(loadingProgress)}%</span>
                            </div>
                            <Progress value={loadingProgress} className="h-1.5" />
                          </div>
                          
                          <LoadingSteps steps={getCustomLoadingSteps(msg.language === 'mr' ? 'कार' : 'car')} currentStep={currentStep} />
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
                          <div>
                            <div className="whitespace-pre-wrap leading-relaxed">
                              <TypewriterText 
                                text={msg.text} 
                                delay={5} 
                                onComplete={() => {
                                  setTimeout(() => {
                                    const followUpElement = document.querySelector(`#followup-${msg.id}`);
                                    const feedbackElement = document.querySelector(`#feedback-${msg.id}`);
                                    if (msg.showFollowUp && followUpElement) {
                                      followUpElement.style.opacity = '1';
                                      followUpElement.style.transform = 'translateY(0)';
                                    }
                                    if (feedbackElement) {
                                      feedbackElement.style.opacity = '1';
                                    }
                                    // Show table after text is complete
                                    setTableVisibleByMessageId(prev => ({ ...prev, [msg.id]: true }));
                                  }, 500);
                                }}
                              />
                            </div>
                            
                            {/* Table rendering */}
                            {msg.tableData && Array.isArray(msg.tableData) && msg.tableData.length > 0 && tableVisibleByMessageId[msg.id] && (
                              <div className="mt-4">
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-[#3551F3]">
                                        <tr>
                                          {(Array.isArray(msg.tableColumns) ? msg.tableColumns : []).map((col) => (
                                            <th key={(col.key || col)} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{col.label || col}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {msg.tableData.map((row, idx) => (
                                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {(Array.isArray(msg.tableColumns) ? msg.tableColumns : []).map((col) => (
                                              <td key={(col.key || col)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[col.key || col]}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div 
                              id={`feedback-${msg.id}`} 
                              className="mt-4 flex items-center gap-2"
                              style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
                            >
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ThumbsUp className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <ThumbsDown className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Copy className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Share2 className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                            {msg.showFollowUp && !msg.hideFollowUpQuery && (
                              <div 
                                id={`followup-${msg.id}`} 
                                className="mt-4 flex flex-wrap gap-2"
                                style={{ 
                                  opacity: '0', 
                                  transform: 'translateY(10px)',
                                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                                }}
                              >
                                <button
                                  onClick={() => handleFollowUpClick("Are the documents same for partnership firms?")}
                                  className="bg-[#EEF2FF] text-[#3551F3] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#EFF6FF] transition-colors"
                                >
                                  Are the documents same for partnership firms?
                                </button>
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
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-semibold text-gray-900">
                            {detectLanguage(inputValue || chatHistorySearch) === 'mr' ? 'प्रक्रिया सुरू आहे' : 'Processing your request'}
                          </h3>
                          <span className="text-sm text-gray-500 font-medium">{Math.round(loadingProgress)}%</span>
                        </div>
                        <Progress value={loadingProgress} className="h-1.5" />
                      </div>
                      
                      <LoadingSteps steps={getCustomLoadingSteps(inputValue || chatHistorySearch)} currentStep={currentStep} />
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
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-24 py-4 text-base rounded-xl bg-white border-gray-200 focus:ring-[#3551F3]"
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
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
                      onClick={handleSendMessage}
                      className="p-2 rounded-lg transition-colors bg-[#3551F3] text-white hover:bg-[#2B41D9]"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}