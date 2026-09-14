<template>
  <ul class="chat-card-list" data-widget="treeview" role="menu" data-accordion="false">
    <li v-for="user in users" :key="user.id" class="chat-card-item">
      <a role="button" class="chat-card" @click="onUserClick(user.id)">
        <span class="chat-card-avatar">
          <img :src="user.profile_image || emptyImage" alt="" />
          <span v-if="presenceStore.isOnline(user.id)" class="online-dot"></span>
        </span>
        <span class="chat-card-body">
          <span class="chat-card-row">
            <span class="chat-card-name">{{ user.name }}</span>
          </span>
          <span class="chat-card-row">
            <span class="chat-card-preview text-muted">Start a new conversation</span>
          </span>
        </span>
      </a>
    </li>
  </ul>
</template>

<script setup>
import emptyImage from '@/assets/images/emptyImage.png'
import { LoadingModal, MessageModal, CloseModal } from '@/functions/swal'
import { apiCreatePersonalChat } from '@/functions/api/chat'
import { useRouter } from 'vue-router'
import { useRecentChatsStore } from '@/stores/recentChats'
import { usePresenceStore } from '@/stores/presence'
const recentChatsStore = useRecentChatsStore()
const presenceStore = usePresenceStore()
const router = useRouter()

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
})

async function onUserClick(userId) {
  try {
    LoadingModal('Starting a new conversation...')
    const response = await apiCreatePersonalChat(userId)
    const { data } = response
    recentChatsStore.syncChat(data.chat) // Sync the new chat to the store
    router.push({ name: 'chat.box', params: { chatId: data.chat.id } })
    CloseModal()
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}
</script>

<style scoped>
.chat-card-list {
  list-style: none;
  margin: 0;
  padding: 4px 8px;
}

.chat-card-item {
  margin-bottom: 4px;
}

.chat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm, 10px);
  background-color: rgba(255, 255, 255, 0.03);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.chat-card:hover {
  background-color: rgba(255, 255, 255, 0.08);
  text-decoration: none;
}

.chat-card-avatar {
  position: relative;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
}

.chat-card-avatar img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #28a745;
  border: 2px solid var(--color-sidebar-bg, #1b2140);
  border-radius: 50%;
}

.chat-card-body {
  flex: 1;
  min-width: 0;
}

.chat-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.chat-card-row + .chat-card-row {
  margin-top: 2px;
}

.chat-card-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-card-preview {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
