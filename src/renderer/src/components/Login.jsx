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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 space-y-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{user.name}, Welcome back</h1>
          <p className="text-gray-600">You're logged in as:</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{user.email}</p>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-700">Role</span>
            <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{user.role}</p>
          </div>
        </div>

        <Button variant="destructive" onClick={signOut} className="w-full py-3 text-base">
          Sign Out
        </Button>
      </div>
      <WithPermission requiredAccess={5}>
        <AdminPanel />
      </WithPermission>
    </div>
  )
}

const LoginComponent = () => {
  const { user, signIn, signOut } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  if (user && user.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 space-y-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}, Welcome back</h1>
            <p className="text-gray-600">You're logged in as:</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{user.email}</p>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{user.role}</p>
            </div>
          </div>

          <Button variant="destructive" onClick={signOut} className="w-full py-3 text-base">
            Sign Out
          </Button>
        </div>
        <WithPermission requiredAccess={5}>
          <AdminPanel />
        </WithPermission>
        {JSON.stringify(user)}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Logo/Image Section - Replace div with img tag for actual logo */}
      <div className="md:w-1/2 h-1/4 md:h-screen relative flex items-center justify-center p-12 bg-gradient-to-br from-blue-950 to-black">
        <img
          src={bluOSLogo}
          alt="BluOS Logo Blurred Background"
          className="absolute inset-10 w-1/2 h-1/2 object-cover blur-xl opacity-30 "
        />
        <div className="relative max-w-md text-white text-center space-y-6">
          <h2 className="text-5xl font-bold">BluOS</h2>
          <p className="text-2xl opacity-90">Product Management Portal</p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600">Enter your credentials to access the portal</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (remember) {
                localStorage.setItem('email', email)
                localStorage.setItem('password', password)
                localStorage.setItem('remember', 'true')
              } else {
                localStorage.removeItem('email')
                localStorage.removeItem('password')
                localStorage.removeItem('remember')
              }
              signIn(email, password)
            }}
            className="space-y-6"
          >
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
                  className="w-full px-4 py-3 rounded-lg"
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
                    className="w-full px-4 py-3 rounded-lg pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <Eye /> : <EyeClosed />}
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
