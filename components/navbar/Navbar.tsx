"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  Bell
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
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
  type: string
  title: string
  message: string
  appointmentId?: string
  createdAt: string
  read: boolean
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
  const [isOpen, setIsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  
  // Local state for notifications (fetched from Firestore)
  const [notifications, setNotifications] = useState<Notification[]>(propNotifications)
  const [unreadCount, setUnreadCount] = useState(propUnreadCount)

  // Fetch notifications from Firestore for logged-in users
  useEffect(() => {
    if (!user || !userData) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, "notifications")
        const q = query(notificationsRef, where("recipientId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const notificationsList: Notification[] = []
        querySnapshot.forEach((doc) => {
          notificationsList.push({ id: doc.id, ...doc.data() } as Notification)
        })

        // Sort by date
        notificationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setNotifications(notificationsList)
        setUnreadCount(notificationsList.filter((n) => !n.read).length)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()
  }, [user, userData])

  // Mark notification as read
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date().toISOString(),
      })

      setNotifications(notifications.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
      setUnreadCount(Math.max(0, unreadCount - 1))
      
      if (onNotificationRead) onNotificationRead(notificationId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully")
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
    ...(user ? [
      { name: "Dashboard", href: getDashboardHref(), icon: LayoutDashboard },
      ...(userData?.role === 'client' ? [{ name: "Find Consultants", href: "/book-consultant", icon: Search }] : []),
      { name: "Messages", href: "/messages", icon: MessageSquare },
    ] : [{name: "How It Works", href: "/about", icon: MessageSquare}, {name: "Help", href: "/help", icon: MessageSquare}, {name: "Contact", href: "/contact", icon: MessageSquare}]),
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              ConsultBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-4 font-medium transition-colors ${
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
          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-500 hover:text-blue-600 relative"
                        >
                          <Bell className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Notifications</DialogTitle>
                          <DialogDescription>Recent updates and alerts</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          {notifications && notifications.length > 0 ? (
                            notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  !notification.read ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  handleMarkNotificationAsRead(notification.id)
                                  if (onNotificationClick) onNotificationClick(notification)
                                }}
                              >
                                <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No notifications yet</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
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

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {!loading && user && (
              <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DialogTrigger asChild>
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
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>Recent updates and alerts</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            !notification.read ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            handleMarkNotificationAsRead(notification.id)
                            if (onNotificationClick) onNotificationClick(notification)
                            setNotificationsOpen(false)
                          }}
                        >
                          <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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
