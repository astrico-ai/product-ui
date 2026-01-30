# Voice of Customer (VOC) Dashboard

This is a standalone Voice of Customer analytics application integrated into the main Product UI as an iframe.

## Features

- **Trending Concerns**: Track top customer concerns with revenue impact analysis
- **Customer Feedback**: Real-time feedback tracking and sentiment analysis
- **Insights Board**: AI-powered insights from customer data
- **Sentiment Charts**: Visual representation of customer sentiment across channels
- **Issues Tracking**: Comprehensive issue tracking with severity levels
- **Revenue Risk Analysis**: Identify revenue at risk from customer concerns
- **Key Metrics**: Performance KPIs and team metrics

## Development

### Running Standalone
```bash
cd voc
npm install
npm run dev
```
The app will run on `http://localhost:5174`

### Running from Main App
From the main product-ui directory:

```bash
# Run both apps together
npm run dev:all

# Or run separately in different terminals:
# Terminal 1 - Main app
npm run dev

# Terminal 2 - VOC app
npm run dev:voc
```

## Integration

The VOC app is integrated into the main Product UI at the `/voc` route using an iframe. The main app expects the VOC app to be running on port 5174.

### Navigation
Access the VOC dashboard through:
- Main navigation sidebar: "Voice of Customer" menu item
- Direct URL: `http://localhost:5173/voc`

## Build

```bash
# Build VOC app only
npm run build

# Build from main app (builds both)
cd ..
npm run build
```

## Technology Stack

- **React 19.2**
- **TypeScript**
- **Vite 7.2**
- **Tailwind CSS 4.1**
- **Recharts 3.7** - Data visualization
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

## Project Structure

```
voc/
├── src/
│   ├── components/      # React components
│   │   ├── ConcernStoryboard.tsx
│   │   ├── FeedbackList.tsx
│   │   ├── InsightsBoard.tsx
│   │   ├── IssuesList.tsx
│   │   ├── MetricsBar.tsx
│   │   ├── RevenueRisk.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SentimentCharts.tsx
│   │   ├── TrendingConcerns.tsx
│   │   └── ui/          # Base UI components
│   ├── data/
│   │   └── mockData.ts  # Mock data for development
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── App.tsx          # Main application
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── package.json
└── vite.config.ts
```

## Pages

1. **Home**: Dashboard overview with trending concerns, feedback, and insights
2. **Concerns**: Detailed concern analysis with revenue impact
3. **Key Metrics**: Performance overview and KPIs
4. **Revenue Risk**: Revenue threats from customer issues
5. **Channels**: Channel-specific analytics (Coming soon)
6. **Work**: Task management (Coming soon)
7. **History**: Historical data and trends (Coming soon)
8. **Analytics**: Advanced analytics (Coming soon)

## Mock Data

The application currently uses mock data defined in `src/data/mockData.ts`. This includes:
- 15+ customer issues with trends and severity levels
- Sentiment data across distribution channels
- Chat response templates

For production, replace mock data with actual API calls to your backend.
