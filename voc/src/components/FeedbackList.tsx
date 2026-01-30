import { useState, useRef, useEffect } from "react"
import { Phone, MessageCircle, ChevronRight, ChevronDown, Calendar, X, Play, Pause, SlidersHorizontal, AlertTriangle, ThumbsUp, ThumbsDown, Lightbulb, Target, Volume2, FileText } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"

interface SubRating {
  label: string
  score: number
}

interface ParameterRating {
  parameter: string
  shortName: string
  score: number
  target: number
  subRatings: SubRating[]
}

interface Feedback {
  id: string
  customerName: string
  businessName: string
  businessType: string
  source: "voice" | "whatsapp"
  date: string
  dsr: string
  sentiment: "positive" | "neutral" | "negative"
  feedback: string
  overallScore: number
  ratings: ParameterRating[]
  audioSrc?: string
  transcript?: { speaker: string; text: string }[]
}

const feedbackData: Feedback[] = [
  {
    id: "1",
    customerName: "Rajesh Painter",
    businessName: "Rajesh Paint Works",
    businessType: "Painter",
    source: "voice",
    date: "2 hours ago",
    dsr: "Amit Sharma",
    sentiment: "neutral",
    feedback: "Ravi bhai ka visit achha tha. Naye shade card dikhaye. Delivery mein problem aa rahi hai pichhle 2 order mein. Premium paint ka stock kam rehta hai.",
    overallScore: 5.9,
    audioSrc: "/rajesh-voice.mp3",
    transcript: [
      { speaker: "Nerolac", text: "Hello Rajesh ji, main Nerolac se bol raha hoon. Aaj ka goal bas aapka honest feedback lena hai. Aap mujhe bataye, abhi overall aap Nerolac ke saath kaam karte hue kaisa feel kar rahe hain? Koi challenges ya improvements jo aapke mann mein hain?" },
      { speaker: "Rajesh", text: "Aaj ye ho gaya hai ki Birla Optus ki market mein kaafi demand hai. Toh uska stock thoda zyada rakhna padta hai. Nerolac ko bhi mere saath se kuch karna chahiye, taaki hamare area mein thoda demand badhe." },
      { speaker: "Nerolac", text: "Samajh gaya, matlab marketing aur branding mein thoda zyada effort hona chahiye taaki demand create ho. Theek hai, main ye note kar leta hoon. Waise overall product range ya quality ko lekar koi feedback dena chahenge?" },
      { speaker: "Rajesh", text: "No, no. Range achhi hai. Different products jo available hain wo useful hain. Usmein koi problem nahi hai. Bas ek issue hai. Sales guy aata jaata rehta hai, lekin wo utna achha nahi hai. Wo bhool jaata hai humne last time kya baat ki thi. Same discussion baar-baar hota rehta hai. Jaise billing ka problem tha, toh wo solve ho jaata hai, lekin ek baar mein nahi hota. Aapko follow-up karna padta hai, baar-baar yaad dilana padta hai." },
      { speaker: "Nerolac", text: "Samajh aaya, matlab sales team follow-up mein thoda inconsistent hai aur responsiveness mein gap lagta hai. Theek hai, main ye bhi note kar leta hoon. Waise delivery ya execution ke hisaab se sab smooth hai ya wahan bhi kuch issues hain?" },
      { speaker: "Rajesh", text: "Service theek hi hai, koi major issue nahi hai." },
      { speaker: "Nerolac", text: "Theek hai. Aur digital tools ya communication ke baare mein? Koi aisi cheez jisme aapko lagta ho Nerolac better kar sakta hai?" },
      { speaker: "Rajesh", text: "Hamare paas digital wagairah theek hi hai." },
      { speaker: "Nerolac", text: "Theek hai Rajesh ji, jo aapne share kiya wo sab note kar liya hai. Aapka time dene ke liye bahut dhanyavaad. Hum aapki feedback ko improvement ke liye use karenge." },
      { speaker: "Rajesh", text: "Yeah, let's wrap up. Thank you." },
    ],
    ratings: [
      { parameter: "Sales Team Interaction", shortName: "Sales", score: 4.0, target: 8.0, subRatings: [
        { label: "Regular and on time visits", score: 4 },
        { label: "Empathy & relationship", score: 4.5 },
        { label: "Well informed & knowledgeable", score: 3.5 },
        { label: "Responsive & proactive", score: 4 },
        { label: "Clear and transparent", score: 4 },
      ]},
      { parameter: "Perceived Value & Competitiveness", shortName: "Value", score: 5.0, target: 7.5, subRatings: [
        { label: "Price vs quality balance", score: 5 },
        { label: "Competitive pricing", score: 4.5 },
        { label: "Value for money", score: 5.5 },
        { label: "Scheme attractiveness", score: 5 },
        { label: "Credit terms flexibility", score: 5 },
      ]},
      { parameter: "Product Portfolio & Quality", shortName: "Product", score: 8.5, target: 8.5, subRatings: [
        { label: "Product range availability", score: 8 },
        { label: "Consistent quality", score: 9 },
        { label: "Color accuracy", score: 8.5 },
        { label: "Durability & finish", score: 8.5 },
        { label: "New product introductions", score: 8.5 },
      ]},
      { parameter: "Service Quality & Execution", shortName: "Service", score: 6.0, target: 8.0, subRatings: [
        { label: "Delivery timeliness", score: 5 },
        { label: "Order accuracy", score: 6.5 },
        { label: "Complaint resolution", score: 6 },
        { label: "Technical support", score: 7 },
        { label: "After-sales service", score: 5.5 },
      ]},
      { parameter: "Marketing & Branding Collaterals", shortName: "Marketing", score: 5.0, target: 7.0, subRatings: [
        { label: "Brand visibility", score: 5 },
        { label: "Promotional materials", score: 5 },
        { label: "Shop branding support", score: 5 },
        { label: "Digital presence", score: 5 },
        { label: "Local advertising", score: 5 },
      ]},
      { parameter: "Communication & Engagement", shortName: "Comms", score: 6.0, target: 7.5, subRatings: [
        { label: "Update frequency", score: 6 },
        { label: "Scheme communication", score: 5.5 },
        { label: "Feedback responsiveness", score: 6.5 },
        { label: "Training & workshops", score: 6 },
        { label: "Loyalty program clarity", score: 6 },
      ]},
      { parameter: "Digitalization", shortName: "Digital", score: 7.0, target: 7.5, subRatings: [
        { label: "App/portal adoption", score: 7 },
        { label: "Online ordering ease", score: 7 },
        { label: "Digital payment options", score: 7.5 },
        { label: "Tech support availability", score: 6.5 },
        { label: "Data & reporting access", score: 7 },
      ]},
    ],
  },
  {
    id: "2",
    customerName: "Sunil Kumar",
    businessName: "Kumar Paint House",
    businessType: "Retailer",
    source: "whatsapp",
    date: "5 hours ago",
    dsr: "Priya Patel",
    sentiment: "negative",
    feedback: "Aaj jo order aaya usme 2 tin dented the. Customer ne wapas kar diya. Packing improve karo. DSR ko bola tha lekin koi action nahi hua.",
    overallScore: 5.8,
    ratings: [
      { parameter: "Sales Team Interaction", shortName: "Sales", score: 6.5, target: 8.0, subRatings: [
        { label: "Regular and on time visits", score: 7 },
        { label: "Empathy & relationship", score: 7 },
        { label: "Well informed & knowledgeable", score: 7 },
        { label: "Responsive & proactive", score: 5 },
        { label: "Clear and transparent", score: 6.5 },
      ]},
      { parameter: "Perceived Value & Competitiveness", shortName: "Value", score: 6.5, target: 7.5, subRatings: [
        { label: "Price vs quality balance", score: 6 },
        { label: "Competitive pricing", score: 6.5 },
        { label: "Value for money", score: 7 },
        { label: "Scheme attractiveness", score: 6.5 },
        { label: "Credit terms flexibility", score: 6.5 },
      ]},
      { parameter: "Product Portfolio & Quality", shortName: "Product", score: 7.0, target: 8.5, subRatings: [
        { label: "Product range availability", score: 7 },
        { label: "Consistent quality", score: 8 },
        { label: "Color accuracy", score: 7 },
        { label: "Durability & finish", score: 7.5 },
        { label: "New product introductions", score: 5.5 },
      ]},
      { parameter: "Service Quality & Execution", shortName: "Service", score: 4.0, target: 8.0, subRatings: [
        { label: "Delivery timeliness", score: 5 },
        { label: "Order accuracy", score: 3 },
        { label: "Complaint resolution", score: 3 },
        { label: "Technical support", score: 5 },
        { label: "After-sales service", score: 4 },
      ]},
      { parameter: "Marketing & Branding", shortName: "Marketing", score: 6.0, target: 7.0, subRatings: [
        { label: "Brand visibility", score: 6 },
        { label: "Promotional materials", score: 6 },
        { label: "Shop branding support", score: 6 },
        { label: "Digital presence", score: 6 },
        { label: "Local advertising", score: 6 },
      ]},
      { parameter: "Communication & Engagement", shortName: "Comms", score: 5.0, target: 7.5, subRatings: [
        { label: "Update frequency", score: 5 },
        { label: "Scheme communication", score: 5 },
        { label: "Feedback responsiveness", score: 4.5 },
        { label: "Training & workshops", score: 5.5 },
        { label: "Loyalty program clarity", score: 5 },
      ]},
    ],
  },
  {
    id: "3",
    customerName: "Amit Sharma",
    businessName: "Sharma Paints",
    businessType: "Hardware",
    source: "voice",
    date: "1 day ago",
    dsr: "Vikram Singh",
    sentiment: "positive",
    feedback: "Bahut achha experience. Naya DSR Vikram helpful hai. Scheme bhi achha mila. Primer ka stock thoda zyada rakhna chahiye.",
    overallScore: 8.5,
    ratings: [
      { parameter: "Sales Team Interaction", shortName: "Sales", score: 9.2, target: 8.0, subRatings: [
        { label: "Regular and on time visits", score: 9 },
        { label: "Empathy & relationship", score: 9.5 },
        { label: "Well informed & knowledgeable", score: 9 },
        { label: "Responsive & proactive", score: 9.5 },
        { label: "Clear and transparent", score: 9 },
      ]},
      { parameter: "Perceived Value & Competitiveness", shortName: "Value", score: 8.5, target: 7.5, subRatings: [
        { label: "Price vs quality balance", score: 8.5 },
        { label: "Competitive pricing", score: 8 },
        { label: "Value for money", score: 9 },
        { label: "Scheme attractiveness", score: 9 },
        { label: "Credit terms flexibility", score: 8 },
      ]},
      { parameter: "Product Portfolio & Quality", shortName: "Product", score: 7.8, target: 8.5, subRatings: [
        { label: "Product range availability", score: 6.5 },
        { label: "Consistent quality", score: 9 },
        { label: "Color accuracy", score: 8 },
        { label: "Durability & finish", score: 8.5 },
        { label: "New product introductions", score: 7 },
      ]},
      { parameter: "Service Quality & Execution", shortName: "Service", score: 8.0, target: 8.0, subRatings: [
        { label: "Delivery timeliness", score: 8 },
        { label: "Order accuracy", score: 8.5 },
        { label: "Complaint resolution", score: 8 },
        { label: "Technical support", score: 8 },
        { label: "After-sales service", score: 7.5 },
      ]},
      { parameter: "Marketing & Branding", shortName: "Marketing", score: 8.5, target: 7.0, subRatings: [
        { label: "Brand visibility", score: 9 },
        { label: "Promotional materials", score: 8 },
        { label: "Shop branding support", score: 8.5 },
        { label: "Digital presence", score: 8 },
        { label: "Local advertising", score: 9 },
      ]},
      { parameter: "Communication & Engagement", shortName: "Comms", score: 9.0, target: 7.5, subRatings: [
        { label: "Update frequency", score: 9 },
        { label: "Scheme communication", score: 9 },
        { label: "Feedback responsiveness", score: 9 },
        { label: "Training & workshops", score: 9 },
        { label: "Loyalty program clarity", score: 9 },
      ]},
    ],
  },
  {
    id: "4",
    customerName: "Prakash Gupta",
    businessName: "City Colors",
    businessType: "Painter",
    source: "whatsapp",
    date: "1 day ago",
    dsr: "Rajesh Kumar",
    sentiment: "negative",
    feedback: "Saamne wale shop mein Asian ka rate 10% kam hai. Mujhe bhi match karo warna customer udhar jayega. Quality achhi hai lekin rate matter karta hai.",
    overallScore: 6.2,
    ratings: [
      { parameter: "Sales Team Interaction", shortName: "Sales", score: 7.0, target: 8.0, subRatings: [
        { label: "Regular and on time visits", score: 7 },
        { label: "Empathy & relationship", score: 7 },
        { label: "Well informed & knowledgeable", score: 7.5 },
        { label: "Responsive & proactive", score: 6.5 },
        { label: "Clear and transparent", score: 7 },
      ]},
      { parameter: "Perceived Value & Competitiveness", shortName: "Value", score: 4.5, target: 7.5, subRatings: [
        { label: "Price vs quality balance", score: 5 },
        { label: "Competitive pricing", score: 3.5 },
        { label: "Value for money", score: 5 },
        { label: "Scheme attractiveness", score: 4.5 },
        { label: "Credit terms flexibility", score: 4.5 },
      ]},
      { parameter: "Product Portfolio & Quality", shortName: "Product", score: 8.0, target: 8.5, subRatings: [
        { label: "Product range availability", score: 8 },
        { label: "Consistent quality", score: 8.5 },
        { label: "Color accuracy", score: 8 },
        { label: "Durability & finish", score: 8 },
        { label: "New product introductions", score: 7.5 },
      ]},
      { parameter: "Service Quality & Execution", shortName: "Service", score: 6.5, target: 8.0, subRatings: [
        { label: "Delivery timeliness", score: 7 },
        { label: "Order accuracy", score: 7 },
        { label: "Complaint resolution", score: 6 },
        { label: "Technical support", score: 6.5 },
        { label: "After-sales service", score: 6 },
      ]},
      { parameter: "Marketing & Branding", shortName: "Marketing", score: 6.0, target: 7.0, subRatings: [
        { label: "Brand visibility", score: 6 },
        { label: "Promotional materials", score: 6 },
        { label: "Shop branding support", score: 6 },
        { label: "Digital presence", score: 6 },
        { label: "Local advertising", score: 6 },
      ]},
      { parameter: "Communication & Engagement", shortName: "Comms", score: 5.5, target: 7.5, subRatings: [
        { label: "Update frequency", score: 5.5 },
        { label: "Scheme communication", score: 5 },
        { label: "Feedback responsiveness", score: 6 },
        { label: "Training & workshops", score: 5.5 },
        { label: "Loyalty program clarity", score: 5.5 },
      ]},
    ],
  },
  {
    id: "5",
    customerName: "Mohan Lal",
    businessName: "Lal Paint Center",
    businessType: "Retailer",
    source: "voice",
    date: "2 days ago",
    dsr: "Sneha Gupta",
    sentiment: "positive",
    feedback: "Sab theek chal raha hai. Bas ek request - WhatsApp pe scheme update jaldi bhejo, market mein pehle pata chal jaata hai.",
    overallScore: 7.8,
    ratings: [
      { parameter: "Sales Team Interaction", shortName: "Sales", score: 8.0, target: 8.0, subRatings: [
        { label: "Regular and on time visits", score: 8 },
        { label: "Empathy & relationship", score: 8 },
        { label: "Well informed & knowledgeable", score: 8 },
        { label: "Responsive & proactive", score: 8 },
        { label: "Clear and transparent", score: 8 },
      ]},
      { parameter: "Perceived Value & Competitiveness", shortName: "Value", score: 7.5, target: 7.5, subRatings: [
        { label: "Price vs quality balance", score: 7.5 },
        { label: "Competitive pricing", score: 7 },
        { label: "Value for money", score: 8 },
        { label: "Scheme attractiveness", score: 7.5 },
        { label: "Credit terms flexibility", score: 7.5 },
      ]},
      { parameter: "Product Portfolio & Quality", shortName: "Product", score: 8.2, target: 8.5, subRatings: [
        { label: "Product range availability", score: 8 },
        { label: "Consistent quality", score: 8.5 },
        { label: "Color accuracy", score: 8 },
        { label: "Durability & finish", score: 8.5 },
        { label: "New product introductions", score: 8 },
      ]},
      { parameter: "Service Quality & Execution", shortName: "Service", score: 7.8, target: 8.0, subRatings: [
        { label: "Delivery timeliness", score: 8 },
        { label: "Order accuracy", score: 8 },
        { label: "Complaint resolution", score: 7.5 },
        { label: "Technical support", score: 7.5 },
        { label: "After-sales service", score: 8 },
      ]},
      { parameter: "Marketing & Branding", shortName: "Marketing", score: 7.5, target: 7.0, subRatings: [
        { label: "Brand visibility", score: 7.5 },
        { label: "Promotional materials", score: 7.5 },
        { label: "Shop branding support", score: 7.5 },
        { label: "Digital presence", score: 7.5 },
        { label: "Local advertising", score: 7.5 },
      ]},
      { parameter: "Communication & Engagement", shortName: "Comms", score: 6.5, target: 7.5, subRatings: [
        { label: "Update frequency", score: 6 },
        { label: "Scheme communication", score: 5.5 },
        { label: "Feedback responsiveness", score: 7 },
        { label: "Training & workshops", score: 7 },
        { label: "Loyalty program clarity", score: 7 },
      ]},
    ],
  },
]

const dsrOptions = ["All DSRs", "Amit Sharma", "Priya Patel", "Rajesh Kumar", "Sneha Gupta", "Vikram Singh"]

function getScoreColor(score: number) {
  if (score >= 8) return { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50", border: "border-emerald-200" }
  if (score >= 6) return { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-50", border: "border-amber-200" }
  return { bg: "bg-red-500", text: "text-red-700", light: "bg-red-50", border: "border-red-200" }
}

function getScoreBgFull(score: number) {
  if (score >= 8) return "bg-emerald-500"
  if (score >= 6) return "bg-amber-500"
  return "bg-red-500"
}

function getSentimentInfo(sentiment: string) {
  switch (sentiment) {
    case "positive": return { label: "Positive", color: "text-emerald-700", bg: "bg-emerald-50" }
    case "negative": return { label: "Negative", color: "text-red-700", bg: "bg-red-50" }
    default: return { label: "Neutral", color: "text-slate-700", bg: "bg-slate-50" }
  }
}

function ScoreCircle({ score, size = "default" }: { score: number; size?: "default" | "large" }) {
  const colors = getScoreColor(score)
  const circumference = 2 * Math.PI * 16
  const progress = (score / 10) * circumference

  return (
    <div className={cn("relative", size === "large" ? "w-16 h-16" : "w-10 h-10")}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="16" fill="none"
          className={colors.bg}
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-bold", colors.text, size === "large" ? "text-lg" : "text-xs")}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const colors = getScoreColor(score)
  return (
    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", colors.bg)}>
      <span className="text-[12px] font-bold text-white leading-none">{score.toFixed(1)}</span>
    </div>
  )
}

function ScoreBar({ score, target }: { score: number; target: number }) {
  const colors = getScoreColor(score)
  const isAboveTarget = score >= target

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className={cn("h-full rounded-full transition-all", colors.bg)}
          style={{ width: `${score * 10}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-400"
          style={{ left: `${target * 10}%` }}
        />
      </div>
      <span className={cn("text-[11px] font-semibold w-8", isAboveTarget ? "text-emerald-600" : "text-red-600")}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

function generateInsights(feedback: Feedback) {
  const strengths = feedback.ratings
    .filter(r => r.score >= r.target)
    .sort((a, b) => (b.score - b.target) - (a.score - a.target))
  const weaknesses = feedback.ratings
    .filter(r => r.score < r.target)
    .sort((a, b) => (a.score - a.target) - (b.score - b.target))

  const criticalGaps = weaknesses.filter(r => r.target - r.score >= 1.5)

  const avgScore = feedback.ratings.reduce((s, r) => s + r.score, 0) / feedback.ratings.length
  const avgTarget = feedback.ratings.reduce((s, r) => s + r.target, 0) / feedback.ratings.length

  return { strengths, weaknesses, criticalGaps, avgScore, avgTarget }
}

function VoicePlayer({ src }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setCurrentTime(0) }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audio.currentTime = pct * duration
    setCurrentTime(pct * duration)
  }

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00"
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3 w-3 text-blue-600" />
            <span className="text-[11px] font-medium text-blue-700">Voice Call Recording</span>
          </div>
          <span className="text-[10px] text-blue-500">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div
          className="h-1.5 bg-blue-100 rounded-full overflow-hidden cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function TranscriptSection({ transcript }: { transcript: { speaker: string; text: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-6 border border-border/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/70 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">Call Transcript</span>
          <span className="text-[11px] text-muted-foreground">({transcript.length} exchanges)</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && (
        <div className="px-4 py-3 max-h-[300px] overflow-y-auto space-y-3">
          {transcript.map((line, i) => (
            <div key={i} className={cn(
              "flex gap-3",
              line.speaker === "Nerolac" ? "flex-row" : "flex-row-reverse"
            )}>
              <div className={cn(
                "max-w-[80%] rounded-xl px-3.5 py-2.5",
                line.speaker === "Nerolac"
                  ? "bg-slate-100 rounded-tl-sm"
                  : "bg-blue-50 rounded-tr-sm"
              )}>
                <p className={cn(
                  "text-[10px] font-semibold mb-1",
                  line.speaker === "Nerolac" ? "text-slate-500" : "text-blue-600"
                )}>
                  {line.speaker === "Nerolac" ? "Caller (Nerolac)" : `${line.speaker} (Rajesh Paint Works)`}
                </p>
                <p className="text-[12px] text-slate-700 leading-relaxed">{line.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FeedbackDetailModal({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) {
  const radarData = feedback.ratings.map(r => ({
    subject: r.shortName,
    score: r.score * 10,
    target: r.target * 10,
    fullMark: 100,
  }))

  const barData = feedback.ratings.map(r => ({
    name: r.shortName,
    actual: r.score,
    target: r.target,
    gap: r.score - r.target,
  }))

  const insights = generateInsights(feedback)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ScoreCircle score={feedback.overallScore} size="large" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{feedback.customerName}</h3>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span>{feedback.businessName}</span>
                <span>•</span>
                <span>{feedback.businessType}</span>
                <span>•</span>
                <span className="text-muted-foreground">DSR: {feedback.dsr}</span>
                <span>•</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                  feedback.source === "voice" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                )}>
                  {feedback.source === "voice" ? "Voice" : "WhatsApp"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Voice Player for voice calls */}
          {feedback.source === "voice" && (
            <div className="mb-6">
              <VoicePlayer src={feedback.audioSrc} />
            </div>
          )}

          {/* Collapsible Transcript */}
          {feedback.transcript && feedback.transcript.length > 0 && (
            <TranscriptSection transcript={feedback.transcript} />
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Radar Chart */}
            <div className="bg-white border border-border/60 rounded-xl p-4">
              <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Performance vs Target
              </h4>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <Radar
                      name="Actual"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-foreground text-background text-[11px] rounded-md px-3 py-2 shadow-lg">
                              <div className="font-medium mb-1">{payload[0]?.payload?.subject}</div>
                              <div>Actual: {((payload[1]?.value as number) / 10).toFixed(1)}</div>
                              <div>Target: {((payload[0]?.value as number) / 10).toFixed(1)}</div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gap Analysis Bar Chart */}
            <div className="bg-white border border-border/60 rounded-xl p-4">
              <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Gap Analysis (Actual vs Target)
              </h4>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload
                          return (
                            <div className="bg-foreground text-background text-[11px] rounded-md px-3 py-2 shadow-lg">
                              <div className="font-medium mb-1">{data.name}</div>
                              <div>Actual: {data.actual.toFixed(1)}</div>
                              <div>Target: {data.target.toFixed(1)}</div>
                              <div className={data.gap >= 0 ? "text-emerald-300" : "text-red-300"}>
                                Gap: {data.gap >= 0 ? "+" : ""}{data.gap.toFixed(1)}
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} name="Target" />
                    <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} name="Actual" />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-slate-50 border border-border/40 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h4 className="text-[13px] font-semibold text-foreground">Key Insights</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Strengths</span>
                </div>
                {insights.strengths.length > 0 ? (
                  <div className="space-y-3">
                    {insights.strengths.slice(0, 3).map((r) => {
                      const topSubs = [...r.subRatings].sort((a, b) => b.score - a.score).slice(0, 2)
                      return (
                        <div key={r.parameter}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-medium text-slate-700">{r.parameter}</span>
                            <span className="text-[11px] font-semibold text-emerald-600">
                              {r.score.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Excels in {topSubs.map(s => s.label.toLowerCase()).join(" & ")}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground">No parameters meeting target yet</p>
                )}
              </div>

              {/* Weaknesses */}
              {insights.weaknesses.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Needs Improvement</span>
                  </div>
                  <div className="space-y-2">
                    {insights.weaknesses.slice(0, 3).map((r) => (
                      <div key={r.parameter} className="flex items-center justify-between">
                        <span className="text-[12px] text-slate-700">{r.shortName}</span>
                        <span className="text-[11px] font-semibold text-red-600">
                          {r.score.toFixed(1)} ({(r.score - r.target).toFixed(1)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Alerts */}
              {insights.criticalGaps.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Critical Gaps</span>
                  </div>
                  <div className="space-y-2">
                    {insights.criticalGaps.map((r) => (
                      <div key={r.parameter} className="text-[12px] text-slate-700">
                        <span className="font-medium">{r.shortName}</span> is {(r.target - r.score).toFixed(1)} pts below target — immediate attention needed
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Summary */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">Summary</span>
                </div>
                <div className="space-y-2 text-[12px] text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Average Score</span>
                    <span className="font-semibold">{insights.avgScore.toFixed(1)} / 10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Target</span>
                    <span className="font-semibold">{insights.avgTarget.toFixed(1)} / 10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overall Gap</span>
                    <span className={cn("font-semibold", insights.avgScore >= insights.avgTarget ? "text-emerald-600" : "text-red-600")}>
                      {insights.avgScore >= insights.avgTarget ? "+" : ""}{(insights.avgScore - insights.avgTarget).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Parameters on Target</span>
                    <span className="font-semibold">{insights.strengths.length} / {feedback.ratings.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parameter Breakdown */}
          <div>
            <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Parameter Breakdown
            </h4>
            <div className="space-y-3">
              {feedback.ratings.map((rating) => {
                const colors = getScoreColor(rating.score)
                const gap = rating.score - rating.target

                return (
                  <div key={rating.parameter} className="bg-white border border-border/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">{rating.parameter}</span>
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          gap >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {gap >= 0 ? "+" : ""}{gap.toFixed(1)} vs target
                        </span>
                      </div>
                      <div className={cn("text-[14px] font-bold", colors.text)}>
                        {rating.score.toFixed(1)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {rating.subRatings.map((sub) => (
                        <div key={sub.label} className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground w-[160px] shrink-0 truncate">
                            {sub.label}
                          </span>
                          <ScoreBar score={sub.score} target={rating.target} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeedbackRow({ feedback, onClick }: { feedback: Feedback; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-border/40 last:border-b-0"
    >
      {/* Source Icon */}
      <div className={cn(
        "p-1.5 rounded-lg shrink-0",
        feedback.source === "voice" ? "bg-blue-50" : "bg-green-50"
      )}>
        {feedback.source === "voice" ? (
          <Phone className="h-3.5 w-3.5 text-blue-600" />
        ) : (
          <MessageCircle className="h-3.5 w-3.5 text-green-600" />
        )}
      </div>

      {/* Customer Info */}
      <div className="w-[130px] shrink-0">
        <div className="text-[12px] font-semibold text-foreground truncate">{feedback.customerName}</div>
        <div className="text-[10px] text-muted-foreground truncate">{feedback.businessName}</div>
      </div>

      {/* Feedback Preview */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-600 truncate">"{feedback.feedback}"</p>
      </div>

      {/* Overall Score - prominent */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="hidden md:flex items-end gap-[3px] group/bars relative">
          {feedback.ratings.map((r) => (
            <div
              key={r.shortName}
              className="w-[5px] rounded-sm bg-slate-300"
              style={{ height: `${r.score * 2.5}px` }}
              title={`${r.shortName}: ${r.score.toFixed(1)}`}
            />
          ))}
          <div className="absolute top-full mt-2 right-0 hidden group-hover/bars:block bg-foreground text-background text-[10px] rounded-lg px-3 py-2 shadow-lg whitespace-nowrap z-10">
            <div className="flex gap-3">
              {feedback.ratings.map((r) => (
                <div key={r.shortName} className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] opacity-70">{r.shortName}</span>
                  <span className="font-bold">{r.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ScoreBadge score={feedback.overallScore} />
      </div>

      {/* Time */}
      <div className="w-[60px] shrink-0 text-[10px] text-muted-foreground text-right">
        {feedback.date}
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
    </div>
  )
}

export function FeedbackList() {
  const [sourceFilter, setSourceFilter] = useState<"all" | "voice" | "whatsapp">("all")
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "mid" | "low">("all")
  const [dsrFilter, setDsrFilter] = useState("All DSRs")
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  const filteredFeedback = feedbackData.filter((f) => {
    if (sourceFilter !== "all" && f.source !== sourceFilter) return false
    if (sentimentFilter !== "all" && f.sentiment !== sentimentFilter) return false
    if (dsrFilter !== "All DSRs" && f.dsr !== dsrFilter) return false
    if (scoreFilter === "high" && f.overallScore < 8) return false
    if (scoreFilter === "mid" && (f.overallScore < 6 || f.overallScore >= 8)) return false
    if (scoreFilter === "low" && f.overallScore >= 6) return false
    return true
  })

  const activeFilterCount = [
    sourceFilter !== "all",
    scoreFilter !== "all",
    dsrFilter !== "All DSRs",
    sentimentFilter !== "all",
  ].filter(Boolean).length

  return (
    <>
      <div className="bg-white border border-border/60 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg border border-border/40">
                <MessageCircle className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-foreground">Customer Pulse</h3>
                <p className="text-[11px] text-muted-foreground">Click to view detailed analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Source Toggle */}
              <div className="flex items-center bg-muted/50 rounded-md p-0.5">
                {[
                  { label: "All", value: "all" },
                  { label: "Voice", value: "voice" },
                  { label: "WhatsApp", value: "whatsapp" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSourceFilter(f.value as typeof sourceFilter)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-medium rounded transition-all",
                      sourceFilter === f.value
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  showFilters || activeFilterCount > 0
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 bg-background/20 rounded text-[9px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="px-4 py-3 bg-slate-50/80 border-b border-border/40 flex flex-wrap items-center gap-3">
            {/* Score Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Score:</span>
              <div className="flex items-center bg-white rounded-md p-0.5 border border-border/40">
                {[
                  { label: "All", value: "all" },
                  { label: "8+", value: "high" },
                  { label: "6-8", value: "mid" },
                  { label: "<6", value: "low" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setScoreFilter(f.value as typeof scoreFilter)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-medium rounded transition-all",
                      scoreFilter === f.value
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Sentiment:</span>
              <div className="flex items-center bg-white rounded-md p-0.5 border border-border/40">
                {[
                  { label: "All", value: "all" },
                  { label: "Positive", value: "positive" },
                  { label: "Neutral", value: "neutral" },
                  { label: "Negative", value: "negative" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSentimentFilter(f.value as typeof sentimentFilter)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-medium rounded transition-all",
                      sentimentFilter === f.value
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DSR Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">DSR:</span>
              <select
                value={dsrFilter}
                onChange={(e) => setDsrFilter(e.target.value)}
                className="px-2 py-1 text-[10px] font-medium bg-white border border-border/40 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10"
              >
                {dsrOptions.map((dsr) => (
                  <option key={dsr} value={dsr}>{dsr}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setScoreFilter("all")
                  setSentimentFilter("all")
                  setDsrFilter("All DSRs")
                }}
                className="text-[10px] font-medium text-red-600 hover:text-red-700 transition-colors ml-auto"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Column Headers */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 text-[10px] font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">
          <div className="w-[26px]"></div>
          <div className="w-[130px]">Customer</div>
          <div className="flex-1">Feedback</div>
          <div className="w-[120px] text-right">Score</div>
          <div className="w-[60px] text-right">Time</div>
          <div className="w-[16px]"></div>
        </div>

        {/* Feedback List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((feedback) => (
              <FeedbackRow
                key={feedback.id}
                feedback={feedback}
                onClick={() => setSelectedFeedback(feedback)}
              />
            ))
          ) : (
            <div className="py-8 text-center text-[12px] text-muted-foreground">
              No feedback matching filters
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50/50 border-t border-border/40 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {filteredFeedback.length} of {feedbackData.length} entries
          </span>
          <button className="text-[10px] font-medium text-foreground hover:text-foreground/80 transition-colors flex items-center gap-1">
            View all
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </>
  )
}
