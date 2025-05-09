import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ScheduleInstance } from '../../../models/schedule';
import { FiSearch, FiUser, FiUsers } from 'react-icons/fi';

interface StaffListProps {
  schedule: ScheduleInstance;
  selectedStaffId: string | null;
  onStaffSelect: (staffId: string) => void;
}

interface StaffMember {
  id: string;
  name: string;
}

/**
 * Component to display the list of staff members with search and selection capability
 */
const StaffList: React.FC<StaffListProps> = ({ 
  schedule, 
  selectedStaffId, 
  onStaffSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  
  // Filter staff based on search term
  useEffect(() => {
    if (!schedule?.staffs) return;
    
    if (!searchTerm.trim()) {
      setFilteredStaff(schedule.staffs);
    } else {
      const filtered = schedule.staffs.filter((staff: StaffMember) => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, schedule?.staffs]);
  
  return (
    <motion.div 
      className="staff-list-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="staff-list-header">
        <div className="staff-list-title-container">
          <FiUsers className="staff-list-icon" />
          <h3 className="staff-list-title">Staff Members</h3>
        </div>
      </div>
      
      {/* Search input wrapper */}
      <div className="staff-search-wrapper">
        <motion.div 
          className="staff-search-container"
          whileHover={{ boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)' }}
          whileTap={{ scale: 0.995 }}
        >
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="staff-search-input"
            aria-label="Search staff members"
          />
          {searchTerm && (
            <motion.button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Clear search"
            >
              ×
            </motion.button>
          )}
        </motion.div>
      </div>
      
      {/* Staff list with conditional rendering */}
      <div className="staff-list-body">
        {filteredStaff.length === 0 ? (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiUser className="no-results-icon" />
            <p>No staff members found</p>
          </motion.div>
        ) : (
          <div className="staff-list">
            {filteredStaff.map((staff: StaffMember) => (
              <motion.div
                key={staff.id}
                onClick={() => onStaffSelect(staff.id)}
                className={`staff ${staff.id === selectedStaffId ? "active" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{
                  backgroundColor: 'rgba(74, 108, 247, 0.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="staff-avatar">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <span className="staff-name">{staff.name}</span>
                {staff.id === selectedStaffId && (
                  <motion.div 
                    className="active-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StaffList;
