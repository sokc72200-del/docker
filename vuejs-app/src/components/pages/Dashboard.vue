<template>
  <div class="content-wrapper">
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Dashboard</h1>
          </div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'dashboard' }">Home</router-link>
              </li>
              <li class="breadcrumb-item active">Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="container-fluid">
        <!-- Welcome -->
        <div class="welcome-card mb-4">
          <div class="welcome-text">
            <h2>Welcome back, {{ userStore.name }} 👋</h2>
            <p>Here’s what’s happening in your chats today.</p>
          </div>
          <router-link :to="{ name: 'chat.create' }" class="btn-new-chat">
            <i class="fas fa-plus mr-1"></i> New Chat
          </router-link>
        </div>

        <!-- Stats -->
        <div class="row">
          <div class="col-lg-4 col-md-6 mb-3">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="fas fa-comments"></i>
              </div>
              <div class="stat-info">
                <h3>{{ totalChats }}</h3>
                <p>Total Chats</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-3">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="stat-info">
                <h3>{{ totalUnread }}</h3>
                <p>Unread Messages</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-3" v-if="userStore.isAdmin">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-info">
                <h3>—</h3>
                <p>Users (Admin)</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-3" v-else>
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="fas fa-user"></i>
              </div>
              <div class="stat-info">
                <h3>Profile</h3>
                <p>
                  <router-link :to="{ name: 'profile' }">View profile</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent chats -->
        <div class="card recent-chats-card">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h3 class="card-title mb-0">
              <i class="fas fa-clock mr-2"></i> Recent Chats
            </h3>
            <router-link :to="{ name: 'chat.create' }" class="btn btn-sm btn-outline-primary">
              Start new chat
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="recentChats.length === 0" class="empty-state">
              <i class="fas fa-comments fa-2x mb-2"></i>
              <p>No chats yet. Start a conversation!</p>
              <router-link :to="{ name: 'chat.create' }" class="btn btn-primary btn-sm">
                New Chat
              </router-link>
            </div>

            <ul v-else class="recent-list">
              <li
                v-for="chat in recentChats"
                :key="chat.id"
                class="recent-item"
                @click="openChat(chat.id)"
              >
                <img
                  :src="chatAvatar(chat)"
                  class="recent-avatar"
                  alt="avatar"
                />
                <div class="recent-info">
                  <div class="d-flex justify-content-between">
                    <strong>{{ chatName(chat) }}</strong>
                    <span class="time">{{ lastMessageTime(chat) }}</span>
                  </div>
                  <div class="preview">
                    <span v-if="chat.unread_count" class="badge badge-primary mr-1">
                      {{ chat.unread_count }}
                    </span>
                    {{ lastMessagePreview(chat) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRecentChatsStore } from '@/stores/recentChats'
import { formatChatTime } from '@/functions/datetime'
import emptyImage from '@/assets/images/emptyImage.png'

const router = useRouter()
const userStore = useUserStore()
const recentChatsStore = useRecentChatsStore()

const recentChats = computed(() => {
  return [...recentChatsStore.chats].slice(0, 8)
})

const totalChats = computed(() => recentChatsStore.chats.length)

const totalUnread = computed(() => {
  return recentChatsStore.chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0)
})

function chatName(chat) {
  if (!chat) return 'Chat'

  if (chat.type === 'group') {
    return chat.name || 'Group Chat'
  }

  const members = chat.members || []
  const myId = Number(userStore.id)

  // Support both shapes: member.user.id and member.user_id
  const other = members.find((m) => {
    const memberUserId = Number(m.user?.id ?? m.user_id)
    return memberUserId && memberUserId !== myId
  })

  return (
    other?.user?.name ||
    other?.name ||
    chat.name ||
    'Chat'
  )
}

function chatAvatar(chat) {
  if (!chat) return emptyImage

  if (chat.type === 'group') {
    return chat.avatar || emptyImage
  }

  const members = chat.members || []
  const myId = Number(userStore.id)

  const other = members.find((m) => {
    const memberUserId = Number(m.user?.id ?? m.user_id)
    return memberUserId && memberUserId !== myId
  })

  return other?.user?.profile_thumbnail || other?.profile_thumbnail || emptyImage
}

function lastMessagePreview(chat) {
  const messages = chat.messages || []
  if (!messages.length) return 'Start a new conversation'

  const last = messages[messages.length - 1]
  if (last.type === 'image') return '📷 Image'
  if (last.type === 'voice') return '🎤 Voice message'

  const text = last.content || ''
  return text.length > 40 ? text.slice(0, 40) + '...' : text
}

function lastMessageTime(chat) {
  const messages = chat.messages || []
  if (!messages.length) return ''
  return formatChatTime(messages[messages.length - 1].created_at)
}

function openChat(chatId) {
  router.push({ name: 'chat.box', params: { chatId } })
}
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #5b6ef5, #7c6ff0);
  border-radius: 16px;
  padding: 24px 28px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-text h2 {
  margin: 0 0 6px;
  font-size: 1.4rem;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.btn-new-chat {
  display: inline-flex;
  align-items: center;
  background: #ffffff !important;
  color: #5b6ef5 !important;
  border: none !important;
  border-radius: 10px;
  font-weight: 600;
  padding: 10px 18px;
  text-decoration: none !important;
  white-space: nowrap;
  transition: background 0.15s, transform 0.15s;
}

.btn-new-chat:hover {
  background: #f0f2ff !important;
  color: #4c5ee8 !important;
  transform: translateY(-1px);
}

.stat-card {
  background: var(--color-card-bg, #fff);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(27, 33, 64, 0.08);
  height: 100%;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.bg-primary {
  background: #5b6ef5;
}

.stat-icon.bg-warning {
  background: #f59e0b;
}

.stat-icon.bg-success {
  background: #10b981;
}

.stat-icon.bg-info {
  background: #3b82f6;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary, #1b2140);
}

.stat-info p {
  margin: 2px 0 0;
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.9rem;
}

.recent-chats-card {
  border-radius: 14px;
  border: none;
  box-shadow: 0 4px 16px rgba(27, 33, 64, 0.08);
}

.recent-chats-card .card-header {
  background: transparent;
  border-bottom: 1px solid var(--color-border, #e5e7f0);
  padding: 16px 20px;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--color-text-secondary, #6b7280);
}

.recent-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border, #e5e7f0);
  transition: background 0.15s;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  background: rgba(91, 110, 245, 0.06);
}

.recent-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-info .time {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
}

.recent-info .preview {
  font-size: 0.88rem;
  color: var(--color-text-secondary, #6b7280);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.badge-primary {
  background: #5b6ef5;
}

/* Dark mode tweaks */
body.dark-mode .stat-card {
  background: var(--color-card-bg, #1f2444);
}

body.dark-mode .recent-item:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>