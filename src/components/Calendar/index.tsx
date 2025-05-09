import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from 'react-redux';
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core/index.js";
import type { DayCellContentArg } from "@fullcalendar/core";
import dayjs from "dayjs";
import "../profileCalendar.scss";

// Import custom components and hooks
import EventModal from './components/EventModal';
import CalendarCell from './components/CalendarCell';
import { findFirstEventDate, getStaffById } from './utils/calendarHelpers';
import useCalendarEvents from './hooks/useCalendarEvents';
import { updateEvent } from '../../store/schedule/actions';

// Hooks and components are exported from separate files to avoid Fast Refresh issues

interface CalendarContainerProps {
  schedule: ScheduleInstance;
  user: UserInstance;
  userId: string;
  hideStaffs?: boolean;
  selectedStaffId?: string | null;
}

/**
 * Calendar container component - displays a calendar with events
 * based on the schedule data. Supports staff filtering and event details.
 */
const CalendarContainer: React.FC<CalendarContainerProps> = ({
  schedule,
  userId,
  hideStaffs = false,
  selectedStaffId,
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useDispatch(); // Redux dispatch hook
  
  // Use internal state only when not provided from parent
  const [internalStaffId, setInternalStaffId] = useState<string | null>(
    hideStaffs ? userId : null
  );
  
  // Use either the prop from parent or internal state
  const effectiveStaffId = selectedStaffId || internalStaffId;
  
  // Use state to store the earliest event date
  const [earliestEventDate, setEarliestEventDate] = useState<Date | null>(null);
  
  // Etkinlik sürükleme işlemini yönetecek callback fonksiyonu
  const handleEventDrop = useCallback((eventDropInfo: EventDropArg) => {
    try {
      // Etkinlik bilgilerini al
      const { event } = eventDropInfo;
      const eventId = event.id;
      const newStartDate = event.start ? dayjs(event.start).format('YYYY-MM-DD') : '';
      
      // Etkinliğin bitiş tarihini hesapla (başlangıçtan sonraki gün)
      // ISO formatlı tarihi YYYY-MM-DD formatına dönüştür
      const newEndDate = event.end ? 
        dayjs(event.end).format('YYYY-MM-DD') : 
        dayjs(newStartDate).add(1, 'day').format('YYYY-MM-DD');
      
      if (!eventId || !newStartDate || !newEndDate) {
        console.error('Event drop işlemi için gerekli bilgiler eksik:', { eventId, newStartDate, newEndDate });
        return;
      }
      
      // Mevcut eventId için daha önce bir güncelleme işlemi yapılıp yapılmadığını kontrol et
      // Bu optimizasyon, aynı event için tekrarlı güncellemeleri önleyecek
      const lastEventKey = `last_updated_${eventId}`;
      const lastUpdate = sessionStorage.getItem(lastEventKey);
      const newUpdateData = `${newStartDate}|${newEndDate}`;
      
      if (lastUpdate === newUpdateData) {
        console.log('Bu etkinlik zaten aynı tarihlere güncellendi, tekrar işlem yapılmıyor');
        return;
      }
      
      // Bu güncellemeyi sessionStorage'a kaydet
      sessionStorage.setItem(lastEventKey, newUpdateData);
      
      console.log('Etkinlik taşındı:', {
        eventId,
        newStartDate,
        newEndDate,
        event: event
      });
      
      // Redux action ile etkinliği güncelle
      const updateEventAction = updateEvent({
        eventId,
        newStartDate,
        newEndDate
      });
      
      // TypeScript uyumluluğu için tip bilgisini ekleyerek dispatch et
      dispatch(updateEventAction as unknown as { type: string });
      
    } catch (error) {
      console.error('Etkinlik sürükleme işleminde hata:', error);
    }
  }, [dispatch]);

  // Find the earliest event date when the schedule loads
  useEffect(() => {
    if (!schedule) return;
    
    // Find the earliest date from all assignments (using the helper function)
    const firstEventDate = findFirstEventDate(schedule);
    console.log('Found earliest event date:', firstEventDate);
    
    // Update our state with the earliest date
    setEarliestEventDate(firstEventDate);
  }, [schedule]);

  // Navigate to the earliest event date after calendar is initialized
  useEffect(() => {
    if (!calendarRef.current || !earliestEventDate) return;
    
    // Give the calendar time to initialize
    const navigateCalendar = setTimeout(() => {
      if (!calendarRef.current) return;
      
      // Navigate to the earliest event date
      console.log('Navigating calendar to:', earliestEventDate);
      calendarRef.current.getApi().gotoDate(earliestEventDate);
    }, 100); // Short delay to ensure calendar is ready
    
    return () => clearTimeout(navigateCalendar);
  }, [earliestEventDate]);

  
  // Event modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  
  // Use our custom hook to manage calendar events, highlighted dates, and pair days
  const { events, highlightedDates, getPairHighlightedDays } = useCalendarEvents(schedule, effectiveStaffId);
  
  // Debug logs for calendar component
  console.log('Calendar component - Props:', { scheduleId: schedule?.scheduleId, userId, effectiveStaffId });
  console.log('Calendar component - Events:', events);
  
  // Force a re-render when effectiveStaffId changes to ensure events update
  useEffect(() => {
    console.log('Calendar component - Staff selection changed to:', effectiveStaffId);
    // This is just to log the change, the useCalendarEvents hook should handle the filtering
  }, [effectiveStaffId]);
  
  // Define plugins for the calendar
  const calendarPlugins = [dayGridPlugin, interactionPlugin];
  
  // Staff selection is now handled in the parent component
  
  // Function to handle event click - show modal with details
  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info);
    setShowModal(true);
  };
  
  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Find the first event date and set the calendar's initial date - removed duplicate effect
  // This effect is already handled at the top of the component
  useEffect(() => {
    if (schedule && !effectiveStaffId && schedule.staffs && schedule.staffs.length > 0) {
      // If we're using internal state, we can update it
      setInternalStaffId(schedule.staffs[0].id);
    }
  }, [schedule, effectiveStaffId, setInternalStaffId]);

  // Hash fonksiyonu, renk atama için - useCallback ile optimize edildi
  const getUniqueColorIndex = useCallback((id: string) => {
    // Basit string hash fonksiyonu
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0; // 32-bit integer
    }
    // Pozitif bir sayı elde ediyoruz
    hash = Math.abs(hash);
    // 1-10 arası bir sayıya çeviriyoruz (renk indeksi için)
    return (hash % 10) + 1;
  }, []);

  // Sabit renk paleti - useMemo ile optimize edildi
  const staffColors = useMemo(() => ({
    '1': '#FF0000', // Bright Red
    '2': '#0000FF', // Pure Blue
    '3': '#00FF00', // Bright Green
    '4': '#FF00FF', // Magenta
    '5': '#FF9900', // Orange
    '6': '#FFFF00', // Yellow
    '7': '#00FFFF', // Cyan
    '8': '#9900FF', // Purple
    '9': '#FF6600', // Dark Orange
    '10': '#66FF00' // Lime
  }), []);

  // Gün hücresi içeriğini renderlamak için callback - gereksiz yeniden renderları önlemek için useCallback kullanıldı
  const renderDayCellContent = useCallback((arg: DayCellContentArg) => {
    const { date, dayNumberText, isToday } = arg;
    
    // Format date to match the format used in pair days calculation
    const dateStr = dayjs(date).format('DD-MM-YYYY');
    
    // Get all pair days for the selected staff - cached by useMemo in the hook
    const pairDays = getPairHighlightedDays();
    
    // Find if this date is a pair day and get its data if it is
    const pairDay = pairDays.find(pd => pd.date === dateStr);
    
    // Standard highlight class for events
    const highlightClass = highlightedDates.includes(dateStr) ? "highlighted" : "";
    
    // Pairday için varsayılan renk
    let pairBorderColor = '';
    
    if (pairDay) {
      try {
        // Bu tarih bir pair günü; staff ID'ye göre benzersiz bir renk seç
        const staffId = String(pairDay.staffId || '1');
        
        // Personele özel renk indeksini hesapla
        const colorIndex = getUniqueColorIndex(staffId);
        
        // Güvenli renk atama
        pairBorderColor = staffColors[colorIndex.toString() as keyof typeof staffColors] || staffColors['1'];
      } catch (error) {
        // Hata durumunda varsayılan renk
        console.error('Renk atama hatası:', error);
        pairBorderColor = '#FF0000';
      }
    }
    
    // Create a tooltip that shows paired staff name for better UX
    const pairTitle = pairDay ? `Paired with: ${pairDay.staffName}` : undefined;
    
    return (
      <CalendarCell
        dayNumber={dayNumberText}
        isToday={isToday}
        highlightClass={highlightClass}
        tooltipTitle={pairTitle}
        borderColor={pairBorderColor}
      />
    );
  }, [getPairHighlightedDays, highlightedDates, staffColors, getUniqueColorIndex]);
  
  // Custom renderer for event content with better visibility
  const renderEventContent = (eventInfo: { 
    event: { 
      title: string; 
      extendedProps?: { staffId?: string; shiftId?: string; isUpdated?: boolean }; 
      _def?: { extendedProps?: { staffId?: string; shiftId?: string; isUpdated?: boolean } }; 
      start?: Date 
    }; 
    timeText?: string 
  }) => {
    // Extract data from the event
    const event = eventInfo.event;
    const timeText = eventInfo.timeText || '';
    
    // Get staff name for the event - handle both extendedProps format or direct property
    const staffId = event.extendedProps?.staffId || event._def?.extendedProps?.staffId || '';
    const staff = staffId ? getStaffById(schedule, staffId) : null;
    const staffName = staff ? staff.name : '';
    
    // Get the event title
    const title = event.title || 'Unnamed Event';
    
    return (
      <div className="custom-event-content">
        <div className="event-time">{timeText}</div>
        <div className="event-title">{title}</div>
        <div className="event-staff">{staffName}</div>
      </div>
    );
  };
  
  // Return the main component JSX
  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        {/* Calendar component */}
        <div className="calendar">
          <div className="fullcalendar-container">
            <FullCalendar
              ref={calendarRef}
              height="100%"
              plugins={calendarPlugins}
              headerToolbar={{
                left: "title",
                center: "",
                right: "prev,next",
              }}
              initialView="dayGridMonth"
              // Start calendar from the earliest event date (or current date if no events)
              initialDate={earliestEventDate || new Date()}
              events={events}
              editable={true} // Etkinliklerin sürüklenebilir olmasını sağlar
              droppable={false} // Dışardan etkinlik sürüklenemez
              selectable={true}
              selectMirror={true}
              // Hide days from other months
              showNonCurrentDates={false}
              // Use dynamic week count based on month
              eventStartEditable={true} // Etkinlik başlangıç tarihinin sürüklenebilir olmasını sağlar
              eventDurationEditable={false} // Etkinlik süresi değiştirilemez
              // Sürükle-bırak işleminde Redux'a bildirim yapmak için
              eventDrop={handleEventDrop}
              eventClick={handleEventClick}
              dayCellContent={renderDayCellContent}
              eventContent={renderEventContent}
              contentHeight="auto"
              longPressDelay={0}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
                hour12: false,
              }}
              stickyHeaderDates={true}
              fixedWeekCount={false}
              handleWindowResize={true}
              dayMaxEvents={4} // Limit visible events per day
              dayMaxEventRows={4} // Show '+more' link after this many events
            />
          </div>
        </div>
      </div>
      
      {/* Event modal */}
      {showModal && selectedEvent && (
        <EventModal
          selectedEvent={selectedEvent}
          onClose={handleCloseModal}
          schedule={schedule}
        />
      )}
    </div>
  );
};

export default CalendarContainer;