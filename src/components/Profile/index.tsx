// Modern Profile Card component with avatar, icons, and responsive design

import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import { motion } from 'framer-motion';
import { FiMail, FiUser, FiEdit } from 'react-icons/fi';
import "../profileCalendar.scss";

type ProfileCardProps = {
    profile: UserInstance;
};

// Rol objesi için arayüz tanımı
interface RoleObject {
    id?: string | number;
    name?: string;
    [key: string]: unknown;  // Diğer olası özellikler için index signature
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Rol bilgisini güvenli bir şekilde alıyoruz
  const displayRole = () => {
    if (profile && profile.role !== undefined) {
      // If the role is an object, safely access its properties
      if (typeof profile.role === 'object' && profile.role !== null) {
        // Convert to RoleObject type to prevent TypeScript warnings
        const roleObj = profile.role as RoleObject;
        // First check the name property, then id, otherwise show as JSON
        if (roleObj.name) return roleObj.name;
        if (roleObj.id) return String(roleObj.id);
        return JSON.stringify(profile.role);
      }
      // If role is a string/number, return it directly
      return String(profile.role);
    } else {
      // If profile doesn't exist or role is undefined, get from localStorage
      const localRole = AuthSession.getRoles();
      
      // The role from localStorage might also be an object, so we check
      if (typeof localRole === 'object' && localRole !== null) {
        // Convert to RoleObject type to prevent TypeScript warnings
        const roleObj = localRole as RoleObject;
        if (roleObj.name) return roleObj.name;
        if (roleObj.id) return String(roleObj.id);
        return JSON.stringify(localRole);
      }
      return localRole !== null && localRole !== undefined ? String(localRole) : 'User';
    }
  };
  
  // Get the user's initials for the avatar
  const getUserInitials = () => {
    const name = profile?.name || 'User';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Format role text for better display
  const formatRoleText = (role: string) => {
    // Convert role to title case
    return role.replace(/\b\w/g, (letter) => letter.toUpperCase());
  };
  
  // Animation variants for profile elements
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="profile-section"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="profile-status">Active</div>
      
      <motion.div className="profile-avatar" variants={itemVariants}>
        {getUserInitials()}
      </motion.div>
      
      <div className="profile-info">
        <motion.h2 variants={itemVariants} className="welcome-text">
          Welcome, <span className="name-text">{profile?.name || 'User'}</span>
        </motion.h2>
        <motion.div variants={itemVariants} className="role-badge">
          {formatRoleText(displayRole())}
        </motion.div>
        <motion.div className="profile-actions" variants={itemVariants}>
          <button title="Message">
            <FiMail />
            <span>Message</span>
          </button>
          <button title="Edit Profile">
            <FiEdit />
            <span>Edit</span>
          </button>
          <button title="View Profile">
            <FiUser />
            <span>Profile</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;