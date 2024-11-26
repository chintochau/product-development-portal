import React, { useState } from 'react'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui/select'
import { userRoles } from '../constant'
import { Button } from '../../../components/ui/button'
import { useUser } from '../contexts/userContext'

const Login = () => {
  const { setUser,user } = useUser()
  const [username, setUsername] = useState(user?.username || "")
  const [role, setRole] = useState(user?.role || "")
  return (
    <div className="px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setUser({ username, role })
        }}
      >
        <h1 className="text-2xl">Login</h1>
        <Label>Username</Label>
        <Input className="w-[180px]" onChange={(e) => setUsername(e.target.value)} value={username} />
        <Label>Role</Label>
        <Select value={role} onValueChange={(role) => setRole(role)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {userRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="mt-4">Save</Button>
      </form>
    </div>
  )
}

export default Login
