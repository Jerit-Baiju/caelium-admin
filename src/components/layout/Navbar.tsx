"use client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AuthContext from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/SocketContext";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useContext, useEffect, useState } from "react";
import { FiBell, FiMenu, FiMoon, FiSearch, FiServer, FiSettings, FiSun } from "react-icons/fi";

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { isConnected } = useWebSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme toggle after hydration to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 md:left-64 right-0 z-30 bg-background border-b border-border transition-all duration-300"
    >
      <div className="py-4 px-6 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FiMenu className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input 
            type="search"
            placeholder="Search..." 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-primary"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Server Status Indicator */}
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <FiServer className="h-5 w-5 text-foreground" />
          </div>

          {/* Theme Toggle - Only show after hydration to prevent mismatch */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-foreground"
          >
            {mounted ? (
              theme === "dark" ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )
            ) : (
              <span className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground relative">
                <FiBell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-3 border-b border-border">
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-muted-foreground">You have 3 unread messages</div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item} 
                    className="p-3 border-b border-border last:border-0 flex items-start gap-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <FiBell className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">New user registered</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-xs">View all notifications</Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="p-1 rounded-full" aria-label="User menu">
                <Avatar className="h-8 w-8 border border-border">
                  <img src={user?.avatar || "https://github.com/shadcn.png"} alt="User" />
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-0">
              <div className="p-3 border-b border-border">
                <div className="font-medium">{user?.name || "Admin User"}</div>
                <div className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</div>
              </div>
              <div className="p-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-3 py-2 text-sm gap-2" 
                  onClick={() => window.location.href = "/profile"}
                >
                  <FiSettings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-3 py-2 text-sm text-red-500 hover:text-red-500 gap-2" 
                  onClick={logoutUser}
                >
                  <FiMenu className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mobile menu (shown/hidden based on state) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-3 space-y-1">
            {[
              { name: "Dashboard", href: "/" },
              { name: "Users", href: "/users" },
              { name: "Analytics", href: "/analytics" },
              { name: "Settings", href: "/settings" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.nav>
  );
}