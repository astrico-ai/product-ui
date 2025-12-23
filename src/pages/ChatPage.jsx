import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Plus, Link2, Send as SendIcon, FileText, Video, Search, Paperclip, ChevronDown, ChevronUp, ChevronRight, ThumbsUp, ThumbsDown, Copy, Share2, X } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownText } from "@/components/MarkdownText";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { LoadingSteps } from "@/components/LoadingSteps";
import { StreamingCursor } from "@/components/StreamingCursor";
import { useLocation } from "react-router-dom";
import { DataVisualization } from "@/components/DataVisualization";
import { PDFMentionDropdown } from "@/components/PDFMentionDropdown";
import { PDFReferenceBadgeList } from "@/components/PDFReferenceBadge";
import { usePDFMention } from "@/hooks/usePDFMention";
import { analyzePDFs, streamAnalyzePDFs } from "@/services/pdfService";
import { usePDFStore } from "@/stores/usePDFStore";
import { downloadCSV, parseJSONToTable, removeJSONFromText, convertJSONToCSV } from "@/utils/csvUtils";

// Mock chat history data
const chatHistory = [
  { id: 1, title: "EMD submission requirements - online or offline?" },
  { id: 2, title: "PBG percentage and duration details" },
  { id: 3, title: "MSME and MII preference requirements" },
  { id: 4, title: "Delivery location - Consignee or Fabricator?" },
  { id: 5, title: "Technical clarification time allowed" },
  { id: 6, title: "Arbitration and Mediation clause details" },
  { id: 7, title: "Bid to RA enabled status" },
  { id: 8, title: "Inspection requirements at TML plant" },
  { id: 9, title: "RCM applicability and registration requirements" },
  { id: 10, title: "Insurance and commissioning requirements" },
  { id: 11, title: "Trial run and AMC requirements" },
  { id: 12, title: "Highlight financial implication areas" }
];

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
  const [isTyping, setIsTyping] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isKomatsuQuery, setIsKomatsuQuery] = useState(false);
  const [currentQueryType, setCurrentQueryType] = useState(null); // 'komatsu' or 'riotinto'
  const [attachments, setAttachments] = useState([]);
  const [tableVisibleByMessageId, setTableVisibleByMessageId] = useState({});
  const [expandedSourcesByMessageId, setExpandedSourcesByMessageId] = useState({});
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastUserMessageIdRef = useRef(null);
  const processingQueryRef = useRef(null);

  // Agent 4: PDF @ mention system
  // Agent 5: Now using Zustand store for state management (useStore: true by default)
  const pdfMention = usePDFMention({ useStore: true });
  
  // Direct store subscription to ensure PDF pills persist after responses
  const storeSelectedPdfs = usePDFStore(state => state.selectedPdfs);
  const storeDeselectPDF = usePDFStore(state => state.deselectPDF);

  // Helper function to scroll user message to top (ChatGPT-style)
  const scrollUserMessageToTop = (messageId) => {
    // Use multiple attempts to ensure DOM is ready
    const attemptScroll = (attempt = 0) => {
      if (attempt > 10) {
        console.warn('📜 [SCROLL] Max attempts reached, giving up');
        return; // Max 10 attempts
      }
      
      const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      
      if (!messageElement) {
        // Retry if element not found yet
        setTimeout(() => attemptScroll(attempt + 1), 50);
        return;
      }
      
      if (!scrollAreaRef.current) {
        setTimeout(() => attemptScroll(attempt + 1), 50);
        return;
      }
      
      // Find the viewport element inside ScrollArea (Radix UI structure)
      // Radix UI adds data-radix-scroll-area-viewport attribute
      let viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      
      if (!viewport) {
        // Try finding by traversing children
        const root = scrollAreaRef.current;
        const findScrollable = (el) => {
          if (!el) return null;
          if (el.scrollHeight > el.clientHeight && el.scrollTop !== undefined) {
            return el;
          }
          for (let child of el.children) {
            const found = findScrollable(child);
            if (found) return found;
          }
          return null;
        };
        viewport = findScrollable(root);
      }
      
      console.log('📜 [SCROLL] Attempt', attempt, {
        messageId,
        messageElement: !!messageElement,
        scrollAreaRef: !!scrollAreaRef.current,
        viewport: !!viewport,
        viewportScrollTop: viewport?.scrollTop
      });
      
      if (viewport && messageElement) {
        // Get the scrollable container (the div with space-y-4)
        const scrollableContainer = messageElement.closest('.space-y-4');
        
        if (scrollableContainer) {
          // Get bounding rects
          const containerRect = scrollableContainer.getBoundingClientRect();
          const messageRect = messageElement.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();
          
          // Calculate the current scroll position
          const currentScrollTop = viewport.scrollTop;
          
          // Calculate message position relative to container
          // messageRect.top is relative to viewport, so we need to add current scroll
          const messageTopInContainer = messageRect.top - containerRect.top + currentScrollTop;
          
          // Scroll to position message at top of viewport
          const targetScrollTop = messageTopInContainer;
          
          viewport.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          
          console.log('📜 [SCROLL] Scrolled successfully', {
            messageId,
            currentScrollTop,
            messageTopInContainer,
            targetScrollTop,
            messageRect: { top: messageRect.top, bottom: messageRect.bottom },
            containerRect: { top: containerRect.top, bottom: containerRect.bottom }
          });
        } else {
          console.warn('📜 [SCROLL] Scrollable container not found');
          // Fallback: use scrollIntoView
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      } else {
        // Retry if viewport not found
        if (attempt < 5) {
          setTimeout(() => attemptScroll(attempt + 1), 100);
        } else {
          // Final fallback: use scrollIntoView
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          console.log('📜 [SCROLL] Using scrollIntoView fallback');
        }
      }
    };
    
    // Start attempting to scroll
    requestAnimationFrame(() => {
      setTimeout(() => attemptScroll(), 150);
    });
  };

  // Auto-scroll user message to top when a new user message is added (ChatGPT-style)
  useEffect(() => {
    // Find the last user message
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop();
    
    // Only scroll if this is a new user message (different ID than last time)
    if (lastUserMessage && lastUserMessage.id !== lastUserMessageIdRef.current) {
      lastUserMessageIdRef.current = lastUserMessage.id;
      scrollUserMessageToTop(lastUserMessage.id);
    }
  }, [messages]); // Watch all messages, but only act on new user messages

  // Loading steps for Komatsu query
  const komatsuLoadingSteps = [
    { title: "Understanding your query..." },
    { title: "Scanning mining equipment data..." },
    { title: "Analyzing Komatsu PC 5500 specifications..." },
    { title: "Gathering performance metrics..." },
    { title: "Compiling advantages and benefits..." },
    { title: "Preparing detailed response..." }
  ];

  // Loading steps for Rio Tinto query
  const rioTintoLoadingSteps = [
    { title: "Understanding your query..." },
    { title: "Searching rare earths market data..." },
    { title: "Analyzing Rio Tinto's strategic investments..." },
    { title: "Reviewing lithium and critical minerals focus..." },
    { title: "Gathering external sources..." },
    { title: "Preparing comprehensive response..." }
  ];

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

  // Debug utilities (only for streaming)
  const DEBUG_STREAMING = false;
  const debugStreamLog = (...args) => { if (DEBUG_STREAMING && typeof window !== 'undefined') { console.log('[Streaming]', ...args); } };

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
    return hasTataSigna && hasTruck;
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
    setShowVisualization(false);
    let skipFinally = false;  // Flag to skip finally block for Komatsu query

    try {
      // Check for hardcoded Komatsu 5500 query
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('advantages of komatsu') && lowerQuery.includes('5500')) {
        // Set skipFinally FIRST, before any returns
        skipFinally = true;

        // Prevent duplicate processing
        if (processingQueryRef.current === query.trim()) {
          console.log('⚠️ [DUPLICATE] Already processing this query, skipping');
          return;
        }
        processingQueryRef.current = query.trim();

        console.log('🎯 [HARDCODED] Detected Komatsu 5500 advantages query from search');
        console.log('📊 [DEBUG] Current messages:', messages);
        console.log('📊 [DEBUG] isLoading:', isLoading);

        // Set Komatsu query flag
        setIsKomatsuQuery(true);
        setCurrentQueryType('komatsu');

        // Only add user message if messages array is empty (not already added by useEffect)
        setMessages(prev => {
          if (prev.length === 0 || prev[prev.length - 1].text !== query.trim()) {
            return [...prev, {
              id: Date.now(),
              text: query.trim(),
              sender: 'user'
            }];
          }
          return prev;
        });
        setCurrentStep(0);

        // Progress through loading steps
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= komatsuLoadingSteps.length - 1) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 1700); // ~1.7 seconds per step for 6 steps = ~10 seconds total

        // Wait ~10 seconds before showing response
        setTimeout(() => {
          clearInterval(stepInterval);
          console.log('⏰ [TIMEOUT] 10 seconds elapsed, showing response');

          // Create response message with hardcoded content
          const komatsuResponseText = `**Advantages of Komatsu PC 5500**

• **High Productivity:** Large bucket capacity (23 m³/50 tons), fast 23-second cycle time, and monthly throughput exceeding 870,000 tons.
• **Exceptional Durability:** Pin life surpasses 50,000 hours (vs. 10,000-hour standard), with minimal wear on slewing gear and no need for pin/bush replacements or line boring.
• **Efficient Maintenance:** Bucket change time reduced to 3-4 hours (from 1.5 days), no grease system failures, and much lower grease consumption.
• **Cost-Effectiveness:** Operating cost is less than $0.1 per ton, with low waste and no cleaning required due to efficient lubrication.
• **Reliability:** No grease system failures reported, and machine availability improved from 85% to 97%.
Overall, the Komatsu PC 5500 delivers outstanding productivity, longevity, reduced downtime, and low operating costs, making it a highly efficient and cost-effective mining solution.

## 🔗 External References

**Executive Summary: Advantages of the Komatsu PC5500**

• **Massive Payload Capacity:** Equipped with a 28 m³ reinforced rock bucket, allowing for exceptional material handling and high haul-cycle efficiency.
• **Structural Strength & Efficiency:** Reinforced bucket design maintains durability during heavy-duty cycles while reducing swing times and speeding up overall production.
• **Advanced Hydraulic System:** Delivers precise and robust digging power with improved fuel economy compared to older models.
• **Intelligent Machine Control:** Integrated Komatsu Intelligent Machine Control and telematics provide real-time data, automate cycle optimization, and enable remote monitoring for productivity gains and minimized downtime.
• **Operator Comfort & Safety:** Features a spacious, ergonomically designed cab with climate control and low-noise operation to promote safer, more comfortable, and prolonged shifts.
• **Reliable & Durable Build:** The robust chassis, reinforced undercarriage, and proven durable components ensure longevity and dependable service in the toughest environments.
• **Maintenance & Cost Benefits:** Modular design makes maintenance and part replacements simpler and faster, resulting in lower total ownership costs.`;

          // Table data for Komatsu PC 5500
          const komatsuTableColumns = [
            { key: 'parameter', label: 'Parameter' },
            { key: 'value', label: 'Value' }
          ];

          const komatsuTableData = [
            { parameter: 'Bucket capacity', value: '23 m³ (50 tons)' },
            { parameter: 'Cycle time', value: '23 seconds' },
            { parameter: 'Monthly throughput', value: '>870,000 tons' },
            { parameter: 'Pin life', value: '>50,000 hours' },
            { parameter: 'Mining standard pin life', value: '10,000 hours' },
            { parameter: 'Bucket change time', value: '3-4 hours' },
            { parameter: 'Standard bucket change time', value: '1.5 days' },
            { parameter: 'Grease consumption', value: '1 drum of Molub-Alloy 777/2 NG every 5 weeks' },
            { parameter: 'Initial grease consumption', value: 'Significantly higher' },
            { parameter: 'Machine availability', value: 'Improved from 85% to 97%' },
            { parameter: 'Operating cost', value: '< $0.1 per ton' }
          ];

          const responseId = Date.now() + 1;
          const komatsuResponse = {
            id: responseId,
            text: '',
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: true,
            isStreaming: true,
            tableColumns: komatsuTableColumns,
            tableData: komatsuTableData,
            tableTitle: 'Komatsu PC 5500 Key Performance and Maintenance Metrics',
            internalReferences: [
              {
                type: 'pdf',
                title: 'Mining Presentation_2025-12-19_09-53-16.pdf',
                url: 'https://product-ui-pdfs.s3.ap-south-1.amazonaws.com/pdfs/2025-12-19/e3f48bf4-b296-4ff7-a8bb-8812f98bd41e/Mining%20Presentation_2025-12-19_09-53-16.pdf'
              }
            ],
            externalReferences: [
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/markets/commodity/palladium/page/5142'
              },
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/web/allied-nevada-achieves-net-income-of-6-1-million-or-0-07-per-share-in-q2-2012/'
              },
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/mining-simulators-virtual-training-2/'
              }
            ]
          };

          // Add response message and end loading
          setMessages(prev => [...prev, komatsuResponse]);
          setIsLoading(false);
          setIsTyping(true);

          // Simulate typewriter effect
          let currentText = '';
          let charIndex = 0;
          const typewriterSpeed = 10; // milliseconds per character

          const typeNextChar = () => {
            if (charIndex < komatsuResponseText.length) {
              currentText += komatsuResponseText[charIndex];
              charIndex++;

              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, text: currentText }
                  : msg
              ));

              setTimeout(typeNextChar, typewriterSpeed);
            } else {
              // Typing complete
              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, isStreaming: false, showFollowUp: true }
                  : msg
              ));
              setIsTyping(false);
              setIsKomatsuQuery(false); // Reset after typewriter completes
              setCurrentQueryType(null);

              // Show table after typing completes
              setTimeout(() => {
                setTableVisibleByMessageId(prev => ({ ...prev, [responseId]: true }));
            }, 100);

            // Clear selected PDFs after response
            storeDeselectPDF && storeSelectedPdfs.forEach(pdf => storeDeselectPDF(pdf.s3Key || pdf.id));

            // Clear processing ref to allow same query again
            processingQueryRef.current = null;
          }
        };

          setTimeout(typeNextChar, 100); // Start typing after small delay
        }, 10200); // Wait ~10 seconds before starting typewriter

        console.log('✅ [KOMATSU] Returning early, skipFinally already set');
        return; // Exit early, don't continue with normal flow
      }

      // Check for hardcoded Rio Tinto rare earths query
      const lowerQueryRio = query.toLowerCase();
      if (lowerQueryRio.includes('rio tinto') && lowerQueryRio.includes('rare earth')) {
        // Set skipFinally FIRST, before any returns
        skipFinally = true;

        // Prevent duplicate processing
        if (processingQueryRef.current === query.trim()) {
          console.log('⚠️ [DUPLICATE] Already processing Rio Tinto query, skipping');
          return;
        }
        processingQueryRef.current = query.trim();

        console.log('🎯 [HARDCODED] Detected Rio Tinto rare earths query from search');

        // Set Rio Tinto query flag
        setIsKomatsuQuery(true); // Reusing the same flag for loading steps
        setCurrentQueryType('riotinto');

        // Only add user message if messages array is empty (not already added by useEffect)
        setMessages(prev => {
          if (prev.length === 0 || prev[prev.length - 1].text !== query.trim()) {
            return [...prev, {
              id: Date.now(),
              text: query.trim(),
              sender: 'user'
            }];
          }
          return prev;
        });
        setCurrentStep(0);

        // Progress through loading steps
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= rioTintoLoadingSteps.length - 1) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 1700); // ~1.7 seconds per step for 6 steps = ~10 seconds total

        // Wait ~10 seconds before showing response
        setTimeout(() => {
          clearInterval(stepInterval);
          console.log('⏰ [TIMEOUT] 10 seconds elapsed, showing Rio Tinto response');

          // Create response message with hardcoded content
          const rioTintoResponseText = `**Rio Tinto and the Rare Earths Market**
No relevant information was found regarding Rio Tinto entering the rare earths market.
No official announcements or data available on Rio Tinto's involvement in rare earths.
Further monitoring of industry news and company releases is recommended for updates.

## 🔗 External References

**Rio Tinto's Strategic Position in Critical Minerals**

• **Primary Focus:** Rio Tinto is not pursuing the rare earths market as a main strategy.
• **Lithium Investment:** The company acquired Arcadium for $6.7 billion, securing access to South America's Lithium Triangle and brine-based lithium resources.
• **Gallium Extraction:** Efforts are underway to develop gallium production at their Quebec operations, with a pilot plant targeting 3.5 tonnes per year and future potential expansion to 40 tonnes annually at full scale.

**Emphasis on Lithium over Rare Earths**

• **Market Focus:** While gallium (used in EVs and semiconductors) and lithium (for batteries) are both critical minerals, Rio Tinto's current strategy centers on lithium as its main entry into energy transition metals.
• **Rare Earths Clarification:** There are no indications that Rio Tinto is centering operations or investments on traditional rare earth elements such as neodymium or dysprosium.`;

          const responseId = Date.now() + 1;
          const rioTintoResponse = {
            id: responseId,
            text: '',
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: true,
            isStreaming: true,
            externalReferences: [
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/rio-tinto-bets-big-on-lithium-triangles-brine-riches/'
              },
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/rio-tinto-extracts-first-gallium-at-quebec-operations/'
              },
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/web/argentina-approves-2-5b-rio-tinto-lithium-mining-project/'
              }
            ]
          };

          // Add response message and end loading
          setMessages(prev => [...prev, rioTintoResponse]);
          setIsLoading(false);
          setIsTyping(true);

          // Simulate typewriter effect
          let currentText = '';
          let charIndex = 0;
          const typewriterSpeed = 10; // milliseconds per character

          const typeNextChar = () => {
            if (charIndex < rioTintoResponseText.length) {
              currentText += rioTintoResponseText[charIndex];
              charIndex++;

              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, text: currentText }
                  : msg
              ));

              setTimeout(typeNextChar, typewriterSpeed);
            } else {
              // Typing complete
              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, isStreaming: false, showFollowUp: true }
                  : msg
              ));
              setIsTyping(false);
              setIsKomatsuQuery(false); // Reset after typewriter completes
              setCurrentQueryType(null);

              // Show table after typing completes
              setTimeout(() => {
                setTableVisibleByMessageId(prev => ({ ...prev, [responseId]: true }));
            }, 100);

            // Clear selected PDFs after response
            storeDeselectPDF && storeSelectedPdfs.forEach(pdf => storeDeselectPDF(pdf.s3Key || pdf.id));

            // Clear processing ref to allow same query again
            processingQueryRef.current = null;
          }
        };

          setTimeout(typeNextChar, 100); // Start typing after small delay
        }, 10200); // Wait ~10 seconds before starting typewriter

        console.log('✅ [RIO TINTO] Returning early, skipFinally already set');
        return; // Exit early, don't continue with normal flow
      }

      // Agent 4: Check if PDFs are referenced and call streaming analyze API - use store directly
      let searchResponse;
      const hasSelectedPdfs = storeSelectedPdfs && storeSelectedPdfs.length > 0;
      if (hasSelectedPdfs) {
        console.log('✅ [SEARCH STREAMING] Using streaming endpoint for search');
        try {
          // Get PDF IDs from store directly
          const pdfIds = storeSelectedPdfs.map(pdf => pdf.s3Key || pdf.id);
          
          // Create streaming response message
          const responseId = Date.now() + 1;
          let streamedText = '';
          
          searchResponse = {
            id: responseId,
            text: '',
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: true,
            pdfReferences: storeSelectedPdfs,
            isStreaming: true,
            isLoading: true // Show loading indicator until first chunk
          };
          
          // Add response to messages immediately for streaming
          setMessages(prev => [...prev, searchResponse]);
          setIsTyping(true);
          
          // Stream the analysis
          let isMainStream = false;
          
          await streamAnalyzePDFs(
            pdfIds,
            query,
            query,
            // onChunk - called for each chunk from main stream
            (chunk) => {
              if (!isMainStream) {
                // First chunk from main stream - hide loading indicator and start main text
                isMainStream = true;
                streamedText = chunk;
                
                console.log('🎨 [STREAMING] First chunk received in ChatPage (handleSearch), updating UI', {
                  timestamp: new Date().toISOString(),
                  chunkPreview: chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''),
                  chunkLength: chunk.length
                });
                
                setMessages(prev => prev.map(msg => 
                  msg.id === responseId 
                    ? { ...msg, text: streamedText, isLoading: false }
                    : msg
                ));
              } else {
                streamedText += chunk;
                setMessages(prev => prev.map(msg => 
                  msg.id === responseId 
                    ? { ...msg, text: streamedText }
                    : msg
                ));
              }
            },
            // onComplete
            (analysisResult) => {
              
              // Parse JSON table data to table format if available
              let tableColumns = null;
              let tableData = null;
              let cleanedText = analysisResult.analysis || streamedText;
              let csvDataForDownload = null;
              
              if (analysisResult.jsonTableData) {
                console.log('✅ [JSON] JSON table data available, parsing to table format');
                const parsedTable = parseJSONToTable(analysisResult.jsonTableData);
                if (parsedTable) {
                  tableColumns = parsedTable.tableColumns;
                  tableData = parsedTable.tableData;
                  console.log('✅ [JSON] JSON parsed to table:', { 
                    columns: tableColumns.length, 
                    rows: tableData.length 
                  });
                  
                  // Convert JSON to CSV for download
                  csvDataForDownload = convertJSONToCSV(analysisResult.jsonTableData);
                  
                  // Remove JSON markdown code block from displayed text
                  cleanedText = removeJSONFromText(cleanedText);
                  console.log('✅ [JSON] Removed JSON code block from response text');
                }
              } else if (analysisResult.csvData) {
                // Fallback: if CSV data exists (legacy support), use it
                console.log('✅ [CSV] CSV data available (legacy), parsing to table format');
                const parsedTable = parseCSVToTable(analysisResult.csvData);
                if (parsedTable) {
                  tableColumns = parsedTable.tableColumns;
                  tableData = parsedTable.tableData;
                  csvDataForDownload = analysisResult.csvData;
                  cleanedText = removeJSONFromText(cleanedText);
                }
              }
              
              setMessages(prev => prev.map(msg => 
                msg.id === responseId 
                  ? { 
                      ...msg, 
                      text: cleanedText,
                      pdfReferences: analysisResult.referencedPdfs || storeSelectedPdfs,
                      tokensUsed: analysisResult.tokensUsed,
                      isStreaming: false,
                      csvData: csvDataForDownload || analysisResult.csvData || null,
                      tableColumns: tableColumns || msg.tableColumns,
                      tableData: tableData || msg.tableData
                    }
                  : msg
              ));
              setIsTyping(false);
              setTimeout(() => {
                setTableVisibleByMessageId(prev => ({ ...prev, [responseId]: true }));
                const followUpElement = document.querySelector(`#followup-${responseId}`);
                const feedbackElement = document.querySelector(`#feedback-${responseId}`);
                if (followUpElement) {
                  followUpElement.style.opacity = '1';
                  followUpElement.style.transform = 'translateY(0)';
                }
                if (feedbackElement) {
                  feedbackElement.style.opacity = '1';
                }
              }, 100);
            },
            // onError
            (error) => {
              console.error('❌ [SEARCH STREAMING] Streaming failed:', error);
              const errorMessage = error?.message || error?.toString() || 'An unknown error occurred';
              setMessages(prev => prev.map(msg => 
                msg.id === responseId 
                  ? { 
                      ...msg, 
                      text: `Error analyzing PDFs: ${errorMessage}. Please try again.`,
                      showFollowUp: false,
                      showFeedback: false,
                      isStreaming: false,
                      isLoading: false
                    }
                  : msg
              ));
              setIsTyping(false);
            }
          );
          
          // Return early since streaming handles the response
          setIsLoading(false);
          setChatHistorySearch("");
          return;
          
        } catch (error) {
          console.error('❌ [SEARCH STREAMING] Error starting stream:', error);
          const errorMessage = error?.message || error?.toString() || 'An unknown error occurred';
          searchResponse = {
            id: Date.now() + 1,
            text: `Error analyzing PDFs: ${errorMessage}. Please try again.`,
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: false
          };
        }
      } else {
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

    } catch (error) {
      // Error handled in UI
    } finally {
      console.log('🏁 [FINALLY] Block executing, skipFinally =', skipFinally);
      if (!skipFinally) {
        console.log('🔄 [FINALLY] Resetting isLoading to false');
        setIsLoading(false);
        setChatHistorySearch("");
      } else {
        console.log('⏭️ [FINALLY] Skipping isLoading reset');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && (!storeSelectedPdfs || storeSelectedPdfs.length === 0)) return;

    // Agent 4: Include PDF references in message - use store directly
    const hasSelectedPdfs = storeSelectedPdfs && storeSelectedPdfs.length > 0;
    const newMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      pdfReferences: hasSelectedPdfs ? [...storeSelectedPdfs] : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    const messageText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setShowVisualization(false);
    let skipFinally = false;  // Flag to skip finally block for hardcoded queries

    // Scroll user message to top after it's added to DOM
    scrollUserMessageToTop(newMessage.id);

    try {
      // Check for hardcoded Komatsu 5500 query
      const lowerQuery = messageText.toLowerCase();
      if (lowerQuery.includes('advantages of komatsu') && lowerQuery.includes('5500')) {
        console.log('🎯 [HARDCODED] Detected Komatsu 5500 advantages query');

        // Set skipFinally FIRST, before any returns
        skipFinally = true;

        // Set Komatsu query flag and reset current step for loading
        setIsKomatsuQuery(true);
        setCurrentQueryType('komatsu');
        setCurrentStep(0);

        // Progress through loading steps
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= komatsuLoadingSteps.length - 1) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 1700); // ~1.7 seconds per step for 6 steps = ~10 seconds total

        // Wait ~10 seconds before showing response
        setTimeout(() => {
          clearInterval(stepInterval);
          console.log('⏰ [TIMEOUT - MESSAGE SUBMIT] 10 seconds elapsed, showing response');

          // Create response message with hardcoded content
          const komatsuResponseText = `**Advantages of Komatsu PC 5500**

• **High Productivity:** Large bucket capacity (23 m³/50 tons), fast 23-second cycle time, and monthly throughput exceeding 870,000 tons.
• **Exceptional Durability:** Pin life surpasses 50,000 hours (vs. 10,000-hour standard), with minimal wear on slewing gear and no need for pin/bush replacements or line boring.
• **Efficient Maintenance:** Bucket change time reduced to 3-4 hours (from 1.5 days), no grease system failures, and much lower grease consumption.
• **Cost-Effectiveness:** Operating cost is less than $0.1 per ton, with low waste and no cleaning required due to efficient lubrication.
• **Reliability:** No grease system failures reported, and machine availability improved from 85% to 97%.

Overall, the Komatsu PC 5500 delivers outstanding productivity, longevity, reduced downtime, and low operating costs, making it a highly efficient and cost-effective mining solution.

## 🔗 External References

**Executive Summary: Advantages of the Komatsu PC5500**

• **Massive Payload Capacity:** Equipped with a 28 m³ reinforced rock bucket, allowing for exceptional material handling and high haul-cycle efficiency.
• **Structural Strength & Efficiency:** Reinforced bucket design maintains durability during heavy-duty cycles while reducing swing times and speeding up overall production.
• **Advanced Hydraulic System:** Delivers precise and robust digging power with improved fuel economy compared to older models.
• **Intelligent Machine Control:** Integrated Komatsu Intelligent Machine Control and telematics provide real-time data, automate cycle optimization, and enable remote monitoring for productivity gains and minimized downtime.
• **Operator Comfort & Safety:** Features a spacious, ergonomically designed cab with climate control and low-noise operation to promote safer, more comfortable, and prolonged shifts.
• **Reliable & Durable Build:** The robust chassis, reinforced undercarriage, and proven durable components ensure longevity and dependable service in the toughest environments.
• **Maintenance & Cost Benefits:** Modular design makes maintenance and part replacements simpler and faster, resulting in lower total ownership costs.`;

        // Table data for Komatsu PC 5500
        const komatsuTableColumns = [
          { key: 'parameter', label: 'Parameter' },
          { key: 'value', label: 'Value' }
        ];

        const komatsuTableData = [
          { parameter: 'Bucket capacity', value: '23 m³ (50 tons)' },
          { parameter: 'Cycle time', value: '23 seconds' },
          { parameter: 'Monthly throughput', value: '>870,000 tons' },
          { parameter: 'Pin life', value: '>50,000 hours' },
          { parameter: 'Mining standard pin life', value: '10,000 hours' },
          { parameter: 'Bucket change time', value: '3-4 hours' },
          { parameter: 'Standard bucket change time', value: '1.5 days' },
          { parameter: 'Grease consumption', value: '1 drum of Molub-Alloy 777/2 NG every 5 weeks' },
          { parameter: 'Initial grease consumption', value: 'Significantly higher' },
          { parameter: 'Machine availability', value: 'Improved from 85% to 97%' },
          { parameter: 'Operating cost', value: '< $0.1 per ton' }
        ];

        const responseId = Date.now() + 1;
        const komatsuResponse = {
          id: responseId,
          text: '',
          sender: 'assistant',
          showFollowUp: false,
          showFeedback: true,
          tableColumns: komatsuTableColumns,
          tableData: komatsuTableData,
          tableTitle: 'Komatsu PC 5500 Key Performance and Maintenance Metrics',
          isStreaming: true,
          internalReferences: [
            {
              type: 'pdf',
              title: 'Mining Presentation_2025-12-19_09-53-16.pdf',
              url: 'https://s3.ap-south-1.amazonaws.com/product-ui-pdfs/pdfs/2025-12-19/e3f48bf4-b296-4ff7-a8bb-8812f98bd41e/Mining%20Presentation_2025-12-19_09-53-16.pdf'
            }
          ],
          externalReferences: [
            {
              type: 'link',
              title: 'www.mining.com',
              url: 'https://www.mining.com/markets/commodity/palladium/page/5142'
            },
            {
              type: 'link',
              title: 'www.mining.com',
              url: 'https://www.mining.com/web/allied-nevada-achieves-net-income-of-6-1-million-or-0-07-per-share-in-q2-2012/'
            },
            {
              type: 'link',
              title: 'www.mining.com',
              url: 'https://www.mining.com/mining-simulators-virtual-training-2/'
            }
          ]
        };

          // Add empty response first
          setMessages(prev => [...prev, komatsuResponse]);
          setIsLoading(false);
          setIsTyping(true);

          // Simulate typewriter effect
          let currentText = '';
          let charIndex = 0;
          const typewriterSpeed = 10; // milliseconds per character

          const typeNextChar = () => {
            if (charIndex < komatsuResponseText.length) {
              currentText += komatsuResponseText[charIndex];
              charIndex++;

              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, text: currentText }
                  : msg
              ));

              setTimeout(typeNextChar, typewriterSpeed);
            } else {
              // Typing complete
              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, isStreaming: false, showFollowUp: true }
                  : msg
              ));
              setIsTyping(false);
              setIsKomatsuQuery(false); // Reset after typewriter completes
              setCurrentQueryType(null);

              // Show table after typing completes
              setTimeout(() => {
                setTableVisibleByMessageId(prev => ({ ...prev, [responseId]: true }));
              }, 100);

              // Clear selected PDFs after response
              storeDeselectPDF && storeSelectedPdfs.forEach(pdf => storeDeselectPDF(pdf.s3Key || pdf.id));

              // Clear processing ref to allow same query again
              processingQueryRef.current = null;
            }
          };

          setTimeout(typeNextChar, 100); // Start typing after small delay
        }, 10200); // Wait ~10 seconds before starting typewriter

        return; // Exit early, don't continue with normal flow
      }

      // Check for hardcoded Rio Tinto rare earths query
      const lowerQueryRio = messageText.toLowerCase();
      if (lowerQueryRio.includes('rio tinto') && lowerQueryRio.includes('rare earth')) {
        console.log('🎯 [HARDCODED] Detected Rio Tinto rare earths query');

        // Set skipFinally FIRST, before any returns
        skipFinally = true;

        // Set Rio Tinto query flag
        setIsKomatsuQuery(true); // Reusing the same flag for loading steps
        setCurrentQueryType('riotinto');
        setCurrentStep(0);

        // Progress through loading steps
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= rioTintoLoadingSteps.length - 1) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 1700); // ~1.7 seconds per step for 6 steps = ~10 seconds total

        // Wait ~10 seconds before showing response
        setTimeout(() => {
          clearInterval(stepInterval);
          console.log('⏰ [TIMEOUT] 10 seconds elapsed, showing Rio Tinto response');

          // Create response message with hardcoded content
          const rioTintoResponseText = `**Rio Tinto and the Rare Earths Market**
No relevant information was found regarding Rio Tinto entering the rare earths market.
No official announcements or data available on Rio Tinto's involvement in rare earths.
Further monitoring of industry news and company releases is recommended for updates.

## 🔗 External References

**Rio Tinto's Strategic Position in Critical Minerals**

• **Primary Focus:** Rio Tinto is not pursuing the rare earths market as a main strategy.
• **Lithium Investment:** The company acquired Arcadium for $6.7 billion, securing access to South America's Lithium Triangle and brine-based lithium resources.
• **Gallium Extraction:** Efforts are underway to develop gallium production at their Quebec operations, with a pilot plant targeting 3.5 tonnes per year and future potential expansion to 40 tonnes annually at full scale.

**Emphasis on Lithium over Rare Earths**

• **Market Focus:** While gallium (used in EVs and semiconductors) and lithium (for batteries) are both critical minerals, Rio Tinto's current strategy centers on lithium as its main entry into energy transition metals.
• **Rare Earths Clarification:** There are no indications that Rio Tinto is centering operations or investments on traditional rare earth elements such as neodymium or dysprosium.`;

          const responseId = Date.now() + 1;
          const rioTintoResponse = {
            id: responseId,
            text: '',
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: true,
            isStreaming: true,
            externalReferences: [
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/rio-tinto-bets-big-on-lithium-triangles-brine-riches/'
              },
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/rio-tinto-extracts-first-gallium-at-quebec-operations/'
              },
              {
                type: 'link',
                title: 'www.mining.com',
                url: 'https://www.mining.com/web/argentina-approves-2-5b-rio-tinto-lithium-mining-project/'
              }
            ]
          };

          // Add response message and end loading
          setMessages(prev => [...prev, rioTintoResponse]);
          setIsLoading(false);
          setIsTyping(true);

          // Simulate typewriter effect
          let currentText = '';
          let charIndex = 0;
          const typewriterSpeed = 10; // milliseconds per character

          const typeNextChar = () => {
            if (charIndex < rioTintoResponseText.length) {
              currentText += rioTintoResponseText[charIndex];
              charIndex++;

              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, text: currentText }
                  : msg
              ));

              setTimeout(typeNextChar, typewriterSpeed);
            } else {
              // Typing complete
              setMessages(prev => prev.map(msg =>
                msg.id === responseId
                  ? { ...msg, isStreaming: false, showFollowUp: true }
                  : msg
              ));
              setIsTyping(false);
              setIsKomatsuQuery(false); // Reset after typewriter completes
              setCurrentQueryType(null);

              // Clear selected PDFs after response
              storeDeselectPDF && storeSelectedPdfs.forEach(pdf => storeDeselectPDF(pdf.s3Key || pdf.id));

              // Clear processing ref to allow same query again
              processingQueryRef.current = null;
            }
          };

          setTimeout(typeNextChar, 100); // Start typing after small delay
        }, 10200); // Wait ~10 seconds before starting typewriter

        console.log('✅ [RIO TINTO] Returning early, skipFinally already set');
        return; // Exit early, don't continue with normal flow
      }

      // Agent 4: Check if PDFs are referenced and call streaming analyze API - use store directly
      let response;
      
      // Explicit check with detailed logging
      const pdfsSelected = storeSelectedPdfs && Array.isArray(storeSelectedPdfs) && storeSelectedPdfs.length > 0;
      console.log('🔍 [STREAMING CHECK]', { 
        hasSelectedPdfs,
        pdfsSelected,
        storeSelectedPdfsLength: storeSelectedPdfs?.length || 0,
        storeSelectedPdfsType: typeof storeSelectedPdfs,
        storeSelectedPdfsIsArray: Array.isArray(storeSelectedPdfs),
        storeSelectedPdfs: storeSelectedPdfs 
      });
      
      if (pdfsSelected) {
        console.log('✅ [STREAMING] PDFs detected! Using streaming endpoint /api/pdfs/analyze/stream');
        console.log('✅ [STREAMING] Selected PDFs:', storeSelectedPdfs);
        try {
          // Get PDF IDs from store directly
          const pdfIds = storeSelectedPdfs.map(pdf => pdf.s3Key || pdf.id);
          console.log('✅ [STREAMING] Extracted PDF IDs:', pdfIds);
          console.log('✅ [STREAMING] Query:', messageText);
          debugStreamLog('Calling PDF streaming analyze API', { pdfIds, query: messageText });
          
          // Validate PDF IDs before making request
          if (!pdfIds || pdfIds.length === 0 || pdfIds.some(id => !id)) {
            throw new Error('Invalid PDF IDs: ' + JSON.stringify(pdfIds));
          }
          
          // Create streaming response message
          const responseId = Date.now() + 1;
          let streamedText = '';
          let isMainStream = false; // Track if we're in main stream phase
          
          response = {
            id: responseId,
            text: '',
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: true,
            pdfReferences: storeSelectedPdfs,
            isStreaming: true,
            isLoading: true // Show loading indicator until first chunk
          };
          
          // Add response to messages immediately for streaming
          setMessages(prev => [...prev, response]);
          setIsTyping(true);
          
          // Stream the analysis
          await streamAnalyzePDFs(
            pdfIds,
            messageText,
            messageText,
            // onChunk - called for each token from main stream
            (chunk) => {
              if (!isMainStream) {
                // First chunk from main stream - hide loading indicator and start main text
                isMainStream = true;
                streamedText = chunk;
                
                console.log('🎨 [STREAMING] First chunk received in ChatPage, updating UI', {
                  timestamp: new Date().toISOString(),
                  chunkPreview: chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''),
                  chunkLength: chunk.length
                });
                
                setMessages(prev => prev.map(msg => 
                  msg.id === responseId 
                    ? { ...msg, text: streamedText, isLoading: false }
                    : msg
                ));
              } else {
                // Continue accumulating main stream text
                streamedText += chunk;
                setMessages(prev => {
                  const updated = prev.map(msg => 
                    msg.id === responseId 
                      ? { ...msg, text: streamedText }
                      : msg
                  );
                  return updated;
                });
              }
            },
            // onComplete - called when stream finishes
            (analysisResult) => {
              // Parse JSON table data to table format if available
              let tableColumns = null;
              let tableData = null;
              let cleanedText = analysisResult.analysis || streamedText;
              let csvDataForDownload = null;
              
              if (analysisResult.jsonTableData) {
                console.log('✅ [JSON] JSON table data available, parsing to table format');
                const parsedTable = parseJSONToTable(analysisResult.jsonTableData);
                if (parsedTable) {
                  tableColumns = parsedTable.tableColumns;
                  tableData = parsedTable.tableData;
                  console.log('✅ [JSON] JSON parsed to table:', { 
                    columns: tableColumns.length, 
                    rows: tableData.length 
                  });
                  
                  // Convert JSON to CSV for download
                  csvDataForDownload = convertJSONToCSV(analysisResult.jsonTableData);
                  
                  // Remove JSON markdown code block from displayed text
                  cleanedText = removeJSONFromText(cleanedText);
                  console.log('✅ [JSON] Removed JSON code block from response text');
                }
              } else if (analysisResult.csvData) {
                // Fallback: if CSV data exists (legacy support), use it
                console.log('✅ [CSV] CSV data available (legacy), parsing to table format');
                const parsedTable = parseCSVToTable(analysisResult.csvData);
                if (parsedTable) {
                  tableColumns = parsedTable.tableColumns;
                  tableData = parsedTable.tableData;
                  csvDataForDownload = analysisResult.csvData;
                  cleanedText = removeJSONFromText(cleanedText);
                }
              }
              
              setMessages(prev => prev.map(msg => 
                msg.id === responseId 
                  ? { 
                      ...msg, 
                      text: cleanedText,
                      pdfReferences: analysisResult.referencedPdfs || storeSelectedPdfs,
                      tokensUsed: analysisResult.tokensUsed,
                      isStreaming: false,
                      csvData: csvDataForDownload || analysisResult.csvData || null,
                      tableColumns: tableColumns || msg.tableColumns,
                      tableData: tableData || msg.tableData
                    }
                  : msg
              ));
              setIsTyping(false);
              // Show table and feedback buttons after streaming completes
              setTimeout(() => {
                setTableVisibleByMessageId(prev => ({ ...prev, [responseId]: true }));
                const followUpElement = document.querySelector(`#followup-${responseId}`);
                const feedbackElement = document.querySelector(`#feedback-${responseId}`);
                if (followUpElement) {
                  followUpElement.style.opacity = '1';
                  followUpElement.style.transform = 'translateY(0)';
                }
                if (feedbackElement) {
                  feedbackElement.style.opacity = '1';
                }
              }, 100);
              debugStreamLog('PDF streaming analysis complete', analysisResult);
            },
            // onError - called on error
            (error) => {
              console.error('❌ [STREAMING] Error callback received:', error);
              console.error('❌ [STREAMING] Error type:', typeof error);
              console.error('❌ [STREAMING] Error details:', {
                message: error?.message,
                toString: error?.toString?.(),
                string: String(error),
                error: error
              });
              
              // Extract error message more robustly
              let errorMessage = 'An unknown error occurred';
              if (error) {
                if (error instanceof Error) {
                  errorMessage = error.message || error.toString();
                } else if (typeof error === 'string') {
                  errorMessage = error;
                } else if (error.message) {
                  errorMessage = error.message;
                } else if (error.toString && typeof error.toString === 'function') {
                  errorMessage = error.toString();
                } else {
                  errorMessage = String(error);
                }
              }
              
              // Only update if we have a valid error message
              if (errorMessage && errorMessage !== 'An unknown error occurred') {
                setMessages(prev => prev.map(msg => 
                  msg.id === responseId 
                    ? { 
                        ...msg, 
                        text: `Error analyzing PDFs: ${errorMessage}. Please try again.`,
                        showFollowUp: false,
                        showFeedback: false,
                        isStreaming: false
                      }
                    : msg
                ));
              } else {
                // If we still don't have a message, log and show generic error
                console.error('❌ [STREAMING] Could not extract error message, showing generic error');
                setMessages(prev => prev.map(msg => 
                  msg.id === responseId 
                    ? { 
                        ...msg, 
                        text: `Error analyzing PDFs. Please check the console for details and try again.`,
                        showFollowUp: false,
                        showFeedback: false,
                        isStreaming: false
                      }
                    : msg
                ));
              }
              setIsTyping(false);
            }
          );
          
          // Return early since streaming handles the response
          setIsLoading(false);
          return;
          
        } catch (error) {
          console.error('❌ [STREAMING] Streaming failed, showing error:', error);
          const errorMessage = error?.message || error?.toString() || 'An unknown error occurred';
          response = {
            id: Date.now() + 1,
            text: `Error analyzing PDFs: ${errorMessage}. Please try again.`,
            sender: 'assistant',
            showFollowUp: false,
            showFeedback: false
          };
        }
      } else {
        console.log('ℹ️ [STREAMING] No PDFs selected - storeSelectedPdfs:', storeSelectedPdfs);
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
      
        // Check for exact match first
        const exactMatch = Object.keys(queries).find(key => messageText === key.trim());
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
          const normalizedQuery = normalize(messageText);
          const normalizedHardCoded = normalize(HARD_CODED_HINDI_QUERY);
          const isHindiTruck = isHindiTruckQuery(messageText);
          
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
            const defaultResponse = detectLanguage(messageText) === 'mr' 
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
      }
      
      setIsTyping(true);
      setMessages(prev => [...prev, response]);
      
      // Agent 4: Keep selected PDFs after sending message (user can manually remove them)
      // if (pdfMention.hasSelectedPdfs) {
      //   pdfMention.clearSelectedPDFs();
      // }
      
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
      
    } catch (error) {
      // Error handled in UI
    } finally {
      if (!skipFinally) {
        setIsLoading(false);
      }
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
    setShowVisualization(false);
    
    // Scroll user message to top after it's added to DOM
    scrollUserMessageToTop(newMessage.id);

    try {
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

        setIsLoading(false);
      }, 5000);

    } catch (error) {
      // Error handled in UI
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
            <div className="space-y-0.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1">Previous Chats</h3>
              {chatHistory.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full text-left py-2 px-4 text-sm transition-all rounded-xl truncate ${
                    currentChat?.id === chat.id 
                      ? 'bg-[#EEF2FF] text-gray-900 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={chat.title}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-gradient-to-b from-white to-gray-50/50">
          {!currentChat ? (
            // New Chat View
            <div className="h-full flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white via-gray-50/30 to-white">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-medium text-gray-800">How can I help you today?</h1>
              </div>
              <div className="w-full max-w-[850px] mx-auto">
                {/* Agent 4: PDF Mention Dropdown */}
                {pdfMention.showDropdown && (
                  <PDFMentionDropdown
                    pdfs={pdfMention.availablePdfs}
                    selectedPdfs={pdfMention.selectedPdfs}
                    onSelect={(pdf) => pdfMention.selectPDF(pdf, chatHistorySearch, setChatHistorySearch)}
                    onClose={pdfMention.closeDropdown}
                    searchQuery={pdfMention.searchQuery}
                    position={pdfMention.dropdownPosition}
                    loading={pdfMention.loading}
                    highlightedIndex={pdfMention.highlightedIndex}
                  />
                )}
                
                <div className="relative bg-white rounded-3xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-2 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                      />
                      
                      <textarea
                        value={chatHistorySearch}
                        onChange={(e) => {
                          setChatHistorySearch(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                          pdfMention.handleInputChange(
                            e.target.value,
                            e.target.selectionStart,
                            e.target
                          );
                        }}
                        onKeyDown={(e) => {
                          const handled = pdfMention.handleKeyDown(e, chatHistorySearch, setChatHistorySearch);
                          if (handled) return;
                          
                          if (e.key === 'Enter' && !e.shiftKey && chatHistorySearch.trim()) {
                            e.preventDefault();
                            const hasSelectedPdfs = storeSelectedPdfs && storeSelectedPdfs.length > 0;
                            const newMessage = {
                              id: Date.now(),
                              text: chatHistorySearch.trim(),
                              sender: 'user',
                              attachments: attachments,
                              pdfReferences: hasSelectedPdfs ? [...storeSelectedPdfs] : undefined
                            };
                            const newChat = {
                              id: Date.now(),
                              title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                            };
                            setCurrentChat(newChat);
                            setMessages([newMessage]);
                            // Scroll user message to top after it's added to DOM
                            setTimeout(() => scrollUserMessageToTop(newMessage.id), 100);
                            handleSearch(chatHistorySearch);
                            setAttachments([]);
                            e.target.style.height = 'auto';
                          }
                        }}
                        placeholder="Ask anything"
                        rows="1"
                        className="flex-1 text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent resize-none overflow-hidden py-1"
                      />
                      
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                          <Paperclip className="w-5 h-5 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => {
                            if (chatHistorySearch.trim()) {
                              const hasSelectedPdfs = storeSelectedPdfs && storeSelectedPdfs.length > 0;
                              const newMessage = {
                                id: Date.now(),
                                text: chatHistorySearch.trim(),
                                sender: 'user',
                                attachments: attachments,
                                pdfReferences: hasSelectedPdfs ? [...storeSelectedPdfs] : undefined
                              };
                              const newChat = {
                                id: Date.now(),
                                title: chatHistorySearch.length > 30 ? `${chatHistorySearch.slice(0, 30)}...` : chatHistorySearch
                              };
                              setCurrentChat(newChat);
                              setMessages([newMessage]);
                              // Scroll user message to top after it's added to DOM
                              setTimeout(() => scrollUserMessageToTop(newMessage.id), 100);
                              handleSearch(chatHistorySearch);
                              setAttachments([]);
                            }
                          }}
                          disabled={!chatHistorySearch.trim()}
                          className="p-2 bg-[#3551F3] hover:bg-[#2B41D9] disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Agent 4: PDF Reference Badges inside input */}
                    {storeSelectedPdfs && storeSelectedPdfs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {storeSelectedPdfs.map(pdf => (
                          <div key={pdf.s3Key || pdf.id} className="flex items-center gap-1 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-xs">
                            <FileText className="w-3 h-3" />
                            <span>{pdf.filename}</span>
                            <button
                              onClick={() => storeDeselectPDF(pdf.s3Key || pdf.id)}
                              className="hover:bg-[#3551F3] hover:text-white p-0.5 rounded-full transition-colors ml-0.5"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat View
            <>
              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="h-full w-full absolute inset-0 p-6">
                <div className="space-y-4 max-w-5xl mx-auto pb-32">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      data-message-id={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                       <div
                         className={`max-w-[85%] rounded-2xl py-3 px-5 ${
                           msg.sender === 'user'
                             ? 'bg-[#EEF2FF] text-gray-900'
                             : 'text-gray-900'
                         }`}
                       >
                        {msg.sender === 'assistant' ? (
                          <div>
                            {msg.isStreaming ? (
                              // For streaming messages
                              msg.isLoading ? (
                                // Show loading indicator while waiting for first chunk
                                <LoadingIndicator isActive={true} />
                              ) : msg.text && msg.text.trim() ? (
                                // Show streaming text with cursor once main stream starts
                                <div>
                                  <MarkdownText text={msg.text} />
                                  <span className="inline-block">
                                    <StreamingCursor />
                                  </span>
                                </div>
                              ) : (
                                // Fallback: show loading indicator if no text yet
                                <LoadingIndicator isActive={true} />
                              )
                            ) : (
                              // For non-streaming messages, display with markdown formatting
                              <MarkdownText text={msg.text} />
                            )}
                            
                            {/* Show table immediately for non-streaming messages, or after streaming completes */}
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
                            
                            {/* View Sources Section */}
                            {msg.tableData && Array.isArray(msg.tableData) && msg.tableData.length > 0 && tableVisibleByMessageId[msg.id] && (msg.internalReferences || msg.externalReferences) && (
                              <div className="mt-4">
                                <button
                                  onClick={() => {
                                    setExpandedSourcesByMessageId(prev => ({
                                      ...prev,
                                      [msg.id]: !prev[msg.id]
                                    }));
                                  }}
                                  className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 flex items-center justify-between transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700">View Sources</span>
                                  {expandedSourcesByMessageId[msg.id] ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                                
                                {expandedSourcesByMessageId[msg.id] && (
                                  <div className="mt-2 space-y-4 bg-white border border-gray-200 rounded-lg p-4">
                                    {/* Internal References */}
                                    {msg.internalReferences && msg.internalReferences.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Internal References</h4>
                                        <div className="space-y-2">
                                          {msg.internalReferences.map((ref, idx) => (
                                            <a
                                              key={idx}
                                              href={ref.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                              <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />
                                              <span className="text-sm text-gray-700 flex-1 truncate">{ref.title}</span>
                                              <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* External References */}
                                    {msg.externalReferences && msg.externalReferences.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">External References</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {msg.externalReferences.map((ref, idx) => (
                                            <a
                                              key={idx}
                                              href={ref.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                              <img 
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(ref.url).hostname}&sz=16`}
                                                alt=""
                                                className="w-4 h-4 flex-shrink-0"
                                                onError={(e) => {
                                                  // Fallback to orange square if favicon fails to load
                                                  e.target.onerror = null;
                                                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23FB923C"/></svg>';
                                                }}
                                              />
                                              <span className="text-sm text-gray-700">{ref.title}</span>
                                              <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* View Sources Section for messages WITHOUT tables */}
                            {(!msg.tableData || !tableVisibleByMessageId[msg.id]) && (msg.internalReferences || msg.externalReferences) && !msg.isStreaming && (
                              <div className="mt-4">
                                <button
                                  onClick={() => {
                                    setExpandedSourcesByMessageId(prev => ({
                                      ...prev,
                                      [msg.id]: !prev[msg.id]
                                    }));
                                  }}
                                  className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 flex items-center justify-between transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700">View Sources</span>
                                  {expandedSourcesByMessageId[msg.id] ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>

                                {expandedSourcesByMessageId[msg.id] && (
                                  <div className="mt-2 space-y-4 bg-white border border-gray-200 rounded-lg p-4">
                                    {/* External References */}
                                    {msg.externalReferences && msg.externalReferences.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">External References</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {msg.externalReferences.map((ref, idx) => (
                                            <a
                                              key={idx}
                                              href={ref.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                              <img
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(ref.url).hostname}&sz=16`}
                                                alt=""
                                                className="w-4 h-4 flex-shrink-0"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23FB923C"/></svg>';
                                                }}
                                              />
                                              <span className="text-sm text-gray-700">{ref.title}</span>
                                              <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            <div
                              id={`feedback-${msg.id}`}
                              className="mt-4 flex items-center gap-2 flex-wrap"
                              style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
                            >
                              {msg.csvData && (
                                <button 
                                  onClick={() => {
                                    try {
                                      downloadCSV(msg.csvData);
                                    } catch (error) {
                                      console.error('❌ [CSV] Error downloading CSV:', error);
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-[#3551F3] hover:bg-[#EEF2FF] rounded-lg transition-colors flex items-center gap-1.5"
                                  title="Download CSV"
                                >
                                  <FileText className="w-4 h-4" />
                                  Download CSV
                                </button>
                              )}
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
                          <div className="space-y-2">
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {msg.text}
                            </div>
                            {/* Agent 4: Show PDF references in user messages */}
                             {msg.pdfReferences && msg.pdfReferences.length > 0 && (
                               <div className="pt-2 mt-2">
                                 <div className="flex flex-wrap gap-1.5">
                                   {msg.pdfReferences.map(pdf => (
                                     <div key={pdf.s3Key} className="flex items-center gap-1 bg-[#3551F3] text-white px-2 py-1 rounded-full text-xs">
                                       <FileText className="w-3 h-3" />
                                       <span>{pdf.filename}</span>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Invisible element at the end to scroll to */}
                  <div ref={messagesEndRef} />

                  {/* Loading steps indicator */}
                  {(() => {
                    const shouldShow = isLoading && isKomatsuQuery;
                    const loadingSteps = currentQueryType === 'komatsu' ? komatsuLoadingSteps : rioTintoLoadingSteps;
                    console.log('🔍 [RENDER] LoadingSteps check:', { isLoading, isKomatsuQuery, shouldShow, currentStep, currentQueryType });
                    return shouldShow && (
                      <div className="flex justify-start w-full">
                        <div className="w-[95%] rounded-2xl px-8 py-6 bg-white border border-gray-200">
                          <h4 className="text-base font-medium text-gray-700 mb-5">Processing your request</h4>
                          <LoadingSteps steps={loadingSteps} currentStep={currentStep} />
                        </div>
                      </div>
                    );
                  })()}

                  {isTyping && !isLoading && !isKomatsuQuery && (
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
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white from-60% via-white/95 via-70% to-transparent pb-4 pt-8 px-6 pointer-events-none">
                <div className="max-w-[850px] mx-auto pointer-events-auto">
                  {/* Agent 4: PDF Mention Dropdown */}
                  {pdfMention.showDropdown && (
                    <PDFMentionDropdown
                      pdfs={pdfMention.availablePdfs}
                      selectedPdfs={pdfMention.selectedPdfs}
                      onSelect={(pdf) => pdfMention.selectPDF(pdf, inputValue, setInputValue)}
                      onClose={pdfMention.closeDropdown}
                      searchQuery={pdfMention.searchQuery}
                      position={pdfMention.dropdownPosition}
                      loading={pdfMention.loading}
                      highlightedIndex={pdfMention.highlightedIndex}
                    />
                  )}
                  
                  <div className="relative bg-white rounded-3xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col px-5 py-3">
                      <div className="flex items-start gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          multiple
                        />
                        
                        <textarea
                          ref={chatInputRef}
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                            pdfMention.handleInputChange(
                              e.target.value,
                              e.target.selectionStart,
                              e.target
                            );
                          }}
                          onKeyDown={(e) => {
                            const handled = pdfMention.handleKeyDown(e, inputValue, setInputValue);
                            if (handled) return;
                            
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                              setTimeout(() => {
                                if (chatInputRef.current) {
                                  chatInputRef.current.style.height = 'auto';
                                }
                              }, 0);
                            }
                          }}
                          placeholder="Ask anything"
                          rows="1"
                          className="flex-1 text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent resize-none overflow-hidden py-1 min-h-[24px]"
                          disabled={isLoading}
                        />
                        
                        <div className="flex items-center gap-1 pt-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <Paperclip className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() && (!storeSelectedPdfs || storeSelectedPdfs.length === 0)}
                            className="p-2 bg-[#3551F3] hover:bg-[#2B41D9] disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all"
                          >
                            <Send className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Agent 4: PDF Reference Badges inside input */}
                      {storeSelectedPdfs && storeSelectedPdfs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 mt-1">
                          {storeSelectedPdfs.map(pdf => (
                            <div key={pdf.s3Key || pdf.id} className="flex items-center gap-1 bg-[#EEF2FF] text-[#3551F3] px-2 py-1 rounded-full text-xs">
                              <FileText className="w-3 h-3" />
                              <span>{pdf.filename}</span>
                              <button
                                onClick={() => storeDeselectPDF(pdf.s3Key || pdf.id)}
                                className="hover:bg-[#3551F3] hover:text-white p-0.5 rounded-full transition-colors ml-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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