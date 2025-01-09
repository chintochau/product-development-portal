import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { RefreshCcw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel
} from '../../../components/ui/select'
import { userRoles } from '../constant'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

const AdminPanel = () => {
  const [allUsers, setAllUsers] = useState([])
  const [role, setRole] = useState(userRoles[4].role)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const getAllUsers = async () => {
    console.log('Getting all users...')

    window.api.getAllUsers().then((res) => {
      setAllUsers(res)
    })
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  const createNewUser = async (email, password, role) => {
    await window.api.createNewUser(email, password, role)
    getAllUsers()
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <div className="flex gap-2 items-center">
              <p>Email</p>{' '}
              <RefreshCcw
                className="hover:animate-spin cursor-pointer size-4"
                onClick={getAllUsers}
              />
            </div>
          </TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Password</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allUsers.map((user) => {
          return (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(role) => window.api.updateUserInformation(user.email, role)}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.role} value={role.role}>
                        {role.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          )
        })}
        <TableRow>
          <TableCell>
            <Input
              placeholder="Add new user"
              className="w-fit"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </TableCell>
          <TableCell>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger className="w-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role.role} value={role.role}>
                    {role.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Password"
                className="w-fit"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Button variant="outline" onClick={() => createNewUser(email, password, role)}>
                Create
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default AdminPanel
