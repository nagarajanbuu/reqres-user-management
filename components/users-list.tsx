"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import { UserEditDialog } from "@/components/user-edit-dialog"
import { UserDeleteDialog } from "@/components/user-delete-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string
}

interface ApiResponse {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: User[]
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const { isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const response = await fetch(`https://reqres.in/api/users?page=${page}`)

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data: ApiResponse = await response.json()
      setUsers(data.data)
      setTotalPages(data.total_pages)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers(currentPage)
    }
  }, [currentPage, isAuthenticated])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setEditingUser(null)
    toast({
      title: "User updated",
      description: `${updatedUser.first_name} ${updatedUser.last_name} has been updated.`,
    })
  }

  const handleUserDeleted = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
    setDeletingUser(null)
    toast({
      title: "User deleted",
      description: "User has been removed successfully.",
    })
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                  <AvatarFallback>
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6 pt-0">
              <Button variant="outline" onClick={() => handleEditUser(user)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(user)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {editingUser && (
        <UserEditDialog user={editingUser} onClose={() => setEditingUser(null)} onUserUpdated={handleUserUpdated} />
      )}

      {deletingUser && (
        <UserDeleteDialog user={deletingUser} onClose={() => setDeletingUser(null)} onUserDeleted={handleUserDeleted} />
      )}
    </div>
  )
}

