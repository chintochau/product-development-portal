import React from 'react';
import { useUser } from './userContext';
import { userRoles } from '../constant';

const PermissionContext = React.createContext({
  userRole: { role: '', access: Infinity } // Default denied access
});

export const PermissionProvider = ({ children, userRole }) => {
  return (
    <PermissionContext.Provider value={{ userRole }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => React.useContext(PermissionContext);


export const checkAccess = function(userRole, requiredAccess, requiredTeam) {
  // Admin has full access
  if (userRole.access === 0) return true;
  
  // Check team membership if required
  if (requiredTeam && userRole.team !== requiredTeam) return false;
  
  // Check access level
  return userRole.access <= requiredAccess;
};


export const WithPermission = ({ children, requiredAccess, requiredTeam, fallback }) => {
  const { userRole } = usePermissions();

  return checkAccess(userRole, requiredAccess, requiredTeam) ? (
    <>{children}</>
  ) : (
    <>{fallback || null}</>
  );
};



// New wrapper component to connect UserProvider and PermissionProvider
export function AuthPermissionWrapper({ children }) {
  const { user } = useUser() // Use your actual UserContext hook/consumer here
  const roles = userRoles // Your existing roles array

  // Find the user's role object
  const currentRole = roles.find((role) => role.role === user?.role) || {
    role: 'unknown',
    access: Infinity // Default to most restrictive
  }
  return <PermissionProvider userRole={currentRole}>{children}</PermissionProvider>
}
