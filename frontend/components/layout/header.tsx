"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  Home,
  Users,
  Calendar,
  BookOpen,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

interface ClubRole {
  clubId: string;
  clubName: string;
  role: string;
}

export function Header() {
  const [activeTab, setActiveTab] = useState("home")
  const [hasToken, setHasToken] = useState(false)
  const { user, logout } = useAuthStore()

  const navItems = [
    { id: "home", label: "Trang chủ", icon: Home, href: "/" },
    { id: "clubs", label: "Câu lạc bộ", icon: Users, href: "/clubs" },
    { id: "events", label: "Sự kiện", icon: Calendar, href: "/events" },
    { id: "my-clubs", label: "Câu lạc bộ của tôi", icon: BookOpen, href: "/club-space" },
  ]

  // Add this after the existing navigation items
  let managedClubs: ClubRole[] = [];
  if (user && Array.isArray(user.club_roles)) {
    const normalized = user.club_roles.map((r: any) => ({
      clubId: r.clubId ?? r.club_id ?? r.club?.id ?? r.club,
      clubName: r.clubName ?? r.club_name ?? r.club?.name ?? '',
      role: r.role,
    }))
    managedClubs = normalized.filter((club) => club.role === "club_manager" && !!club.clubId);
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return "U" // Default fallback
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    try {
      const check = () => {
        const token = localStorage.getItem('club_management_token')
        setHasToken(!!token)
      }
      check()
      window.addEventListener('storage', check)
      return () => window.removeEventListener('storage', check)
    } catch {}
  }, [])

  const isLoggedIn = (() => {
    if (user) return true
    try {
      return !!localStorage.getItem('club_management_token') || hasToken
    } catch {
      return hasToken
    }
  })()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="auth-state" data-state={isLoggedIn ? 'logged-in' : 'logged-out'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              UniVibe
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeTab === item.id
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            {/* Dropdown Quản lý CLB nếu có nhiều hơn 1 club */}
            {managedClubs.length > 1 && (
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium flex items-center"
                >
                  Quản lý CLB
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </Button>
                <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-lg hidden group-hover:block group-focus-within:block z-50">
                  {managedClubs.map((club) => (
                    <Link
                      key={club.clubId}
                      href={`/clubs/${club.clubId}/manage`}
                      className="block px-4 py-2 text-gray-700 hover:bg-accent hover:text-primary text-sm"
                    >
                      {club.clubName}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {managedClubs.length === 1 && (
              <Link
                href={`/clubs/${managedClubs[0].clubId}/manage`}
                className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <span className="text-sm font-medium">Quản lý CLB</span>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu-trigger">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} alt={user.full_name || user.email} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.full_name || user.email}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" data-testid="profile-link">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} data-testid="logout-btn">
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link href="/signup">Đăng ký</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-left ${
                          activeTab === item.id
                            ? "text-primary bg-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  {/* Mobile Club Management */}
                  {managedClubs.length > 1 && (
                    <div className="border-t pt-2 mt-2">
                      <div className="font-semibold px-3 py-2 text-foreground">Quản lý CLB</div>
                      {managedClubs.map((club) => (
                        <Link
                          key={club.clubId}
                          href={`/clubs/${club.clubId}/manage`}
                          className="block px-5 py-2 text-muted-foreground hover:bg-accent hover:text-primary text-base"
                        >
                          {club.clubName}
                        </Link>
                      ))}
                    </div>
                  )}
                  {managedClubs.length === 1 && (
                    <Link
                      href={`/clubs/${managedClubs[0].clubId}/manage`}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-left text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <span>Quản lý CLB</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}