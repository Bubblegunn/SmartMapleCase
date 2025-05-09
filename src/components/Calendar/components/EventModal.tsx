import React from 'react';
import dayjs from 'dayjs';
import type { ScheduleInstance } from '../../../models/schedule';
import type { EventClickArg } from '@fullcalendar/core';
import { motion, AnimatePresence } from 'framer-motion';
import { getShiftById, getStaffById } from '../utils/calendarHelpers';

interface EventModalProps {
  selectedEvent: EventClickArg | null;
  onClose: () => void;
  schedule: ScheduleInstance;
}

/**
 * Modal component to display event details when clicking on a calendar event
 */
const EventModal: React.FC<EventModalProps> = ({ 
  selectedEvent, 
  onClose,
  schedule 
}) => {
  if (!selectedEvent) return null;

  // Get event information - handle both standard and internal formats
  const eventProps = selectedEvent.event.extendedProps || selectedEvent.event._def?.extendedProps || {};
  const eventTitle = selectedEvent.event.title || 'Unnamed Event';
  const eventDate = dayjs(selectedEvent.event.start).format('DD.MM.YYYY');
  
  // Extract staffId and shiftId from the event
  const staffId = eventProps.staffId || '';
  const shiftId = eventProps.shiftId || '';
  
  // Get shift information - use shift details from the schedule if available, otherwise use event times
  const shift = getShiftById(schedule, shiftId);
  const shiftName = shift?.name || eventTitle;
  const shiftStartTime = selectedEvent.event.start ? dayjs(selectedEvent.event.start).format('HH:mm') : '';
  const shiftEndTime = selectedEvent.event.end ? dayjs(selectedEvent.event.end).format('HH:mm') : '';
  
  // Calculate shift duration
  const shiftDuration = (selectedEvent.event.start && selectedEvent.event.end) 
    ? `${dayjs(selectedEvent.event.end).diff(dayjs(selectedEvent.event.start), 'hour', true).toFixed(1)} hours` 
    : '';
  
  // Get staff information
  const staff = getStaffById(schedule, staffId);
  const staffName = staff ? staff.name : 'Unknown Staff';
  const staffGroup = staff?.group || '';
  
  // Get any additional event information that might be helpful
  const assignmentId = selectedEvent.event.id || '';

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="event-modal" 
        onClick={onClose}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className="event-modal-content" 
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="event-modal-header">
            <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
              Event Details
            </motion.h3>
            <motion.button 
              onClick={onClose}
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </div>
          <motion.div 
            className="event-modal-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
          >
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}>
              <p>
                <strong>Staff:</strong> <span>{staffName}</span>
              </p>
            </motion.div>
            
            {staffGroup && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.25 } }}>
                <p>
                  <strong>Department:</strong> <span>{staffGroup}</span>
                </p>
              </motion.div>
            )}
            
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}>
              <p>
                <strong>Date:</strong> <span>{eventDate}</span>
              </p>
            </motion.div>
            
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}>
              <p>
                <strong>Shift:</strong> <span>{shiftName}</span>
              </p>
            </motion.div>
            
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}>
              <p>
                <strong>Start Time:</strong> <span>{shiftStartTime}</span>
              </p>
            </motion.div>
            
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.6 } }}>
              <p>
                <strong>End Time:</strong> <span>{shiftEndTime}</span>
              </p>
            </motion.div>
            
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.7 } }}>
              <p>
                <strong>Duration:</strong> <span>{shiftDuration}</span>
              </p>
            </motion.div>
            
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.8 } }}>
              <p>
                <strong>Assignment ID:</strong> <span className="assignment-id">{assignmentId}</span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
