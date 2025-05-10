'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAxios from '@/hooks/useAxios';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiCalendar, FiClock, FiLayers, FiMail, FiMapPin, FiMessageCircle, FiTrash, FiUser } from 'react-icons/fi';

// User detail interface
interface UserDetail {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar: string | null;
  location: string | null;
  gender: string | null;
  bio: string | null;
  birthdate: string | null;
  is_online: boolean;
  last_seen: string;
  date_joined: string;
  is_superuser: boolean;
  is_staff: boolean;
  stats: {
    chats: number;
    messages: number;
  };
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useAxios();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Fetch user details
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/dash/users/${userId}/`, {
          signal: controller.signal,
        });
        setUser(response.data);
      } catch (error: any) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [userId]);

  // Handle user deletion
  const handleDeleteUser = () => {
    if (!user) return;

    api
      .delete(`/dash/users/${user.id}/`)
      .then(() => {
        router.push('/users');
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      })
      .finally(() => {
        setDeleteDialogOpen(false);
      });
  };

  // Format date helper function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not available';

    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Format date with time helper function
  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not available';

    try {
      const date = new Date(dateString);
      return `${format(date, 'MMMM d, yyyy')} at ${format(date, 'h:mm a')}`;
    } catch {
      return 'Invalid date';
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Back button and page header */}
        <div className='flex items-center justify-between'>
          <Button variant='ghost' onClick={() => router.back()} className='flex items-center gap-2'>
            <FiArrowLeft className='h-4 w-4' />
            <span>Back to Users</span>
          </Button>

          <div className='flex items-center gap-2'>
            <Button variant='destructive' onClick={() => setDeleteDialogOpen(true)} className='flex items-center gap-2'>
              <FiTrash className='h-4 w-4' />
              <span>Delete User</span>
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        {loading ? (
          // Loading state with skeletons
          <div className='grid md:grid-cols-3 gap-6'>
            <Card className='md:col-span-1'>
              <CardHeader>
                <Skeleton className='h-6 w-24' />
              </CardHeader>
              <CardContent className='flex flex-col items-center justify-center space-y-4 py-6'>
                <Skeleton className='h-32 w-32 rounded-full' />
                <Skeleton className='h-6 w-40' />
                <Skeleton className='h-4 w-32' />
                <div className='w-full mt-4'>
                  <Skeleton className='h-4 w-full mb-2' />
                  <Skeleton className='h-4 w-full mb-2' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              </CardContent>
            </Card>
            <Card className='md:col-span-2'>
              <CardHeader>
                <Skeleton className='h-6 w-32 mb-3' />
                <Skeleton className='h-4 w-48' />
              </CardHeader>
              <CardContent className='space-y-8'>
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className='grid md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-6 w-40' />
                      </div>
                      <div className='space-y-2'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-6 w-40' />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          // User profile content
          <div className='grid md:grid-cols-3 gap-6'>
            {/* User Summary Card */}
            <Card className='md:col-span-1'>
              <CardHeader>
                <CardTitle>User Summary</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col items-center justify-center space-y-4 py-6'>
                <Avatar className='h-32 w-32'>
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className='text-2xl'>{user ? getUserInitials(user.name || user.username) : '--'}</AvatarFallback>
                </Avatar>
                <h3 className='text-2xl font-bold'>{user?.name || user?.username}</h3>
                <div className='flex items-center gap-2'>
                  {user?.is_online ? (
                    <Badge className='bg-green-500 hover:bg-green-600'>Online</Badge>
                  ) : (
                    <Badge variant='outline' className='border-amber-500 text-amber-500'>
                      Offline
                    </Badge>
                  )}

                  {user?.is_superuser ? (
                    <Badge>Admin</Badge>
                  ) : user?.is_staff ? (
                    <Badge variant='outline' className='border-blue-500 text-blue-500'>
                      Staff
                    </Badge>
                  ) : (
                    <Badge variant='outline'>User</Badge>
                  )}
                </div>

                {user?.bio && (
                  <div className='mt-4 text-center'>
                    <p className='text-muted-foreground text-sm'>{user.bio}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className='border-t border-border flex justify-around py-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{user?.stats?.chats || 0}</div>
                  <div className='text-xs text-muted-foreground'>Chats</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{user?.stats?.messages || 0}</div>
                  <div className='text-xs text-muted-foreground'>Messages</div>
                </div>
              </CardFooter>
            </Card>

            {/* User Details Tabs */}
            <Card className='md:col-span-2'>
              <CardHeader>
                <Tabs defaultValue='profile' className='w-full' value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className='grid grid-cols-2 mb-4'>
                    <TabsTrigger value='profile'>Profile Information</TabsTrigger>
                    <TabsTrigger value='activity'>Activity & Stats</TabsTrigger>
                  </TabsList>

                  <TabsContent value='profile' className='space-y-6'>
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                          <FiUser className='h-4 w-4' />
                          Username
                        </p>
                        <p className='text-base'>{user?.username || 'Not set'}</p>
                      </div>

                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                          <FiMail className='h-4 w-4' />
                          Email Address
                        </p>
                        <p className='text-base'>{user?.email}</p>
                      </div>
                    </div>

                    <div className='grid md:grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                          <FiMapPin className='h-4 w-4' />
                          Location
                        </p>
                        <p className='text-base'>{user?.location || 'Not specified'}</p>
                      </div>

                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                          <FiUser className='h-4 w-4' />
                          Gender
                        </p>
                        <p className='text-base'>{user?.gender || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className='grid md:grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                          <FiCalendar className='h-4 w-4' />
                          Birthdate
                        </p>
                        <p className='text-base'>{user?.birthdate ? formatDate(user.birthdate) : 'Not specified'}</p>
                      </div>

                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                          <FiCalendar className='h-4 w-4' />
                          Joined On
                        </p>
                        <p className='text-base'>{formatDate(user?.date_joined)}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='activity' className='space-y-6'>
                    <div className='grid md:grid-cols-2 gap-6'>
                      <Card>
                        <CardHeader className='pb-2'>
                          <div className='flex items-center justify-between'>
                            <CardTitle className='text-base'>Messaging Activity</CardTitle>
                            <FiMessageCircle className='h-4 w-4 text-muted-foreground' />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='text-3xl font-bold'>{user?.stats?.messages || 0}</div>
                          <p className='text-sm text-muted-foreground'>Total messages sent</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='pb-2'>
                          <div className='flex items-center justify-between'>
                            <CardTitle className='text-base'>Chat Participation</CardTitle>
                            <FiLayers className='h-4 w-4 text-muted-foreground' />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='text-3xl font-bold'>{user?.stats?.chats || 0}</div>
                          <p className='text-sm text-muted-foreground'>Chats joined</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className='pb-2'>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='text-base'>Last Active</CardTitle>
                          <FiClock className='h-4 w-4 text-muted-foreground' />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='flex items-center'>
                          <div className={`w-3 h-3 rounded-full mr-2 ${user?.is_online ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                          <div>
                            {user?.is_online ? (
                              <span className='font-medium'>Currently Online</span>
                            ) : (
                              <div>
                                <span className='font-medium'>Last seen on</span>
                                <div className='text-sm text-muted-foreground'>{formatDateTime(user?.last_seen)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user &quot;{user?.name || user?.username}&quot; and all associated data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className='bg-red-500 hover:bg-red-600'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
