import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the User Context
const UserContext = createContext();

// Custom hook to use the User Context
export const useUser = () => {
  return useContext(UserContext);
};

// UserProvider Component
export const UserProvider = ({ children }) => {
  // Helper function to safely parse local storage data
  const getStoredUser = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return storedUser || {};
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return {};
    }
  };

  // Initialize state from local storage or default to null
  const { username: storedUsername = null, role: storedRole = null } = getStoredUser();
  const [username, setUsername] = useState(storedUsername);
  const [role, setRole] = useState(storedRole); // Possible roles: admin, softwareManager, productManager, hardwareManager

  // Function to update user data
  const setUser = (user) => {
    console.log("Updating user:", user);
    const { username, role } = user;

    if (!username || !role) {
      console.warn("Invalid user data provided:", user);
      return;
    }

    // Update local storage and state
    localStorage.setItem('user', JSON.stringify(user));
    setUsername(username);
    setRole(role);
  };

  // Clean up state if localStorage changes or user logs out
  const logoutUser = () => {
    console.log("Logging out user.");
    localStorage.removeItem('user');
    setUsername(null);
    setRole(null);
  };

  // Context value to provide
  const value = {
    setUser,
    logoutUser,
    user: {
      username,
      role,
    },
  };

  // Keep state in sync with local storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = getStoredUser();
      setUsername(storedUser.username || null);
      setRole(storedUser.role || null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};