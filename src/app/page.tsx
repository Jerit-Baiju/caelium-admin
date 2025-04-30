"use client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useAxios from "@/hooks/useAxios";
import { useEffect, useState } from "react";
import { FiLayers, FiMessageCircle, FiPackage, FiUsers } from "react-icons/fi";

export default function Home() {
  const { api } = useAxios();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dash/stats/")
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard Stats</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        <StatCard
          icon={<FiUsers className="text-2xl" />}
          label="Users"
          value={stats?.users}
          loading={loading}
        />
        <StatCard
          icon={<FiMessageCircle className="text-2xl" />}
          label="Messages"
          value={stats?.messages}
          loading={loading}
        />
        <StatCard
          icon={<FiLayers className="text-2xl" />}
          label="Chats"
          value={stats?.chats}
          loading={loading}
        />
        <StatCard
          icon={<FiPackage className="text-2xl" />}
          label="Crafts"
          value={stats?.crafts}
          loading={loading}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number; loading: boolean }) {
  return (
    <Card className="flex flex-col items-center justify-center p-6 bg-card border border-border shadow-md">
      <div className="mb-2 text-primary">{icon}</div>
      <div className="text-lg font-semibold text-foreground mb-1">{label}</div>
      {loading ? (
        <Skeleton className="h-8 w-16 rounded bg-muted" />
      ) : (
        <div className="text-2xl font-bold text-foreground">{value}</div>
      )}
    </Card>
  );
}
