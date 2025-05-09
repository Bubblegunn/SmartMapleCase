import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import type { EventInput } from '@fullcalendar/core/index.js';
import type { ScheduleInstance } from '../../../models/schedule';
import { 
  getShiftById, 
  getAssignmentById, 
  getValidDates, 
  getDatesBetween,
  bgClasses 
} from '../utils/calendarHelpers';

// Define pair information structure - this is used within the component
export interface PairInfo {
  startDate: string;
  endDate: string;
  staffId?: string;
}

/**
 * Custom hook to manage calendar events and highlighted dates
 */
const useCalendarEvents = (schedule: ScheduleInstance | undefined, selectedStaffId: string | null) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);

  /**
   * Generate calendar events based on the selected staff
   */
  const generateStaffBasedCalendar = useCallback(() => {
    if (!schedule) return;
    
    const works: EventInput[] = [];

    // More detailed debug logs
    console.log('--- Calendar Debug Info ---');
    console.log('Generating calendar for staff ID:', selectedStaffId);
    console.log('Total assignments:', schedule?.assignments?.length || 0);
    console.log('Schedule staff members:', schedule?.staffs?.map(s => ({ id: s.id, name: s.name })));
    
    if (selectedStaffId) {
      console.log('Selected staff details:', schedule?.staffs?.find(s => s.id === selectedStaffId));
    }
    
    // Get first few assignments to check their structure
    const sampleAssignments = schedule?.assignments?.slice(0, 3) || [];
    console.log('Sample assignments:', sampleAssignments);
    
    // Filter assignments based on the selected staff
    const filteredAssignments = selectedStaffId
      ? schedule?.assignments?.filter(assignment => assignment.staffId === selectedStaffId)
      : schedule?.assignments || [];
      
    console.log('Filtered assignments for staff', selectedStaffId, ':', filteredAssignments);
    console.log('Filtered assignments count:', filteredAssignments.length);

    // Process filtered assignments to create events  
    for (let i = 0; i < filteredAssignments.length; i++) {
      const assignment = filteredAssignments[i];
      if (!assignment) continue;
      
      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === assignment.shiftId
      );

      // Parse assignmentDate correctly from UTC format
      const assignmentDate = dayjs.utc(assignment.shiftStart).format("YYYY-MM-DD");
      const isValidDate = getValidDates(schedule).includes(assignmentDate);
      
      // Create FullCalendar compatible event object
      const work = {
        id: assignment.id,
        title: getShiftById(schedule, assignment.shiftId)?.name || 'Unnamed Shift',
        start: assignment.shiftStart, // Use full ISO string for start time
        end: assignment.shiftEnd,     // Use full ISO string for end time
        allDay: false,               // Explicitly set as not all-day events
        extendedProps: {             // Store additional data as extended props
          staffId: assignment.staffId,
          shiftId: assignment.shiftId,
          isUpdated: getAssignmentById(schedule, assignment.id)?.isUpdated || false
        },
        className: `event ${bgClasses[className] || ''} ${
          getAssignmentById(schedule, assignment.id)?.isUpdated
            ? "highlight"
            : ""
        } ${!isValidDate ? "invalid-date" : ""}`
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    
    if (schedule?.scheduleStartDate && schedule?.scheduleEndDate) {
      const dates = getDatesBetween(
        dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
        dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
      );
      
      const highlightedDatesArray: string[] = [];
  
      dates.forEach((date) => {
        const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
        if (offDays?.includes(transformedDate)) highlightedDatesArray.push(date);
      });
  
      setHighlightedDates(highlightedDatesArray);
    }
    
    setEvents(works);
  }, [schedule, selectedStaffId]);

  // Run the event generator when schedule or selectedStaffId changes
  useEffect(() => {
    generateStaffBasedCalendar();
  }, [generateStaffBasedCalendar]);

  /**
   * Find pair highlighted days for the selected staff - looking at both direct and reverse relationships
   * Using useMemo instead of useCallback for better performance and to prevent unnecessary recalculations
   */
  const pairHighlightedDays = useMemo(() => {
    // En başta seçili personel yoksa boş dizi döndür
    if (!selectedStaffId || !schedule?.staffs) {
      return [];
    }
    
    // Get all pairs - supports both direct and reverse relationships
    const allPairDays: {date: string, color: string, staffId: string, staffName: string}[] = [];
    
    // SUPER VISIBLE COLORS - these will be impossible to miss - fixed colors array
    const STAFF_COLORS = [
      '#FF0000',  // Red - çok net kırmızı
      '#0000FF',  // Blue - parlak mavi
      '#00FF00',  // Green - parlak yeşil
      '#FF00FF',  // Magenta - mor
      '#FF9900',  // Orange - turuncu 
      '#FFFF00',  // Yellow - sarı
    ];
    
    // Direct mapping of staff IDs to colors - using color index
    const staffColorIndices: Record<string, number> = {};
    let colorCounter = 0;
    
    // First, collect all relevant staff members (direct and reverse relationships)
    const relevantStaffIds = new Set<string>();
    
    // STEP 1: Get direct relationships (the staff that the selected person is paired with)
    const selectedStaff = schedule.staffs.find(staff => staff.id === selectedStaffId);
    if (selectedStaff?.pairList) {
      selectedStaff.pairList.forEach(pair => {
        if (pair.staffId) {
          relevantStaffIds.add(pair.staffId);
        }
      });
    }
    
    // STEP 2: Get reverse relationships (staff who have the selected person in their pair list)
    schedule.staffs.forEach(staff => {
      if (staff.id !== selectedStaffId && staff.pairList) {
        staff.pairList.forEach(pair => {
          if (pair.staffId === selectedStaffId) {
            relevantStaffIds.add(staff.id);
          }
        });
      }
    });
    
    // Assign colors to all relevant staff IDs
    relevantStaffIds.forEach(staffId => {
      staffColorIndices[staffId] = colorCounter % STAFF_COLORS.length;
      colorCounter++;
    });
    
    // STEP 3: Process direct relationships
    if (selectedStaff?.pairList) {
      selectedStaff.pairList.forEach(pair => {
        if (!pair.staffId || !pair.startDate || !pair.endDate) return;

        // Find paired staff details
        const pairedStaff = schedule.staffs.find(s => s.id === pair.staffId);
        const staffName = pairedStaff ? pairedStaff.name : 'Unknown';
        
        // Get color for this staff
        const colorIndex = staffColorIndices[pair.staffId] || 0;
        const colorHex = STAFF_COLORS[colorIndex];
        
        // Get the date range for the pair
        const pairDates = getDatesBetween(
          dayjs(new Date(pair.startDate)).format("DD-MM-YYYY"),
          dayjs(new Date(pair.endDate)).format("DD-MM-YYYY")
        );
        
        // Save pair days with color info
        pairDates.forEach(date => {
          allPairDays.push({
            date,
            color: colorHex,
            staffId: pair.staffId,
            staffName
          });
        });
      });
    }
    
    // STEP 4: Process reverse relationships
    schedule.staffs.forEach(staff => {
      if (staff.id === selectedStaffId || !staff.pairList) return;
      
      staff.pairList.forEach(pair => {
        if (pair.staffId !== selectedStaffId || !pair.startDate || !pair.endDate) return;
        
        // Get color for this staff
        const colorIndex = staffColorIndices[staff.id] || 0;
        const colorHex = STAFF_COLORS[colorIndex];
        
        // Get the date range for the pair
        const pairDates = getDatesBetween(
          dayjs(new Date(pair.startDate)).format("DD-MM-YYYY"),
          dayjs(new Date(pair.endDate)).format("DD-MM-YYYY")
        );
        
        // Save pair days with color info
        pairDates.forEach(date => {
          allPairDays.push({
            date,
            color: colorHex,
            staffId: staff.id,
            staffName: staff.name
          });
        });
      });
    });

    return allPairDays;
  }, [schedule, selectedStaffId]);
  
  // Wrap in a function for backward compatibility with existing code
  const getPairHighlightedDays = useCallback(() => {
    return pairHighlightedDays;
  }, [pairHighlightedDays]);

  return {
    events,
    highlightedDates,
    getPairHighlightedDays
  };
};

export default useCalendarEvents;
