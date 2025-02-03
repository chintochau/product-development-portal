import React, { useEffect, useState } from 'react'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { useUser } from '../contexts/userContext'
import { Checkbox } from '../../../components/ui/checkbox'
import AdminPanel from './AdminPanel'
import { WithPermission } from '../contexts/permissionContext'
import bluOSLogo from '../assets/BluOS-on-black-Logo.png'
import { Eye, EyeClosed } from 'lucide-react'

const Login = () => {
  return (
    <WithPermission requiredAccess={99} fallback={<LoginComponent />}>
      <UserProfile />
    </WithPermission>
  )
}

export default Login

const UserProfile = () => {
  const { user, signIn, signOut } = useUser()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    // Add your password change logic here
    const response = await window.api.changePassword(user.email, currentPassword, newPassword)

    if (response) {
      alert('Password changed successfully')
    } else {
      alert('Error changing password')
    }
    setIsChangingPassword(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-8 space-y-10">
      <div className="w-full max-w-md rounded-xl shadow-2xl p-8 space-y-6 transform transition-all duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
            {user.name}, Welcome back
          </h1>
          <p>You're logged in as:</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium ">Email</span>
            <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200">
              {user.email}
            </p>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium ">Role</span>
            <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200">
              {user.role}
            </p>
          </div>
        </div>

        {!isChangingPassword ? (
          <Button
            onClick={() => setIsChangingPassword(true)}
            className="w-full py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-600 transition-all duration-300"
          >
            Change Password
          </Button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium ">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium ">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium ">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="w-full py-3 text-base font-medium   text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-600 transition-all duration-300"
              >
                Save New Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPassword(false)}
                className="w-full py-3 text-base font-medium transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <button
          onClick={signOut}
          className="w-full py-3 text-base font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
        >
          Sign Out
        </button>
      </div>

      <WithPermission requiredAccess={2}>
        <AdminPanel />
      </WithPermission>
    </div>
  )
}

const LoginComponent = () => {
  const { signIn } = useUser() // Assuming signIn is a provided authentication function
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('email')
    const savedPassword = localStorage.getItem('password')
    const savedRemember = localStorage.getItem('remember')

    if (savedRemember === 'true') {
      setEmail(savedEmail || '')
      setPassword(savedPassword || '')
      setRemember(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    // Save credentials if "Remember me" is checked
    if (remember) {
      localStorage.setItem('email', email)
      localStorage.setItem('password', password)
      localStorage.setItem('remember', 'true')
    } else {
      localStorage.removeItem('email')
      localStorage.removeItem('password')
      localStorage.removeItem('remember')
    }

    try {
      await signIn(email, password)
    } catch (error) {
      setErrorMessage('Failed to sign in. Please check your credentials.')
      console.error(error)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Logo/Image Section */}
      <div className="md:w-1/2 h-60 md:h-screen relative flex items-center justify-center p-12 bg-gradient-to-br from-blue-950 to-black">
        <img
          src={bluOSLogo}
          alt="BluOS Logo Blurred Background"
          className="absolute inset-10 w-1/2 h-1/2 object-cover blur-xl opacity-30"
        />
        <div className="relative max-w-md text-white text-center space-y-6">
          <h2 className="text-5xl font-bold font-sans">BluOS</h2>
          <p className="text-2xl opacity-90">Product Management Portal</p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="md:w-1/2 flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600">Enter your credentials to access the portal</p>
          </div>

          {errorMessage && <div className="text-center text-red-600 text-sm">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-lg transition-shadow focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 rounded-lg pr-12 transition-shadow focus:shadow-outline"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-transform duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <Eye className="rotate-180 transition-transform duration-200" />
                    ) : (
                      <EyeClosed className="transition-transform duration-200" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(!!checked)}
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full"
                  viewBox="0 0 24 24"
                ></svg>
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
