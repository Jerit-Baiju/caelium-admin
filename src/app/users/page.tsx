"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useAxios from "@/hooks/useAxios";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
  FiUserX
} from "react-icons/fi";

// Types
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar: string | null;
  is_online: boolean;
  last_seen: string;
  date_joined: string;
  is_superuser: boolean;
  is_staff: boolean;
}

interface UsersResponse {
  count: number;
  results: User[];
  next: string | null;
  previous: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const { api } = useAxios();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("-date_joined");
  const [deleteAlertOpen, setDeleteAlertOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const fetchUsers = (url?: string) => {
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
    if (sortBy) params.append('sort_by', sortBy);
    
    // Use provided URL or build with params
    const apiUrl = url || `/dash/users/?${params.toString()}`;
    
    api.get(apiUrl)
      .then(response => {
        const data: UsersResponse = response.data;
        setUsers(data.results);
        setTotalUsers(data.count);
        setNextPageUrl(data.next);
        setPrevPageUrl(data.previous);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, sortBy]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Handle pagination
  const goToNextPage = () => {
    if (nextPageUrl) {
      setCurrentPage(currentPage + 1);
      fetchUsers(nextPageUrl);
    }
  };

  const goToPrevPage = () => {
    if (prevPageUrl) {
      setCurrentPage(currentPage - 1);
      fetchUsers(prevPageUrl);
    }
  };

  // Handle user deletion
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteAlertOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    
    api.delete(`/dash/users/${userToDelete.id}/`)
      .then(() => {
        // Refresh the user list
        fetchUsers();
      })
      .catch(error => {
        console.error("Error deleting user:", error);
      })
      .finally(() => {
        setDeleteAlertOpen(false);
        setUserToDelete(null);
      });
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  // Format last seen for display
  const formatLastSeen = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage your platform users and their permissions.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => fetchUsers()}
              className="flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
        
        {/* Filters and Search Card */}
        <Card>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <form onSubmit={handleSearch} className="flex w-full md:w-1/2 space-x-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search users by name, email or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
              
              <div className="flex space-x-2">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-date_joined">Newest First</SelectItem>
                    <SelectItem value="date_joined">Oldest First</SelectItem>
                    <SelectItem value="username">Username (A-Z)</SelectItem>
                    <SelectItem value="-username">Username (Z-A)</SelectItem>
                    <SelectItem value="email">Email (A-Z)</SelectItem>
                    <SelectItem value="-email">Email (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Users Table */}
        <Card className="overflow-hidden">
          <CardHeader className="py-5">
            <CardTitle className="text-lg">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {/* Removed Actions column */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading state with skeletons
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        {/* Removed Actions skeleton */}
                      </TableRow>
                    ))
                  ) : (
                    // Actual user data
                    users.map((user) => (
                      <TableRow key={user.id} className="cursor-pointer hover:bg-muted" onClick={() => router.push(`/users/${user.id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback>{getUserInitials(user.name || user.username)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name || user.username}</span>
                              <span className="text-sm text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_online ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
                          ) : (
                            <div className="flex flex-col">
                              <Badge variant="outline" className="border-amber-500 text-amber-500">Offline</Badge>
                              <span className="text-xs text-muted-foreground mt-1">
                                {user.last_seen ? formatLastSeen(user.last_seen) : 'Unknown'}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_superuser ? (
                            <Badge>Admin</Badge>
                          ) : user.is_staff ? (
                            <Badge variant="outline" className="border-blue-500 text-blue-500">Staff</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.date_joined)}</TableCell>
                        {/* Removed Actions cell */}
                      </TableRow>
                    ))
                  )}
                  
                  {/* No users found state */}
                  {!loading && users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiUserX className="h-10 w-10 text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium">No users found</h3>
                          <p className="text-muted-foreground">
                            Try adjusting your search or filter to find what you're looking for.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                              setSortBy("-date_joined");
                              fetchUsers();
                            }}
                            className="mt-4"
                          >
                            Reset filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{users.length}</span> of{" "}
                <span className="font-medium">{totalUsers}</span> users
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={!prevPageUrl}
                >
                  <FiChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!nextPageUrl}
                >
                  <span>Next</span>
                  <FiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete User Alert Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user &quot;{userToDelete?.name || userToDelete?.username}&quot; 
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}