"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getNotifications, markNotificationAsRead, markAllAsRead } from "@/app/actions/notifications"
import { getTotalUnreadMessages } from "@/app/actions/messages"
import { 
  Menu, 
  X, 
  Calendar, 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  User, 
  LogOut,
  Settings,
  Bell,
  CheckCircle,
  ShoppingCart,
  BookOpen
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { GlobalSearch } from "@/components/search/GlobalSearch"
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  userId: string
  title: string
  content: string
  type: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}

interface NavbarProps {
  notifications?: Notification[]
  unreadCount?: number
  onNotificationRead?: (notificationId: string) => void
  onNotificationClick?: (notification: Notification) => void
}

export function Navbar({ notifications: propNotifications = [], unreadCount: propUnreadCount = 0, onNotificationRead, onNotificationClick }: NavbarProps) {
  const { user, userData, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [desktopNotificationsOpen, setDesktopNotificationsOpen] = useState(false)
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [logoutOpen, setLogoutOpen] = useState(false)
  
  // Local state for notifications (fetched from Firestore)










  const [notifications, setNotifications] = useState<Notification[]>(propNotifications)
  const [unreadCount, setUnreadCount] = useState(propUnreadCount)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)

  // Fetch notifications from Firestore for logged-in users
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setUnreadMessagesCount(0)
      return
    }

    const fetchNotificationsData = async () => {
      try {
        const result = await getNotifications(user.uid)
        if (result.success && result.data) {
          setNotifications(result.data as unknown as Notification[])
          setUnreadCount(result.data.filter((n: any) => !n.isRead).length)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    const fetchUnreadMessagesCount = async () => {
      try {
        const result = await getTotalUnreadMessages(user.uid)
        if (result.success) {
          setUnreadMessagesCount(result.count)
        }
      } catch (error) {
        console.error("Error fetching unread messages count:", error)
      }
    }

    fetchNotificationsData()
    fetchUnreadMessagesCount()

    // Poll for notifications and messages every 60 seconds
    const interval = setInterval(() => {
      fetchNotificationsData()
      fetchUnreadMessagesCount()
    }, 60000)

    // Listen for custom events
    const handleMessagesRead = () => fetchUnreadMessagesCount()
    window.addEventListener("messagesRead", handleMessagesRead)

    return () => {
      clearInterval(interval)
      window.removeEventListener("messagesRead", handleMessagesRead)
    }
  }, [user])

  // Load cart count
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("consultbook_cart")
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        setCartCount(cart.length)
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()

    // Listen for storage events (when cart is updated)
    window.addEventListener("storage", updateCartCount)
    
    // Custom event for same-tab updates
    const handleCartUpdate = () => updateCartCount()
    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [])

  // Check if user is admin - AFTER all hooks defined
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminSession') !== null
  
  // Don't render navbar for admin users
  if (isAdmin || pathname.startsWith('/dashboard/admin')) {
    return null
  }

  // Mark notification as read
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => prev.map((n) => n.id === notificationId ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (onNotificationRead) onNotificationRead(notificationId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    try {
      await markAllAsRead(user.uid)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error: any) {
      toast.error("Error logging out")
    }
  }

  const getDashboardHref = () => {
    if (userData?.role === 'admin') return '/dashboard/admin'
    if (userData?.role === 'consultant') return '/dashboard/consultant'
    return '/dashboard/client'
  }

  const getProfileHref = () => {
    if (userData?.role === 'consultant') return '/consultant/profile'
    if (userData?.role === 'client') return '/client/profile'
    return '/profile'
  }

  const navLinks = [
    { name: "Home", href: "/", icon: Calendar },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Sessions", href: "/sessions", icon: Calendar },
    ...(user ? [
      { name: "Dashboard", href: getDashboardHref(), icon: LayoutDashboard },
      { name: "Consultants", href: "/book-consultant", icon: Search },
    ] : [
      { name: "Consultants", href: "/book-consultant", icon: Search },
      { name: "Help", href: "/help", icon: MessageSquare },
      { name: "Contact", href: "/contact", icon: MessageSquare }
    ]),
  ]

  const isActive = (path: string) => pathname === path


  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                ConsultBook
              </span>
            </Link>

            {/* Global Search - Desktop */}
            <div className="hidden lg:block">
              <GlobalSearch />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 xl:px-4 font-medium transition-colors ${
                    isActive(link.href) 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            {!loading && (
              <>
                {user ? (
                    <div className="flex items-center gap-3">
                    <Link href="/messages">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`text-gray-500 hover:text-blue-600 h-10 w-10 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 relative ${
                          isActive("/messages") ? "text-blue-600 bg-blue-50 border-gray-100" : ""
                        }`}
                      >
                        <MessageSquare className="h-5 w-5" />
                        {unreadMessagesCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </Button>
                    </Link>

                    <Link href="/cart">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`text-gray-500 hover:text-blue-600 h-10 w-10 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 relative ${
                          isActive("/cart") ? "text-blue-600 bg-blue-50 border-gray-100" : ""
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                            {cartCount}
                          </span>
                        )}
                      </Button>
                    </Link>

                    <DropdownMenu open={desktopNotificationsOpen} onOpenChange={setDesktopNotificationsOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:text-blue-600 relative h-10 w-10 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100"
                      >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-xl border-gray-100 mt-1">
                      <div className="flex items-center justify-between px-3 py-2 mb-1">
                        <DropdownMenuLabel className="font-bold text-base p-0">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <ScrollArea className="h-[400px]">
                        <div className="p-1">
                          {notifications && notifications.length > 0 ? (
                            <div className="grid gap-1">
                              {notifications.map((n) => (
                                <div
                                  key={n.id}
                                  className={`p-3 rounded-xl cursor-pointer transition-all relative group ${
                                    !n.isRead ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    handleMarkNotificationAsRead(n.id)
                                    if (onNotificationClick) onNotificationClick(n)
                                    setDesktopNotificationsOpen(false)
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm leading-tight ${!n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                      {n.title}
                                    </p>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{n.content}</p>
                                  
                                  {/* User liked the checkmark design from dashboard */}
                                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                                  </div>
                                  
                                  {!n.isRead && (
                                    <div className="absolute right-3 top-3 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 px-4">
                              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="h-6 w-6 text-gray-300" />
                              </div>
                              <p className="text-gray-500 text-sm font-medium">All caught up!</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">No new notifications.</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-gray-100 p-0">
                          <Avatar className="h-full w-full">
                            <AvatarImage src={userData?.profilePhoto} className="object-cover" />
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                              {userData?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{userData?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={getDashboardHref()} className="flex items-center gap-2 cursor-pointer py-2">
                            <LayoutDashboard className="h-4 w-4 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        {userData?.role === 'consultant' && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/consultant/sessions" className="flex items-center gap-2 cursor-pointer py-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>My Sessions</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/consultant/products" className="flex items-center gap-2 cursor-pointer py-2">
                                <BookOpen className="h-4 w-4 text-gray-500" />
                                <span>My Products</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/client/purchases" className="flex items-center gap-2 cursor-pointer py-2">
                                <ShoppingCart className="h-4 w-4 text-gray-500" />
                                <span>My Purchases</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/client/sessions" className="flex items-center gap-2 cursor-pointer py-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>My Registered Sessions</span>
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        {userData?.role === 'client' && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/client/purchases" className="flex items-center gap-2 cursor-pointer py-2">
                                <ShoppingCart className="h-4 w-4 text-gray-500" />
                                <span>My Purchases</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/client/sessions" className="flex items-center gap-2 cursor-pointer py-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>My Sessions</span>
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={getProfileHref()} className="flex items-center gap-2 cursor-pointer py-2">
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span>Settings & Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 cursor-pointer py-2 text-red-600 focus:text-red-600">
                              <LogOut className="h-4 w-4" />
                              <span>Log out</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You will be signed out of your account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex justify-end gap-3">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Logout</AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="font-semibold text-gray-700">Log in</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold px-5">Get Started</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Toggle & Actions */}
          <div className="lg:hidden flex items-center gap-2 ml-auto">
            <GlobalSearch />
            {!loading && user && (
              <Link href="/messages">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500 relative"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center bg-blue-600">
                      {unreadMessagesCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            {!loading && user && (
              <DropdownMenu open={mobileNotificationsOpen} onOpenChange={setMobileNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-80 rounded-2xl p-2 shadow-xl border-gray-100 mt-2 mx-4">
                   <div className="flex items-center justify-between px-3 py-2">
                        <DropdownMenuLabel className="font-bold text-base p-0">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                            className="text-xs text-blue-600 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                   </div>
                   <DropdownMenuSeparator />
                   <ScrollArea className="h-[400px]">
                      <div className="p-1">
                        {notifications && notifications.length > 0 ? (
                          <div className="grid gap-1">
                            {notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 rounded-xl cursor-pointer relative ${
                                  !n.isRead ? "bg-blue-50/50" : ""
                                }`}
                                onClick={() => {
                                  handleMarkNotificationAsRead(n.id)
                                  if (onNotificationClick) onNotificationClick(n)
                                  setMobileNotificationsOpen(false)
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm leading-tight ${!n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{n.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                             <p className="text-gray-500 text-sm">No notifications yet</p>
                          </div>
                        )}
                      </div>
                   </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-none">
                <div className="flex flex-col h-full bg-white">
                  <SheetHeader className="p-6 text-left border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">ConsultBook</span>
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-6 px-4">
                    {user && (
                      <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={userData?.profilePhoto} className="object-cover" />
                          <AvatarFallback className="bg-blue-600 text-white font-bold uppercase">
                            {userData?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{userData?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
                        </div>
                      </div>
                    )}

                    <nav className="space-y-1">
                      {navLinks.map((link) => (
                        <Link 
                          key={link.name} 
                          href={link.href} 
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                            isActive(link.href) 
                              ? "bg-blue-50 text-blue-600 font-semibold" 
                              : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                          }`}
                        >
                          <link.icon className={`h-5 w-5 ${isActive(link.href) ? "text-blue-600" : "text-gray-400"}`} />
                          <span className="text-base">{link.name}</span>
                        </Link>
                      ))}
                    </nav>

                    {user && (
                      <div className="mt-8 pt-8 border-t border-gray-50">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">My Items</h3>
                        <div className="space-y-1">
                          {userData?.role === 'consultant' && (
                            <>
                              <Link 
                                href="/dashboard/consultant/products" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                              >
                                <BookOpen className="h-5 w-5 text-gray-400" />
                                <span className="text-base">My Products</span>
                              </Link>
                              <Link 
                                href="/dashboard/client/purchases" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                              >
                                <ShoppingCart className="h-5 w-5 text-gray-400" />
                                <span className="text-base">My Purchases</span>
                              </Link>
                              <Link 
                                href="/dashboard/client/sessions" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                              >
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <span className="text-base">My Registered Sessions</span>
                              </Link>
                            </>
                          )}
                          {userData?.role === 'client' && (
                            <>
                              <Link 
                                href="/dashboard/client/purchases" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                              >
                                <ShoppingCart className="h-5 w-5 text-gray-400" />
                                <span className="text-base">My Purchases</span>
                              </Link>
                              <Link 
                                href="/dashboard/client/sessions" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                              >
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <span className="text-base">My Sessions</span>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-gray-50">
                      <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
                      <div className="space-y-1">
                        {user ? (
                          <>
                            <Link 
                              href={getProfileHref()} 
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                            >
                              <Settings className="h-5 w-5 text-gray-400" />
                              <span className="text-base">Settings & Profile</span>
                            </Link>
                            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                              <AlertDialogTrigger asChild>
                                <button 
                                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <LogOut className="h-5 w-5" />
                                  <span className="text-base font-medium">Log out</span>
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    You will be signed out of your account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-3">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => { handleLogout(); setIsOpen(false); }} className="bg-red-600 hover:bg-red-700">Logout</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <>
                            <Link 
                              href="/login" 
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                            >
                              <User className="h-5 w-5 text-gray-400" />
                              <span className="text-base">Log in</span>
                            </Link>
                            <Link 
                              href="/register" 
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-4 px-4 py-3 mt-2 rounded-xl bg-blue-600 text-white font-semibold"
                            >
                              <span className="w-full text-center">Get Started</span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
