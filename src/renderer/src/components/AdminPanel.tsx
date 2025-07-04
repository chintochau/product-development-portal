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
  SelectValue
} from '@/components/ui/select'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { userRoles } from '../constant'
import { PostgreSQLTest } from './PostgreSQLTest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const AdminPanel = () => {
  const DEFAULT_ROLE = userRoles.find((role) => role.role === 'User')?.role || ''
  const [allUsers, setAllUsers] = useState([])
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: DEFAULT_ROLE,
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const getAllUsers = async () => {
    try {
      setIsLoading(true)
      const users = await window.api.getAllUsers()
      setAllUsers(users)
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  const createNewUser = async () => {
    if (!newUser.email || !newUser.password) {
      setError('Email and password are required')
      return
    }

    try {
      setIsLoading(true)
      await window.api.createNewUser(newUser.email, newUser.password, newUser.role, newUser.name)
      await getAllUsers()
      setNewUser({ email: '', name: '', role: DEFAULT_ROLE, password: '' })
      setError('')
    } catch (err) {
      setError('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="database">Database Connection</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Table className="border rounded-lg">
            <TableCaption className="my-4">
              User Management Dashboard (Only Visible to Admins & Platform Manager)
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[150px]">Role</TableHead>
                <TableHead className="min-w-[200px]">
                  <div className="flex justify-between items-center">
                    <span>Actions</span>
                    <RefreshCcw
                      className={cn(
                        'h-4 w-4 cursor-pointer transition-transform',
                        isLoading && 'animate-spin'
                      )}
                      onClick={getAllUsers}
                    />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <UserRow key={user.email} user={user} reloadUsers={getAllUsers} />
              ))}
              <TableRow className="bg-muted/50">
                <TableCell>
                  <Input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  <RoleSelect
                    value={newUser.role}
                    onValueChange={(role) => setNewUser((prev) => ({ ...prev, role }))}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, password: e.target.value }))
                      }
                      disabled={isLoading}
                    />
                    <Button
                      onClick={createNewUser}
                      disabled={isLoading || !newUser.email || !newUser.password}
                    >
                      Create
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </TabsContent>

        <TabsContent value="database">
          <PostgreSQLTest />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const UserRow = ({ user, reloadUsers }) => {
  const [localName, setLocalName] = useState(user.name)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setLocalName(user.name)
  }, [user.name])

  const handleUpdate = async (field, value) => {
    try {
      setIsSaving(true)
      await window.api.updateUserInformation({
        email: user.email,
        [field]: value
      })
      await reloadUsers()
      if (field === 'name') {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await handleUpdate('name', localName)
          }}
        >
          <div className="flex gap-2 items-center">
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              disabled={isSaving}
              className="w-[180px]"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={localName === user.name || isSaving}
            >
              {isSaved ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </TableCell>
      <TableCell>
        <RoleSelect
          value={user.role}
          onValueChange={(role) => handleUpdate('role', role)}
          disabled={isSaving}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className=" cursor-not-allowed"
          // onClick={() => handleUpdate('password', '')}
        >
          Reset Password
        </Button>
      </TableCell>
    </TableRow>
  )
}

const RoleSelect = ({ value, onValueChange, disabled }) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger className="w-[160px]">
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
)

export default AdminPanel
