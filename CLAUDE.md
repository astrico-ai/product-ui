# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-domain intelligent chat interface application built with React and Vite. The application provides AI-powered chat capabilities with data visualization across three main verticals: Marketing, Insurance, and Mining. Each vertical has its own dedicated chat, dashboard, and data source management.

## Commands

### Development
```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Architecture

### Application Structure

The app uses a **multi-vertical architecture** where different business domains (Marketing, Insurance, Mining) share common components but have separate routing and page hierarchies:

```
src/
├── pages/           # Route pages organized by vertical
├── components/      # Shared and specialized components
├── modules/         # Feature modules (e.g., rewards system)
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── data/            # Static data files
├── config/          # Configuration files
└── lib/             # Core libraries and helpers
```

### Routing Architecture

The application uses **React Router** with vertical-specific route prefixes:

- **General routes**: `/`, `/chat`, `/training`, `/dashboard`, `/sources`, `/rewards`
- **Marketing routes**: `/marketing`, `/chat/marketing`, `/marketing/dashboard`, `/marketing/sources`
- **Insurance routes**: `/insurance`, `/chat/insurance`, `/insurance/dashboard`, `/insurance/sources`
- **Mining routes**: `/mining`, `/chat/mining`, `/mining/dashboard`, `/mining/sources`

Each vertical has its own navigation context defined in `MainLayout.jsx` that switches between vertical-specific nav items.

### State Management

- **Local State**: React hooks (useState, useEffect) for component-level state
- **URL State**: React Router for navigation and route parameters
- **LocalStorage**: Dashboard configurations stored via `src/utils/dashboardStorage.js`
- **Custom Hooks**: Business logic abstraction (see `src/hooks/`)

### Key Components

**MainLayout.jsx**: Layout wrapper that provides vertical-aware navigation. It dynamically switches between mainNavItems, marketingNavItems, insuranceNavItems, and miningNavItems based on the current route.

**ChatPage.jsx**: Main chat interface with typewriter effect, loading steps, follow-up suggestions, and inline data visualizations. Contains hardcoded responses for specific queries (e.g., Hindi truck queries).

**DataVisualization.jsx**: Generic component for displaying tables and graphs. Used across different verticals for CAC, insurance metrics, and mining data.

**LoadingSteps.jsx**: Shows multi-step loading progress with animations during query processing.

**TypewriterText.jsx**: Animated text component that simulates typing effect for AI responses.

### Dashboard System

Dashboards are managed through a localStorage-based CRUD system (`src/utils/dashboardStorage.js`):

- `createDashboard(data)` - Creates new dashboard with default widgets
- `updateDashboard(id, data)` - Updates dashboard metadata
- `updateDashboardWidgets(dashboardId, widgets)` - Updates widget configuration
- `getDashboard(id)` - Retrieves dashboard by ID
- `listDashboards()` - Lists all dashboards

**Widget Types**: kpi, line, bar, pie, table, scatter, bubble, heatmap

Widgets have a `position` property for ordering and are automatically sorted on retrieval.

### Styling System

**UI Framework**: Shadcn/ui components with Radix UI primitives
**Styling**: Tailwind CSS with custom design tokens
**Path Alias**: `@/` maps to `src/`

The project follows a comprehensive style guide documented in `STYLE_GUIDE.md`. Key patterns:

- **Component colors**: Use HSL CSS variables for theme colors
- **Font sizes**: Base text is 14px (`text-[14px]`)
- **Spacing**: Consistent padding/margin using Tailwind utilities
- **Pills**: Dimension pills use `#DEE8FA`, Measure pills use `#E0F8EF`

### Internationalization

The chat interface supports **multilingual responses**, particularly Hindi. Hardcoded Hindi query handling exists in `ChatPage.jsx` with pre-defined loading steps and responses for specific queries like truck comparisons.

### Data Visualization

The app uses multiple charting libraries:

- **Recharts**: Primary library for most charts
- **ECharts**: Used for advanced visualizations
- **ApexCharts**: Alternative charting library
- **Chart.js**: React wrapper available

Charts are displayed inline in chat responses and can be pinned to dashboards.

## Development Guidelines

### Adding New Pages

1. Create page component in `src/pages/[VerticalName]Page.jsx`
2. Add route in `src/App.jsx` under appropriate vertical section
3. Add navigation item in `src/components/MainLayout.jsx` under the vertical's nav array
4. Wrap with `<MainLayout>` component if you need navigation

### Working with Chat Interfaces

Chat pages follow this pattern:
- Messages array with `{ id, text, sender, [optional visualization props] }`
- Loading states with step progression
- Typewriter text for assistant responses
- Follow-up question suggestions
- Feedback mechanism (thumbs up/down)

### Working with Visualizations

To add data visualization to chat responses:
1. Include visualization config in message object
2. Use `DataVisualization` component with appropriate props
3. Provide `tableData`, `tableColumns`, and chart configuration

### Creating Modals

Follow the modal structure from `STYLE_GUIDE.md`:
- Use Dialog component from `@/components/ui/dialog`
- Structure: Header (p-6) → Content (p-6) → Footer (p-6 bg-gray-50)
- Max width: 600px for standard modals

### Custom Hooks

Located in `src/hooks/`:
- `useAuth.jsx` - Authentication state
- `useLocalStorage.jsx` - LocalStorage wrapper
- `useDebounce.jsx` - Debounce utility
- `useMediaQuery.jsx` - Responsive breakpoints
- `useToast.js` - Toast notifications

## Important Patterns

### Path Aliases

Import using `@/` prefix for src directory:
```jsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Component Organization

Components are structured as:
1. Imports
2. State declarations
3. Effects
4. Event handlers
5. Render helpers
6. Return JSX

### Styling Conventions

- Use Tailwind utility classes
- Extract common patterns to variables when repeated
- Follow spacing/color guidelines from STYLE_GUIDE.md
- Use `cn()` utility from `@/lib/utils` for conditional classes

### Error Handling

- ErrorBoundary component exists for React error catching
- Toast notifications for user feedback
- Inline validation for forms

## Testing & Linting

ESLint configuration:
- React 18.2 settings
- Prop types disabled (TypeScript/JSDoc preferred)
- React refresh plugin for HMR
- React-in-jsx-scope disabled (React 17+ JSX transform)
