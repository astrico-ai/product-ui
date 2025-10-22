# Product UI Style Guide

## Design System Overview

### Colors
- **Primary Blue**: Used for active states, primary actions, and links
  - Primary: `#3B82F6` (blue-500)
  - Hover: `#2563EB` (blue-600)
  - Light: `#EFF6FF` (blue-50)

- **Semantic Colors**
  - Dimension Pills: `#DEE8FA` (background), Border color matches text
  - Measure Pills: `#E0F8EF` (background), Border color matches text
  - Success: `#22C55E` (green-500)
  - Error: `#EF4444` (red-500)
  - Warning: `#F59E0B` (amber-500)

### Typography
- **Font Family**: System default (Inter or system-ui)
- **Font Sizes**:
  - Base Text: 14px (`text-[14px]`)
  - Headers: 
    - Modal Titles: 20px (`text-xl`)
    - Section Headers: 16px (`text-base`)
  - Labels: 14px (`text-sm`)
  - Helper Text: 12px (`text-xs`)

### Spacing
- **Padding**:
  - Modal Content: `p-6`
  - Section Spacing: `space-y-6`
  - Input Fields: `px-4 py-2`
  - Buttons: `px-4 py-2`
  - Cards: `p-4`

- **Margins**:
  - Between Sections: `mb-8`
  - Between Form Elements: `space-y-4`
  - Between Related Items: `gap-3`

### Borders & Shadows
- **Borders**:
  - Default: `border border-gray-200`
  - Focus: `ring-2 ring-blue-500`
  - Dividers: `border-t border-gray-200`

- **Border Radius**:
  - Buttons & Inputs: `rounded-md`
  - Pills & Tags: `rounded-full`
  - Modals: `rounded-lg`

- **Shadows**:
  - Modals: `shadow-lg`
  - Dropdowns: `shadow-md`
  - Cards: `shadow-sm`

## Components

### Buttons
```jsx
// Primary Button
<Button className="bg-blue-600 text-white hover:bg-blue-700">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline" className="border-gray-300 text-gray-700">
  Secondary Action
</Button>
```

### Input Fields
```jsx
<Input 
  className="w-full px-4 py-2 text-[14px] border-gray-300 rounded-md
  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Enter value..."
/>
```

### Pills
```jsx
// Dimension Pill
<div className="bg-[#DEE8FA] text-blue-700 px-3 py-1 rounded-full
  flex items-center gap-2 text-[14px]">
  <span>Dimension</span>
  <ChevronDown className="w-4 h-4" />
</div>

// Measure Pill
<div className="bg-[#E0F8EF] text-green-700 px-3 py-1 rounded-full
  flex items-center gap-2 text-[14px]">
  <span>Measure</span>
  <ChevronDown className="w-4 h-4" />
</div>
```

### Modals
```jsx
<Dialog>
  <DialogContent className="sm:max-w-[600px] p-0">
    {/* Header */}
    <div className="p-6 border-b border-gray-200">
      <DialogTitle className="text-xl font-semibold">Modal Title</DialogTitle>
    </div>
    
    {/* Content */}
    <div className="p-6">
      {/* Content goes here */}
    </div>
    
    {/* Footer */}
    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Dropdowns
```jsx
<Select>
  <SelectTrigger className="w-[200px] h-9">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Layout Patterns

### Chart Builder Layout
```jsx
<div className="flex h-full">
  {/* Left Panel - Fields */}
  <div className="w-64 border-r border-gray-200 p-4">
    {/* Fields content */}
  </div>

  {/* Main Content - Chart Area */}
  <div className="flex-1 flex flex-col">
    <div className="flex-1 p-4">
      {/* Chart content */}
    </div>
  </div>

  {/* Right Panel - Settings */}
  <div className="w-80 border-l border-gray-200">
    {/* Settings content */}
  </div>
</div>
```

### Dashboard Layout
```jsx
<div className="grid grid-cols-12 gap-4 p-4">
  {/* Full Width Widget */}
  <div className="col-span-12">
    {/* Widget content */}
  </div>

  {/* Half Width Widgets */}
  <div className="col-span-6">
    {/* Widget content */}
  </div>
  <div className="col-span-6">
    {/* Widget content */}
  </div>
</div>
```

## UI/UX Guidelines

### Interactions
1. **Hover States**:
   - Buttons: Slightly darker background
   - Interactive elements: Show cursor pointer
   - Pills: Only highlight the pill, not the entire button area

2. **Focus States**:
   - Use blue ring outline
   - Ensure keyboard navigation works
   - Maintain high contrast for accessibility

3. **Loading States**:
   - Use skeleton loaders for content
   - Show spinner for actions
   - Disable interactive elements while loading

### Modal Guidelines
1. **Structure**:
   - Clear header with title
   - Content with appropriate spacing
   - Footer with action buttons
   - Max width of 600px for standard modals

2. **Behavior**:
   - Close on escape key
   - Close on overlay click
   - Trap focus within modal
   - Animate in/out smoothly

### Form Guidelines
1. **Layout**:
   - Labels above inputs
   - Helper text below inputs
   - Required fields marked with asterisk
   - Group related fields
   - Align labels and inputs consistently

2. **Validation**:
   - Show errors inline
   - Validate on blur or submit
   - Clear error when user starts typing
   - Show success states where appropriate

### Chart Guidelines
1. **Layout**:
   - Remove chart title from ECharts
   - X-axis labels below axis
   - Y-axis labels slanted
   - Legend position configurable
   - Gridlines optional

2. **Colors**:
   - Use consistent color scheme
   - Ensure sufficient contrast
   - Support dark/light themes
   - Use semantic colors for data types

### Accessibility Guidelines
1. **Color Usage**:
   - Maintain WCAG 2.1 contrast ratios
   - Don't rely solely on color for information
   - Provide alternative text for icons

2. **Keyboard Navigation**:
   - All interactive elements focusable
   - Logical tab order
   - Visible focus indicators
   - Keyboard shortcuts where appropriate

3. **Screen Readers**:
   - Proper ARIA labels
   - Meaningful alt text
   - Announce dynamic content changes
   - Proper heading hierarchy

## Best Practices

### Code Organization
1. **Component Structure**:
   ```jsx
   // Component.jsx
   import { useState, useEffect } from 'react';
   import { ComponentProps } from './types';
   
   export default function Component({ prop1, prop2 }: ComponentProps) {
     // State
     const [state, setState] = useState();
     
     // Effects
     useEffect(() => {
       // Side effects
     }, [dependencies]);
     
     // Handlers
     const handleAction = () => {
       // Handle action
     };
     
     // Render helpers
     const renderSection = () => {
       return (
         // JSX
       );
     };
     
     return (
       // Main JSX
     );
   }
   ```

2. **Styling Organization**:
   ```jsx
   // Common patterns
   const commonStyles = {
     container: "flex flex-col h-full",
     header: "flex items-center justify-between p-4",
     content: "flex-1 overflow-y-auto p-4",
     footer: "flex justify-end gap-3 p-4 bg-gray-50"
   };
   ```

### Performance Considerations
1. **Component Optimization**:
   - Use memo for expensive renders
   - Debounce frequent updates
   - Virtualize long lists
   - Lazy load components

2. **State Management**:
   - Keep state close to where it's used
   - Use context sparingly
   - Batch state updates
   - Normalize complex data structures

### Error Handling
1. **User Feedback**:
   - Show toast messages for actions
   - Display inline validation errors
   - Provide recovery options
   - Use clear error messages

2. **Error Boundaries**:
   - Implement at appropriate levels
   - Show fallback UI
   - Log errors for debugging
   - Provide retry mechanisms

## Version Control Guidelines
1. **Commit Messages**:
   - Use conventional commits
   - Include ticket references
   - Keep messages clear and concise
   - Separate concerns

2. **Branch Strategy**:
   - Feature branches from main
   - Use semantic branch names
   - Regular rebasing
   - Clean commit history

