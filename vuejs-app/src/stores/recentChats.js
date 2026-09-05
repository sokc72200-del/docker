import axios from 'axios'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
import { apiTogglePinChat, apiToggleMuteChat, apiToggleArchiveChat } from '@/functions/api/chat'

// Track subscribed chat channels (module-level, not in state)
const subscribedChatMessageIds = new Set()

// Track per-chat typing auto-clear timers (module-level, not in state)
const typingTimers = new Map()
const TYPING_TIMEOUT_MS = 3000

export const useRecentChatsStore = defineStore('recentChats', {
  state: () => ({
    chats: [],
    typingUsers: {}, // { [chatId]: { [userId]: userName } }
    activeChatId: null, // the chatId currently open on screen, used to suppress unread increments
  }),
  getters: {
    // Reactive getter - automatically updates components when store changes
    getChatById: (state) => (chatId) => {
      return state.chats.find((chat) => chat.id === Number(chatId)) || null
    },
    // Get all chats sorted
    getAllChats: (state) => state.chats,
    // Names of users currently typing in a given chat
    getTypingUsers: (state) => (chatId) => {
      return Object.values(state.typingUsers[chatId] || {})
    },
  },
  actions: {
    sortChatMessages(chat) {
      chat.messages.sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at)
      })
    },
    sortChats() {
      // Sort messages within each chat first
      this.chats.forEach((chat) => {
        this.sortChatMessages(chat)
      })

      // Then sort chats: pinned chats first, then by the date of the last message
      this.chats.sort((a, b) => {
        const aPinned = a.is_pinned ? 1 : 0
        const bPinned = b.is_pinned ? 1 : 0
        if (aPinned !== bPinned) {
          return bPinned - aPinned
        }

        const lastMessageA =
          a.messages.length > 0
            ? new Date(a.messages[a.messages.length - 1].created_at)
            : new Date(a.created_at)
        const lastMessageB =
          b.messages.length > 0
            ? new Date(b.messages[b.messages.length - 1].created_at)
            : new Date(b.created_at)
        return lastMessageB - lastMessageA
      })
    },
    setActiveChatId(chatId) {
      this.activeChatId = Number(chatId)
    },

    clearActiveChatId() {
      this.activeChatId = null
    },

    resetUnreadCount(chatId) {
      const chat = this.getChatById(chatId)
      if (chat) {
        chat.unread_count = 0
      }
    },

    async togglePinChat(chatId) {
      const chat = this.getChatById(chatId)
      if (!chat) return
      const response = await apiTogglePinChat(chatId)
      chat.is_pinned = response.data.is_pinned
      this.sortChats()
    },

    async toggleMuteChat(chatId) {
      const chat = this.getChatById(chatId)
      if (!chat) return
      const response = await apiToggleMuteChat(chatId)
      chat.is_muted = response.data.is_muted
    },

    async toggleArchiveChat(chatId) {
      const response = await apiToggleArchiveChat(chatId)
      if (response.data.is_archived) {
        // Archived: remove it from the active sidebar list
        this.removeChat(chatId)
      }
      return response.data.is_archived
    },
    syncMultiChats(chats) {
      for (const chat of chats) {
        const index = this.chats.findIndex((c) => Number(c.id) === Number(chat.id))
        if (index !== -1) {
          this.chats[index] = chat
        } else {
          this.chats.push(chat)
        }
        this.subscribeToChatMessageEvents(chat.id) // Subscribe to chat message events for each chat
      }
      this.sortChats()
    },
    syncChat(chat) {
      // Update existing chat or add if not found
      const index = this.chats.findIndex((c) => Number(c.id) === Number(chat.id))
      if (index !== -1) {
        this.chats[index] = chat
      } else {
        this.chats.push(chat)
      }
      this.subscribeToChatMessageEvents(chat.id) // Subscribe to chat message events for each chat
      this.sortChats()
    },
    removeChat(chatId) {
      // Remove chat from store
      this.chats = this.chats.filter((c) => Number(c.id) !== Number(chatId))
      this.unsubscribeFromChatMessageEvents(chatId)
    },
    syncMultiChatMessages(chatId, messages) {
      const chat = this.getChatById(chatId)
      if (chat) {
        for (const message of messages) {
          const index = chat.messages.findIndex((m) => Number(m.id) === Number(message.id))
          if (index !== -1) {
            chat.messages[index] = message
            this.loadFile(chat.messages[index]) // reactive reference
          } else {
            chat.messages.push(message)
            this.loadFile(chat.messages[chat.messages.length - 1]) // reactive reference
          }
        }
        this.sortChats()
      }
    },
    syncChatMessage(chatId, message) {
      const chat = this.getChatById(chatId)
      if (chat) {
        const index = chat.messages.findIndex((m) => Number(m.id) === Number(message.id))
        const isNewMessage = index === -1
        if (index !== -1) {
          chat.messages[index] = message
          this.loadFile(chat.messages[index]) // reactive reference
        } else {
          chat.messages.push(message)
          this.loadFile(chat.messages[chat.messages.length - 1]) // reactive reference
        }
        // Unread count bookkeeping: only bump it for a brand new message from
        // someone else, and only when that chat isn't the one currently open.
        if (isNewMessage) {
          const userStore = useUserStore()
          const isOwnMessage = Number(message.creator?.id) === Number(userStore.id)
          const isActiveChat = Number(this.activeChatId) === Number(chatId)
          if (!isOwnMessage && !isActiveChat && !chat.is_muted) {
            chat.unread_count = (chat.unread_count || 0) + 1
          }
        }
        this.sortChats()
      }
    },
    async loadFile(message) {
      if (message.type === 'text' || message.fileBlob) {
        return
      }
      const response = await axios.get(message.file_path, {
        responseType: 'blob',
      })
      message.fileBlob = URL.createObjectURL(response.data)
    },
    removeChatMessage(chatId, messageId) {
      const chat = this.getChatById(chatId)
      if (chat) {
        chat.messages = chat.messages.filter((m) => Number(m.id) !== Number(messageId))
        this.sortChats()
      }
    },
    subscribeToChatEvents() {
      const userStore = useUserStore()
      window.Echo.private(`ChatEvent.${userStore.id}`)
        .listen('.ChatCreated', async ({ chat }) => {
          this.syncChat(chat)
        })
        .listen('.ChatUpdated', async ({ chat }) => {
          this.syncChat(chat)
        })
        .listen('.ChatDeleted', ({ chat_id }) => {
          this.removeChat(chat_id)
        })
    },
    subscribeToChatMessageEvents(chatId) {
      // Check if already subscribed
      if (subscribedChatMessageIds.has(chatId)) {
        return
      }

      window.Echo.private(`MessageEvent.${chatId}`)
        .listen('.MessageCreated', async ({ message }) => {
          this.syncChatMessage(chatId, message)
          this.clearTypingUser(chatId, message.creator.id)
        })
        .listen('.MessageUpdated', async ({ message }) => {
          this.syncChatMessage(chatId, message)
        })
        .listen('.MessageDeleted', async ({ message_id }) => {
          this.removeChatMessage(chatId, message_id)
        })
        .listen('.UserTyping', ({ user }) => {
          this.setTypingUser(chatId, user)
        })

      // Mark as subscribed
      subscribedChatMessageIds.add(chatId)
    },

    unsubscribeFromChatMessageEvents(chatId) {
      if (subscribedChatMessageIds.has(chatId)) {
        window.Echo.leave(`MessageEvent.${chatId}`)
        subscribedChatMessageIds.delete(chatId)
      }
      this.clearAllTypingUsers(chatId)
    },

    setTypingUser(chatId, user) {
      if (!this.typingUsers[chatId]) {
        this.typingUsers[chatId] = {}
      }
      this.typingUsers[chatId][user.id] = user.name

      // Reset the auto-clear timer for this user
      const timerKey = `${chatId}:${user.id}`
      clearTimeout(typingTimers.get(timerKey))
      typingTimers.set(
        timerKey,
        setTimeout(() => {
          this.clearTypingUser(chatId, user.id)
        }, TYPING_TIMEOUT_MS),
      )
    },

    clearTypingUser(chatId, userId) {
      if (this.typingUsers[chatId]) {
        delete this.typingUsers[chatId][userId]
      }
      const timerKey = `${chatId}:${userId}`
      clearTimeout(typingTimers.get(timerKey))
      typingTimers.delete(timerKey)
    },

    clearAllTypingUsers(chatId) {
      if (this.typingUsers[chatId]) {
        Object.keys(this.typingUsers[chatId]).forEach((userId) => {
          const timerKey = `${chatId}:${userId}`
          clearTimeout(typingTimers.get(timerKey))
          typingTimers.delete(timerKey)
        })
        delete this.typingUsers[chatId]
      }
    },
  },
})
