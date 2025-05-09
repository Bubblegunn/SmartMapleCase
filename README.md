# Smart Mapple - Calendar Scheduler App

## 📝 Project Overview

This project is an advanced calendar scheduler application that allows efficient staff scheduling and management with powerful visualizations and user-friendly interfaces. The application includes features like drag-and-drop event management, pair highlighting, and responsive design for both desktop and mobile devices.

## 🌟 Completed Requirements

1. **ProfileCard Role Display Fix**
   - Fixed role display when user profile is not yet loaded
   - Implemented fallback to localStorage for role information
   - Added proper error handling to prevent application crashes

2. **Calendar Initial Date Navigation**
   - Calendar now starts at the first event date instead of current month
   - Added event detail popup showing staff name, shift name, date, and times
   - Fixed navigation for optimal user experience

3. **Staff-Based Event Filtering**
   - Implemented filtering to show only selected staff's events
   - Optimized filtering mechanism for better performance
   - Added smooth transitions when switching between staff members

4. **Pair Day Highlighting**
   - Fixed the pair day highlighting to only mark relevant days
   - Implemented color-coded highlighting based on the paired staff member
   - Optimized the pair calculation algorithm for better performance

5. **Drag and Drop Event Management**
   - Implemented Option 2: Enhanced drag-and-drop with state persistence
   - Updated Redux store and localStorage when events are moved
   - Added visual feedback during drag operations

6. **Design & UI Improvements**
   - Created a modern, responsive design that works on all devices
   - Implemented smooth animations and transitions
   - Enhanced overall user experience with intuitive navigation
   - Fixed layout alignment between profile and calendar components

## 🚀 Technical Implementation

### 1. Performance Optimization Techniques

```jsx
// Memoization to prevent unnecessary re-renders
const CalendarCell = React.memo(({ dayNumber, isToday, highlightClass, tooltipTitle, borderColor }) => {
  // Component logic
});

// useMemo for expensive calculations
const pairHighlightedDays = useMemo(() => {
  // Pair calculation logic
}, [schedule, selectedStaffId]);

// useCallback for stable function references
const renderDayCellContent = useCallback((arg) => {
  // Rendering logic
}, [dependencies]);
2. Redux State Management
// Event update action in the reducer
[types.UPDATE_EVENT_SUCCESS]: (state, { payload }) => {
  const { eventId, newStartDate, newEndDate } = payload;
  const updatedSchedule = { ...state.schedule };
  
  if (updatedSchedule.assignments) {
    updatedSchedule.assignments = updatedSchedule.assignments.map(assignment => {
      if (assignment.id === eventId) {
        return {
          ...assignment,
          shiftStart: newStartDate,  // Correct field names
          shiftEnd: newEndDate,
          isUpdated: true
        };
      }
      return assignment;
    });
  }
  
  return {
    ...state,
    loading: false,
    errors: {},
    schedule: updatedSchedule,
  };
}
3. Responsive Design Implementation
css
CopyInsert
/* Mobile-first approach with responsive breakpoints */
@media (max-width: 991px) {
  .right-column {
    width: 100%;
    height: calc(100vh - 64px);
    overflow-y: auto;
    display: block !important; /* Ensure calendar visibility on mobile */
  }
  
  /* Mobile information bar */
  .mobile-calendar-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--card-bg-color);
    padding: 12px 16px;
    margin: 10px 0 15px 0;
  }
}
📦 Installation and Setup

npm install --legacy-peer-deps
npm run dev

🗃️ Project Structure
src/components/Calendar - Calendar component with event handling
src/components/Profile - User profile component
src/components/ProfileCalendar - Main container component
src/store - Redux store with actions and reducers
src/models - TypeScript interfaces and models
src/utils - Helper functions and utilities
