"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useAxios from "@/hooks/useAxios";
import { useEffect, useState } from "react";
import { FiActivity, FiAlertCircle, FiLayers, FiMessageCircle, FiPackage, FiTrendingUp, FiUsers } from "react-icons/fi";

// Type definition for statistics
interface DashStats {
  users: number;
  messages: number;
  chats: number;
  crafts: number;
  activeUsers: number;
  totalContent: number;
  reportedContent: number;
}

export default function Home() {
  const { api } = useAxios();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userActivity, setUserActivity] = useState<{day: string, count: number}[]>([]);
  const [contentActivity, setContentActivity] = useState<{day: string, count: number}[]>([]);

  useEffect(() => {
    // Fetch dashboard statistics
    api.get("/api/dash/stats/")
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));

    // Fetch user activity for the last 7 days (sample data for now)
    setUserActivity([
      {day: "Mon", count: 340},
      {day: "Tue", count: 420},
      {day: "Wed", count: 380},
      {day: "Thu", count: 490},
      {day: "Fri", count: 520},
      {day: "Sat", count: 450},
      {day: "Sun", count: 380},
    ]);

    // Fetch content activity for the last 7 days (sample data for now)
    setContentActivity([
      {day: "Mon", count: 120},
      {day: "Tue", count: 150},
      {day: "Wed", count: 140},
      {day: "Thu", count: 180},
      {day: "Fri", count: 190},
      {day: "Sat", count: 170},
      {day: "Sun", count: 130},
    ]);
    // eslint-disable-next-line
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Caelium Admin</h1>
          <p className="text-muted-foreground">Here's what's happening on your platform today.</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FiUsers className="text-2xl" />}
            label="Total Users"
            value={stats?.users}
            loading={loading}
            trend={+5.2}
          />
          <StatCard
            icon={<FiMessageCircle className="text-2xl" />}
            label="Messages"
            value={stats?.messages}
            loading={loading}
            trend={+12.5}
          />
          <StatCard
            icon={<FiLayers className="text-2xl" />}
            label="Chats"
            value={stats?.chats}
            loading={loading}
            trend={+8.1}
          />
          <StatCard
            icon={<FiPackage className="text-2xl" />}
            label="Crafts"
            value={stats?.crafts}
            loading={loading}
            trend={+3.8}
          />
        </div>

        {/* Activity Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Chart */}
          <Card className="p-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-medium">User Activity</h3>
              <p className="text-sm text-muted-foreground">Daily active users over the last 7 days</p>
              
              <div className="h-64 mt-4 flex items-end justify-between gap-2">
                {userActivity.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 w-full">
                    <div 
                      className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t" 
                      style={{height: `${(day.count / 600) * 100}%`}}
                    ></div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Content Creation Chart */}
          <Card className="p-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-medium">Content Activity</h3>
              <p className="text-sm text-muted-foreground">Content created over the last 7 days</p>
              
              <div className="h-64 mt-4 flex items-end justify-between gap-2">
                {contentActivity.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 w-full">
                    <div 
                      className="w-full bg-violet-500/80 hover:bg-violet-500 transition-all rounded-t" 
                      style={{height: `${(day.count / 200) * 100}%`}}
                    ></div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<FiActivity className="text-2xl" />}
            label="Active Users"
            value={stats?.activeUsers || 350}
            loading={loading}
            trend={+15.3}
            trendLabel="vs last week"
          />
          <StatCard
            icon={<FiTrendingUp className="text-2xl" />}
            label="Total Content"
            value={stats?.totalContent || 8524}
            loading={loading}
            trend={+7.2}
            trendLabel="growth rate"
          />
          <StatCard
            icon={<FiAlertCircle className="text-2xl" />}
            label="Reported Content"
            value={stats?.reportedContent || 24}
            loading={loading}
            trend={-12.5}
            trendLabel="this week"
            trendIsGood={false}
          />
        </div>

        {/* Recent Activity Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-medium">Recent Activities</h3>
            <p className="text-sm text-muted-foreground">Latest actions across the platform</p>
          </div>
          <div className="px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="border-b border-border">
                      <td className="py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-4"><Skeleton className="h-5 w-16" /></td>
                    </tr>
                  ))
                ) : (
                  [
                    { action: "User Login", user: "alex_wong", time: "2 mins ago", status: "success" },
                    { action: "Content Posted", user: "sarah_jensen", time: "15 mins ago", status: "success" },
                    { action: "Content Reported", user: "john_doe", time: "45 mins ago", status: "warning" },
                    { action: "User Registered", user: "lisa_smith", time: "1 hour ago", status: "success" },
                    { action: "Account Locked", user: "suspicious_user", time: "3 hours ago", status: "error" },
                  ].map((item, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-4 text-foreground">{item.action}</td>
                      <td className="py-4 text-foreground">{item.user}</td>
                      <td className="py-4 text-muted-foreground">{item.time}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${item.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            item.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border text-center">
            <a href="/activities" className="text-sm text-primary hover:underline">View all activities</a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Stat card component with loading state and trend indicator
function StatCard({ 
  icon, 
  label, 
  value, 
  loading, 
  trend = 0,
  trendLabel = "this month",
  trendIsGood = true
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: number; 
  loading: boolean;
  trend?: number;
  trendLabel?: string;
  trendIsGood?: boolean;
}) {
  // Determine if the trend should be displayed as positive
  const showPositiveTrend = trendIsGood ? trend > 0 : trend < 0;
  
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-muted-foreground mb-1">{label}</div>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
          )}
          
          {/* Trend indicator */}
          {!loading && (
            <div className="flex items-center mt-2">
              <span className={`flex items-center text-xs ${
                showPositiveTrend ? 'text-green-500' : 'text-red-500'
              }`}>
                <span className={`mr-1 ${trend === 0 ? 'hidden' : ''}`}>
                  {trend > 0 ? '↑' : '↓'}
                </span>
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="rounded-full p-3 bg-primary/10 text-primary">{icon}</div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary opacity-5"></div>
    </Card>
  );
}
