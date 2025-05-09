import React from 'react';

interface CalendarCellProps {
  dayNumber: string;
  isToday?: boolean;
  highlightClass?: string;
  tooltipTitle?: string;
  borderColor?: string;  // Doğrudan renk değeri için (örn: '#e74c3c')
}

/**
 * Component to render custom calendar cell content with proper highlights
 * Wrapped in React.memo to prevent unnecessary renders
 */
const CalendarCell: React.FC<CalendarCellProps> = React.memo(({ 
  dayNumber, 
  isToday = false,
  highlightClass = '',
  tooltipTitle = '',
  borderColor = ''
}) => {
  // Force a boolean value to ensure consistency
  const isPairDay = Boolean(borderColor && borderColor !== '');

  // Force string for the color to prevent undefined/null
  const safeColor = borderColor || '';
  
  // Performans için logları kaldırdık
  // console.log('CalendarCell rendering', { 
  //   receivedBorderColor: borderColor, 
  //   safeColor,
  //   isPairDay, 
  //   dayNumber,
  //   tooltipTitle
  // });
  
  // Set more visible pair style - make it VERY obvious
  const pairStyle = isPairDay ? {
    // Force important to override any existing styles
    borderBottom: `5px solid ${safeColor} !important`,
    boxShadow: `0 3px 0 ${safeColor} !important`,
    fontWeight: 'bold',
    // Add background color tint for more visibility
    backgroundColor: `${safeColor}1A` // 10% opacity version of the color
  } : {};
  
  return (
    <div
      className={`calendar-cell ${
        isToday ? 'today' : ''
      } ${
        highlightClass
      } ${
        isPairDay ? 'pair-day' : ''
      }`}
      style={pairStyle}
      title={tooltipTitle || (isPairDay ? `Pair day` : undefined)}
    >
      {dayNumber}
    </div>
  );
});

export default CalendarCell;
