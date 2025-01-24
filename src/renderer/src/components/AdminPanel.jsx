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
import { Check, RefreshCcw, Save } from 'lucide-react'
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
  const [name, setName] = useState('')

  const getAllUsers = async () => {
    window.api.getAllUsers().then((res) => {
      setAllUsers(res)
    })
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  const createNewUser = async () => {
    await window.api.createNewUser(email, password, role, name)
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
          <TableHead>Name</TableHead>
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
                <NameComponent user={user} />
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(role) => {
                    console.log(role)
                    window.api.updateUserInformation({ email: user.email, role: role })
                  }}
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
            <Input
              placeholder="Name"
              className="w-fit"
              onChange={(e) => setName(e.target.value)}
              value={name}
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
              <Button variant="outline" onClick={() => createNewUser()}>
                Create
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

const NameComponent = ({ user }) => {
  const [name, setName] = useState(user.name)
  const [isSaved, setIsSaved] = useState(false)
  const handleSave = async () => {
    console.log('name', name)

    await window.api.updateUserInformation({ email: user.email, role: user.role, name: name })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
    >
      <Input className="w-fit" value={name} onChange={(e) => setName(e.target.value)} />
      <Button variant="outline" size="icon" type="submit">
        {isSaved ? (
          <Check className="size-4" />
        ) : (
          <Save className="hover:text-blue-500 cursor-pointer size-4" />
        )}
      </Button>
    </form>
  )
}

export default AdminPanel
