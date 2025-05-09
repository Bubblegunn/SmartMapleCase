import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type { ScheduleInstance } from "../../../models/schedule";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

// Background class names for events
export const bgClasses = [
  "bg-one", "bg-two", "bg-three", "bg-four", "bg-five",
  "bg-six", "bg-seven", "bg-eight", "bg-nine", "bg-ten",
  "bg-eleven", "bg-twelve", "bg-thirteen", "bg-fourteen", "bg-fifteen",
  "bg-sixteen", "bg-seventeen", "bg-eighteen", "bg-nineteen", "bg-twenty",
  "bg-twenty-one", "bg-twenty-two", "bg-twenty-three", "bg-twenty-four",
  "bg-twenty-five", "bg-twenty-six", "bg-twenty-seven", "bg-twenty-eight",
  "bg-twenty-nine", "bg-thirty", "bg-thirty-one", "bg-thirty-two",
  "bg-thirty-three", "bg-thirty-four", "bg-thirty-five", "bg-thirty-six",
  "bg-thirty-seven", "bg-thirty-eight", "bg-thirty-nine", "bg-forty",
];

/**
 * Get a shift by its ID from the schedule
 */
export const getShiftById = (schedule: ScheduleInstance | undefined, id: string) => {
  return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
};

/**
 * Get an assignment by its ID from the schedule
 */
export const getAssignmentById = (schedule: ScheduleInstance | undefined, id: string) => {
  return schedule?.assignments?.find((assign) => id === assign.id);
};

/**
 * Get a staff member by its ID from the schedule
 */
export const getStaffById = (schedule: ScheduleInstance | undefined, id: string) => {
  return schedule?.staffs?.find((staff) => id === staff.id);
};

/**
 * Get all valid dates between schedule start and end dates
 */
export const getValidDates = (schedule: ScheduleInstance) => {
  const dates: string[] = [];
  let currentDate = dayjs(schedule.scheduleStartDate);
  
  while (
    currentDate.isBefore(schedule.scheduleEndDate) ||
    currentDate.isSame(schedule.scheduleEndDate)
  ) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

/**
 * Get all dates between two dates in DD-MM-YYYY format
 */
export const getDatesBetween = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const start = dayjs(startDate, "DD.MM.YYYY").toDate();
  const end = dayjs(endDate, "DD.MM.YYYY").toDate();
  const current = new Date(start);

  while (current <= end) {
    dates.push(dayjs(current).format("DD-MM-YYYY"));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Find the first event date to initialize the calendar
 */
export const findFirstEventDate = (schedule: ScheduleInstance | undefined): Date | null => {
  if (!schedule?.assignments || schedule.assignments.length === 0) {
    return null;
  }
  
  // Sort all assignments by their date
  const sortedAssignments = [...schedule.assignments].sort((a, b) => {
    return new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime();
  });
  
  if (!sortedAssignments[0]) {
    return null;
  }
  
  return dayjs(sortedAssignments[0].shiftStart).toDate();
};
