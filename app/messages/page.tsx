"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, User, MessageCircle, Paperclip, ChevronLeft, MoreVertical, Search, Info, X } from "lucide-react"
import { 
  getConversations, 
  getMessages, 
  sendMessage as sendMessageAction, 
  getOrCreateConversation,
  markConversationAsRead
} from "@/app/actions/messages"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: "text" | "image" | "file"
  fileUrl: string | null
  isRead: boolean
  createdAt: Date
  sender: {
    name: string
    profilePhoto: string | null
  }
}

interface PendingAttachment {
  id: string
  name: string
  url: string
  type: "image" | "file"
}

interface Conversation {
  id: string
  clientId: string
  consultantId: string
  lastMessage: string | null
  lastMessageTime: Date | null
  clientUnread: number
  consultantUnread: number
  client: {
    name: string
    profilePhoto: string | null
  }
  consultant: {
    name: string
    profilePhoto: string | null
  }
}

export default function MessagesPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false) // Mock typing state for UI demo
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const consultantIdParam = searchParams.get("consultantId")
  const clientIdParam = searchParams.get("clientId")

  // Initial Load & Redirection Handling
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }

    const initMessaging = async () => {
      if (!user || !userData) return
      
      setLoadingConversations(true)
      try {
        const convsResult = await getConversations(user.uid)
        let currentConvs = convsResult.success ? (convsResult.data as any[]) : []
        setConversations(currentConvs)

        if (consultantIdParam || clientIdParam) {
          const targetClientId = userData.role === "client" ? user.uid : (clientIdParam || "")
          const targetConsultantId = userData.role === "consultant" ? user.uid : (consultantIdParam || "")

          const redirectResult = await getOrCreateConversation(targetClientId, targetConsultantId)
          if (redirectResult.success && redirectResult.data) {
            const redirectedConv = redirectResult.data as any
            if (!currentConvs.some(c => c.id === redirectedConv.id)) {
              currentConvs = [redirectedConv, ...currentConvs]
              setConversations(currentConvs)
            }
            setSelectedConversation(redirectedConv)
            loadMessages(redirectedConv.id)
          }
        }
      } catch (err) {
        console.error("[MessagesPage] Initialization error:", err)
      } finally {
        setLoadingConversations(false)
      }
    }

    initMessaging()
  }, [user?.uid, userData?.role, consultantIdParam, clientIdParam, loading])

  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true)
    const result = await getMessages(conversationId)
    if (result.success && result.data) {
      setMessages(result.data as any)
      if (userData) {
        markConversationAsRead(conversationId, userData.role as any)
        setConversations(prev => prev.map(c => 
          c.id === conversationId 
            ? { ...c, [userData.role === "client" ? "clientUnread" : "consultantUnread"]: 0 }
            : c
        ))
      }
    }
    setLoadingMessages(false)
  }

  // Pure sending logic
  const sendMessage = async (content: string, type: "text" | "image" | "file" = "text", fileUrl?: string) => {
    if ((!content.trim() && !fileUrl) || !selectedConversation || !user || !userData) return

    const recipientId = userData.role === "client" ? selectedConversation.consultantId : selectedConversation.clientId
    const recipientRole = userData.role === "client" ? "consultant" : "client"

    const result = await sendMessageAction({
      conversationId: selectedConversation.id,
      senderId: user.uid,
      content: content || (type === "image" ? "📷 Image" : "📄 File"),
      recipientId,
      recipientRole: recipientRole as any,
      type,
      fileUrl
    })

    if (!result.success) {
      toast.error(`Failed to send ${type}`)
      return false
    }
    return true
  }

  // Orchestrator for sending text + multiple attachments
  const handleSubmit = async () => {
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !selectedConversation || !user) return
    
    setSending(true)
    let anySuccess = false

    try {
      // 1. Send text message if exists
      if (newMessage.trim()) {
        const ok = await sendMessage(newMessage, "text")
        if (ok) anySuccess = true
      }

      // 2. Send each attachment sequentially
      for (const att of pendingAttachments) {
        const ok = await sendMessage(att.name, att.type, att.url)
        if (ok) anySuccess = true
      }

      if (anySuccess) {
        setNewMessage("")
        setPendingAttachments([])
        loadMessages(selectedConversation.id)
        
        // Update local conversation list for last message preview
        const lastAtt = pendingAttachments[pendingAttachments.length - 1]
        const displayLast = pendingAttachments.length > 0 
          ? (lastAtt.type === "image" ? "📷 Image" : "📄 File")
          : newMessage

        setConversations(prev => prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, lastMessage: displayLast, lastMessageTime: new Date() }
            : c
        ))
      }
    } catch (error) {
       console.error("Send error:", error)
       toast.error("An error occurred while sending")
    } finally {
      setSending(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")
    formData.append("folder", `consultbook/${user.uid}/messages`)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      )
      const data = await response.json()
      
      if (data.secure_url) {
        const type = file.type.startsWith("image/") ? "image" : "file"
        setPendingAttachments(prev => [...prev, {
          id: data.public_id,
          name: file.name,
          url: data.secure_url,
          type
        }])
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload attachment")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const otherUser = userData?.role === "client" ? conv.consultant : conv.client
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const otherUser = selectedConversation && userData ? (userData.role === "client" ? selectedConversation.consultant : selectedConversation.client) : null

  return (
    <div className="fixed inset-0 top-16 bg-white flex overflow-hidden lg:static lg:h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside 
        className={`w-full lg:w-[320px] bg-gray-50/50 border-r border-gray-100 flex-shrink-0 flex flex-col transition-all duration-300 ${selectedConversation ? "hidden lg:flex" : "flex"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h1>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-transparent focus:bg-white focus:ring-0 focus:border-blue-200 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div 
          className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1"
          data-lenis-prevent
        >
          {loadingConversations ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
                <div className="w-24 h-3 bg-gray-200 rounded mb-2" />
                <div className="w-32 h-2 bg-gray-100 rounded" />
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-gray-500">No chats found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const itemUser = userData?.role === "client" ? conv.consultant : conv.client
              const isUnread = (userData?.role === "client" ? conv.clientUnread : conv.consultantUnread) > 0
              const isSelected = selectedConversation?.id === conv.id

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    loadMessages(conv.id)
                  }}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-blue-600 shadow-lg shadow-blue-100" 
                      : "hover:bg-gray-100/80 active:scale-[0.98]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-12 w-12 border-2 ${isSelected ? "border-blue-400" : "border-white shadow-sm"}`}>
                      <AvatarImage src={itemUser?.profilePhoto || ""} className="object-cover" />
                      <AvatarFallback className={isSelected ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}>
                        {itemUser?.name?.charAt(0) || <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                          {itemUser?.name || "User"}
                        </span>
                        <span className={`text-[10px] whitespace-nowrap ml-2 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                          {conv.lastMessageTime ? formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false }) : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className={`text-xs truncate flex-1 ${
                          isSelected ? "text-blue-50" : isUnread ? "text-gray-900 font-semibold" : "text-gray-500"
                        }`}>
                          {conv.lastMessage || "Say hi!"}
                        </p>
                        {isUnread && !isSelected && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col bg-white relative ${!selectedConversation ? "hidden lg:flex" : "flex"}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="h-16 px-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedConversation(null)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {userData?.role === "client" ? (
                   <Link href={`/consultant/${selectedConversation.consultantId}`} className="group flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors pr-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage src={otherUser?.profilePhoto || ""} className="object-cover" />
                      <AvatarFallback className="bg-blue-600 text-white">{otherUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {otherUser?.name}
                      </span>
                      <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                        Active Now
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage src={otherUser?.profilePhoto || ""} className="object-cover" />
                      <AvatarFallback className="bg-blue-600 text-white">{otherUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 leading-tight">
                        {otherUser?.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">Client</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 rounded-full hidden sm:flex">
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f8f9fc] space-y-6 scrollbar-hide"
              data-lenis-prevent
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s] mr-1" />
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s] mr-1" />
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-blue-50">
                    <MessageCircle className="h-10 w-10 text-blue-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Start the conversation</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-[240px]">
                    Share details about your consultation or ask any questions.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.uid
                    const showTime = idx === 0 || 
                      (new Date(msg.createdAt).getTime() - new Date(messages[idx-1].createdAt).getTime() > 300000)
                    
                    return (
                      <div key={msg.id} className="space-y-2">
                        {showTime && (
                           <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`flex flex-col max-w-[75%] lg:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                            {msg.type === "image" && msg.fileUrl && (
                              <div className="mb-2 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <img src={msg.fileUrl} alt="attachment" className="max-w-full h-auto max-h-[300px] object-cover" />
                              </div>
                            )}
                            
                            {msg.type === "file" && msg.fileUrl && (
                              <a 
                                href={msg.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`mb-2 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 border transition-all hover:shadow-md ${
                                  isMe ? "bg-blue-700 border-blue-500 text-white" : "bg-white border-gray-200 text-gray-800"
                                }`}
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="underline decoration-dotted underline-offset-4">{msg.content || "Download File"}</span>
                              </a>
                            )}

                            {(msg.type === "text" || !msg.fileUrl) && (
                              <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                                  isMe 
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" 
                                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                }`}
                              >
                                {msg.content}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t border-gray-100 bg-white">
              {/* Attachments Preview Bar */}
              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 animate-in slide-in-from-bottom-2 duration-300">
                  {pendingAttachments.map((att) => (
                    <div 
                      key={att.id} 
                      className="group relative flex items-center gap-2 bg-blue-50/50 border border-blue-100 p-2 rounded-xl pr-8 min-w-[120px] max-w-[200px]"
                    >
                      {att.type === "image" ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-200">
                          <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <Paperclip className="h-4 w-4" />
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-blue-900 truncate flex-1">
                        {att.name}
                      </span>
                      <button 
                        onClick={() => removeAttachment(att.id)}
                        className="absolute right-1 top-1 w-5 h-5 bg-white border border-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-10 w-10 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip className="h-5 w-5" />
                  )}
                </Button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[44px] max-h-[160px] bg-transparent border-none focus-visible:ring-0 resize-none py-2 px-1 text-sm scrollbar-hide"
                  rows={1}
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={sending || (!newMessage.trim() && pendingAttachments.length === 0 && !uploading)} 
                  size="icon"
                  className={`h-10 w-10 rounded-xl transition-all flex-shrink-0 ${
                    (newMessage.trim() || pendingAttachments.length > 0)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="px-1 mt-2 flex items-center justify-between text-[10px] text-gray-400">
                <p>Press Enter to send, Shift + Enter for new line</p>
                {isTyping && (
                  <span className="italic text-blue-500 font-medium animate-pulse">
                    Consultant is typing...
                  </span>
                )}
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f8f9fc]">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-100 border border-blue-50 max-w-sm">
                <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
                  <MessageCircle className="h-10 w-10 text-white -rotate-3" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Select a Chat</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                   Connect with our expert consultants. Your conversations are secure and private.
                </p>
                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-bold transition-all hover:scale-[1.02]">
                    Find Consultants
                  </Button>
                  <Button variant="ghost" className="w-full text-gray-400 text-xs font-bold rounded-2xl h-10">
                    Terms of Messaging
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />
    </div>
  )
}
