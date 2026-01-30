export interface Issue {
  id: number
  title: string
  category: string
  count: number
  trend: string
  trendDir: "up" | "down"
  severity: "critical" | "high" | "medium" | "low"
}

export const issuesData: Issue[] = [
  {
    id: 1,
    title: "Delayed delivery times",
    category: "Logistics",
    count: 423,
    trend: "+12%",
    trendDir: "up",
    severity: "critical",
  },
  {
    id: 2,
    title: "Product packaging damaged",
    category: "Quality",
    count: 387,
    trend: "+8%",
    trendDir: "up",
    severity: "high",
  },
  {
    id: 3,
    title: "Incorrect order items received",
    category: "Fulfillment",
    count: 312,
    trend: "-5%",
    trendDir: "down",
    severity: "high",
  },
  {
    id: 4,
    title: "Poor customer service response",
    category: "Support",
    count: 289,
    trend: "+3%",
    trendDir: "up",
    severity: "medium",
  },
  {
    id: 5,
    title: "Product quality not as expected",
    category: "Quality",
    count: 256,
    trend: "-2%",
    trendDir: "down",
    severity: "high",
  },
  {
    id: 6,
    title: "Difficulty tracking orders",
    category: "Technology",
    count: 234,
    trend: "+15%",
    trendDir: "up",
    severity: "medium",
  },
  {
    id: 7,
    title: "Return process too complicated",
    category: "Process",
    count: 198,
    trend: "-8%",
    trendDir: "down",
    severity: "medium",
  },
  {
    id: 8,
    title: "Pricing inconsistencies across channels",
    category: "Pricing",
    count: 176,
    trend: "+6%",
    trendDir: "up",
    severity: "high",
  },
  {
    id: 9,
    title: "Out of stock items not communicated",
    category: "Inventory",
    count: 154,
    trend: "+22%",
    trendDir: "up",
    severity: "critical",
  },
  {
    id: 10,
    title: "Invoice errors and discrepancies",
    category: "Billing",
    count: 143,
    trend: "-4%",
    trendDir: "down",
    severity: "medium",
  },
  {
    id: 11,
    title: "Lack of product information",
    category: "Content",
    count: 128,
    trend: "+1%",
    trendDir: "up",
    severity: "low",
  },
  {
    id: 12,
    title: "Distributor communication gaps",
    category: "Communication",
    count: 112,
    trend: "-11%",
    trendDir: "down",
    severity: "medium",
  },
  {
    id: 13,
    title: "Mobile app crashes frequently",
    category: "Technology",
    count: 98,
    trend: "+18%",
    trendDir: "up",
    severity: "high",
  },
  {
    id: 14,
    title: "Warranty claims not honored",
    category: "Support",
    count: 87,
    trend: "-3%",
    trendDir: "down",
    severity: "critical",
  },
  {
    id: 15,
    title: "Promotional offers not applied",
    category: "Pricing",
    count: 76,
    trend: "+9%",
    trendDir: "up",
    severity: "low",
  },
]

export const sentimentData = {
  overall: [
    { name: "Positive", value: 45, color: "#10b981" },
    { name: "Neutral", value: 32, color: "#6b7280" },
    { name: "Negative", value: 23, color: "#ef4444" },
  ],
  distribution: [
    { name: "Primary", value: 52, color: "#6366f1" },
    { name: "Secondary", value: 41, color: "#8b5cf6" },
    { name: "Retail", value: 38, color: "#ec4899" },
  ],
  trend: [
    { name: "Improving", value: 38, color: "#22c55e" },
    { name: "Stable", value: 45, color: "#3b82f6" },
    { name: "Declining", value: 17, color: "#f97316" },
  ],
}

export const chatResponses: Record<string, string> = {
  sentiment:
    "Based on current data, overall customer sentiment is **45% positive**, **32% neutral**, and **23% negative**. Primary distributors show the highest satisfaction at 52% positive, while secondary channels are at 41%. The trend has improved by 3% over the last 30 days.",
  issues:
    "The **top 3 issues** are:\n1. Delayed delivery times (423 reports, +12% trend)\n2. Product packaging damaged (387 reports)\n3. Incorrect order items (312 reports)\n\nLogistics and Quality categories dominate the complaints.",
  trends:
    "**Key trends this month:**\n- Delivery complaints up 12%\n- Return process issues down 8%\n- Technology-related issues (app crashes, order tracking) rising fastest at +15-18%\n- Overall complaint volume down 2% month-over-month",
  distributors:
    "**Distributor Performance:**\n- Primary distributors: 52% positive sentiment, main issues around inventory communication\n- Secondary distributors: 41% positive, primarily concerned with pricing inconsistencies\n- Retail partners: 38% positive, focused on delivery timing",
  default:
    "I can help you analyze customer sentiment, track issues, identify trends, or dive into specific distributor feedback. Try asking about:\n- \"sentiment overview\"\n- \"top issues\"\n- \"monthly trends\"\n- \"distributor performance\"",
}
