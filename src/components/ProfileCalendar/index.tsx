/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from "../Profile";
import CalendarContainer from "../Calendar";
import { StaffList } from "../Calendar/exports";
import { FiCalendar, FiChevronLeft, FiMenu, FiUsers } from 'react-icons/fi';

import { useSelector } from "react-redux";
import { getAuthUser } from "../../store/auth/selector";
import { getSchedule } from "../../store/schedule/selector";

import { useDispatch } from "react-redux";
import { fetchSchedule } from "../../store/schedule/actions";
import { setProfile } from "../../store/auth/actions";

import "../profileCalendar.scss";

const ProfileCalendar = () => {
  const dispatch = useDispatch();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const auth = useSelector(getAuthUser);
  const schedule = useSelector(getSchedule);

  useEffect(() => {
    dispatch(setProfile() as any);
    dispatch(fetchSchedule() as any);

    // Ekran boyutu değiştiğinde responsive düzeltmeler yap
    const handleResize = () => {
      // Mobil menü durumunu ekran boyutuna göre ayarla
      if (window.innerWidth >= 992 && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    // Resize dinleyicisini ekle
    window.addEventListener('resize', handleResize);
    // Temizleme işlemi
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileSidebarOpen]);
  
  // Set first staff member as default when schedule loads
  useEffect(() => {
    console.log('ProfileCalendar - Schedule loaded:', schedule);
    console.log('ProfileCalendar - Current selectedStaffId:', selectedStaffId);
    
    if (schedule?.staffs && schedule.staffs.length > 0 && !selectedStaffId) {
      const firstStaffId = schedule.staffs[0].id;
      console.log('ProfileCalendar - Setting first staff as default:', firstStaffId);
      setSelectedStaffId(firstStaffId);
    }
  }, [schedule, selectedStaffId]);
  
  // Function to handle staff selection
  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    // Close mobile sidebar after selection on mobile
    if (window.innerWidth < 992) {
      setIsMobileSidebarOpen(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1,
        duration: 0.3
      }
    },
    closed: { 
      x: '-100%',
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    }
  };

  const fadeVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  };

  return (
    <div className="profile-calendar-container">
      {/* Mobile menu toggle button - only visible on mobile */}
      <div className="mobile-menu-toggle">
        <motion.button 
          onClick={toggleMobileSidebar}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle sidebar"
        >
          {isMobileSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
        </motion.button>
        <h1 className="mobile-title">
          <FiCalendar /> Schedule App
        </h1>
      </div>
      
      {/* Left column - conditionally animated for mobile */}
      <AnimatePresence>
        <motion.div 
          className={`left-column ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
          variants={sidebarVariants}
          initial="closed"
          animate={isMobileSidebarOpen ? 'open' : 'closed'}
          // Only apply these conditionally for mobile
          style={{ 
            position: window.innerWidth < 992 ? 'fixed' : 'relative',
            zIndex: window.innerWidth < 992 ? 1000 : 1,
            transform: window.innerWidth >= 992 ? 'none' : undefined
          }}
        >
          <div className="left-column-content">
            {/* Profile information */}
            <ProfileCard profile={auth} />
            
            {/* Staff list section */}
            <div className="staff-section">
              {schedule?.staffs && (
                <StaffList
                  schedule={schedule}
                  selectedStaffId={selectedStaffId}
                  onStaffSelect={handleStaffSelect}
                />
              )}
            </div>
            
            {/* Mobile sidebar close button - Daha güzel ve belirgin */}
            {window.innerWidth < 992 && isMobileSidebarOpen && (
              <motion.button 
                className="mobile-sidebar-close"
                onClick={toggleMobileSidebar}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronLeft size={18} /> Close
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile overlay */}
      {window.innerWidth < 992 && (
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div 
              className="mobile-overlay"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={toggleMobileSidebar}
            />
          )}
        </AnimatePresence>
      )}
      
      {/* Right column - calendar */}
      <div className="right-column">
        {/* Bilgi barı - Mobil cihazlarda daha fazla yönlendirme için */}
        {window.innerWidth < 992 && (
          <motion.div 
            className="mobile-calendar-info"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <span className="staff-name">{schedule?.staffs?.find(s => s.id === selectedStaffId)?.name || 'Staff'}</span> calendar
            </div>
            <button onClick={toggleMobileSidebar} className="change-staff-button">
              <FiUsers size={14} /> Change
            </button>
          </motion.div>
        )}
        
        <CalendarContainer 
          schedule={schedule} 
          user={auth} 
          userId={auth?.id || ''}
          selectedStaffId={selectedStaffId} /* Pass the selectedStaffId from parent */
          hideStaffs={true} /* Hide staff list in calendar since we show it in the sidebar */
        />
      </div>
    </div>
  );
};

export default ProfileCalendar;
