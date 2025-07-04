import React, { createContext, useContext, useState, useEffect } from 'react'
import { findTeamByRole } from '../../../lib/utils'

// Create the User Context
const UserContext = createContext()

// UserProvider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  // Clean up state if localStorage changes or user logs out
  const logoutUser = () => {
    console.log('Logging out user.')
    localStorage.removeItem('user')
    setUsername(null)
    setRole(null)
  }

  const checkSignInStatus = async () => {
    const signInStatus = await window.api.checkSignIn()
    console.log(signInStatus)

    setUser(signInStatus)
  }

  const signIn = async (email, password) => {
    const signInStatus = await window.api.signinWithFirebaseEmail(email, password)
    if (!signInStatus) {
      alert('Wrong email or password')
      return
    }
    setUser(signInStatus)
  }

  const signOut = async () => {
    await window.api.signOut()
    setUser(null)
  }

  // Context value to provide
  const value = {
    logoutUser,
    signIn,
    user: {
      ...user,
      team: findTeamByRole(user?.role || '')
    },
    setUser,
    signOut
  }

  // Keep state in sync with local storage changes
  useEffect(() => {
    checkSignInStatus()
  }, [])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Custom hook to use the User Context
export const useUser = () => {
  return useContext(UserContext)
}
