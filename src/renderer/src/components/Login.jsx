import React, { useEffect, useState } from 'react'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { useUser } from '../contexts/userContext'
import { Checkbox } from '../../../components/ui/checkbox'
import AdminPanel from './AdminPanel'

const Login = () => {
  const { user, signIn,signOut } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    setEmail(localStorage.getItem('email') || '')
    setPassword(localStorage.getItem('password') || '')
    setRemember(localStorage.getItem('remember') === 'true')
  }, [])

  if (user && user.email) {
    return (
      <div className="px-4">
        <Label className="text-2xl">Welcome</Label>
        <div className="flex items-start flex-col py-4">
          Email:
          <p className="text-muted-foreground">{user.email}</p>
          Role:
          <p className="text-muted-foreground">{user.role}</p>
        </div>
        <Button variant="destructive" onClick={() => signOut()}>
          Sign Out
        </Button>

        {user.role === 'admin' && <AdminPanel />}
      </div>
    )
  }

  return (
    <div className="px-4">
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
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl">Login</h1>
        <Label>Email</Label>
        <Input className="w-[180px]" onChange={(e) => setEmail(e.target.value)} value={email} />
        <Label>Password</Label>
        <Input
          className="w-[180px]"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
        />
        <div className="flex items-center gap-2 text-primary/70">
          <label htmlFor="remember">Remember me</label>
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked)}
          />
        </div>
        <Button className="mt-4">Sign In</Button>
      </form>
    </div>
  )
}

export default Login
