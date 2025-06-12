"use client";
import AuthContext from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiCloud,
  FiHome,
  FiLayers,
  FiLogOut,
  FiMessageCircle,
  FiPackage,
  FiServer,
  FiSettings,
  FiSlack,
  FiUsers
} from "react-icons/fi";

const sidebarLinks = [
  { 
    section: "OVERVIEW",
    items: [
      { name: "Dashboard", url: "/", icon: FiHome },
      { name: "Analytics", url: "/analytics", icon: FiActivity },
      { name: "Monitoring", url: "/monitoring", icon: FiServer },
    ]
  },
  {
    section: "MANAGEMENT",
    items: [
      { name: "Users", url: "/users", icon: FiUsers },
      { name: "Messages", url: "/messages", icon: FiMessageCircle },
      { name: "Chats", url: "/chats", icon: FiLayers },
      { name: "Crafts", url: "/crafts", icon: FiPackage },
      { name: "Cloud Files", url: "/cloud/files", icon: FiCloud },
    ]
  },
  {
    section: "ADMINISTRATION",
    items: [
      { name: "Moderation", url: "/moderation", icon: FiAlertCircle },
      { name: "System Logs", url: "/logs", icon: FiSlack },
      { name: "Settings", url: "/settings", icon: FiSettings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logoutUser } = useContext(AuthContext);

  return (
    <motion.aside
      initial={{ x: -15, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-0 left-0 z-40 w-64 h-screen hidden md:block border-r border-border bg-card"
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col py-6 overflow-y-auto">
        {/* Logo Section */}
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-foreground">
              Caelium Admin
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 space-y-6">
          {sidebarLinks.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-2">
              <div className="px-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {section.section}
              </div>
              {section.items.map((item, index) => (
                <Link 
                  key={index}
                  href={item.url}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                    pathname === item.url 
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-3 mt-6 border-t border-border pt-4">
          <button
            onClick={logoutUser}
            className="flex items-center w-full gap-3 px-4 py-2.5 rounded-md transition-colors text-red-500 hover:bg-red-500/10"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}