"use server"

import { db } from "@/lib/db"
import { conversations, messages, users } from "@/db/schema"
import { eq, and, or, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getConversations(userId: string) {
  try {
    const userConversations = await db.query.conversations.findMany({
      where: or(
        eq(conversations.clientId, userId),
        eq(conversations.consultantId, userId)
      ),
      with: {
        client: true,
        consultant: true,
      },
      orderBy: [desc(conversations.lastMessageTime)],
    })

    return { success: true, data: userConversations }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return { success: false, error: "Failed to fetch conversations" }
  }
}

export async function getMessages(conversationId: string) {
  try {
    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [messages.createdAt],
      with: {
        sender: true,
      }
    })

    return { success: true, data: chatMessages }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return { success: false, error: "Failed to fetch messages" }
  }
}

export async function sendMessage(data: {
  conversationId: string
  senderId: string
  content: string
  recipientId: string
  recipientRole: "client" | "consultant"
  type?: "text" | "image" | "file"
  fileUrl?: string
}) {
  try {
    // 1. Create the message
    const [newMessage] = await db.insert(messages).values({
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      type: data.type || "text",
      fileUrl: data.fileUrl,
    }).returning()

    // 2. Update conversation last message and unread count
    const unreadField = data.recipientRole === "client" ? "clientUnread" : "consultantUnread"
    
    await db.update(conversations)
      .set({
        lastMessage: data.content,
        lastMessageTime: new Date(),
        [unreadField]: sql`${conversations[unreadField]} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, data.conversationId))
    
    revalidatePath("/messages")
    revalidatePath("/")

    return { success: true, data: newMessage }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getOrCreateConversation(clientId: string, consultantId: string) {
  console.log("[getOrCreateConversation] Input:", { clientId, consultantId });
  try {
    if (!clientId || !consultantId) {
      return { success: false, error: "Missing clientId or consultantId" }
    }

    // Check if conversation exists
    let conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.clientId, clientId),
        eq(conversations.consultantId, consultantId)
      ),
      with: {
        client: true,
        consultant: true,
      }
    })

    if (!conversation) {
      console.log("[getOrCreateConversation] No existing conversation. Creating new one...");
      // Check if users exist to avoid FK constraint error
      const clientExists = await db.query.users.findFirst({ where: eq(users.uid, clientId) });
      const consultantExists = await db.query.users.findFirst({ where: eq(users.uid, consultantId) });

      if (!clientExists || !consultantExists) {
        console.error("[getOrCreateConversation] One or both users not found:", { 
          clientExists: !!clientExists, 
          consultantExists: !!consultantExists 
        });
        return { success: false, error: "Recipient or Sender not found in database" }
      }

      // Create new conversation
      const [newConv] = await db.insert(conversations).values({
        clientId,
        consultantId,
      }).returning()

      console.log("[getOrCreateConversation] New conversation created:", newConv.id);

      // Fetch with relations
      conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, newConv.id),
        with: {
          client: true,
          consultant: true,
        }
      })
    }

    return { success: true, data: conversation }
  } catch (error: any) {
    console.error("[getOrCreateConversation] Caught error:", error)
    return { success: false, error: `Database error: ${error.message || "Unknown"}` }
  }
}

export async function markConversationAsRead(conversationId: string, role: "client" | "consultant") {
  try {
    const unreadField = role === "client" ? "clientUnread" : "consultantUnread"
    
    await db.update(conversations)
      .set({
        [unreadField]: 0,
      })
      .where(eq(conversations.id, conversationId))
    
    revalidatePath("/messages")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error marking conversation as read:", error)
    return { success: false, error: "Failed to mark as read" }
  }
}

export async function getTotalUnreadMessages(userId: string) {
  try {
    const userConversations = await db.query.conversations.findMany({
      where: or(
        eq(conversations.clientId, userId),
        eq(conversations.consultantId, userId)
      ),
    })

    const totalUnread = userConversations.reduce((total, conv) => {
      if (conv.clientId === userId) {
        return total + conv.clientUnread
      } else {
        return total + conv.consultantUnread
      }
    }, 0)

    return { success: true, count: totalUnread }
  } catch (error) {
    console.error("Error getting total unread messages:", error)
    return { success: false, count: 0 }
  }
}
