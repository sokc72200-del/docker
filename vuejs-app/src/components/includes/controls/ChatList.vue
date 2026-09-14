<template>
  <ul class="chat-card-list" data-widget="treeview" role="menu" data-accordion="false">
    <li v-for="chat in chats" :key="chat.id" class="chat-card-item">
      <RouterLink
        :to="{ name: 'chat.box', params: { chatId: chat.id } }"
        class="chat-card"
        active-class="chat-card-active"
        role="button"
      >
        <span class="chat-card-avatar">
          <img :src="chat.avatar || emptyImage" alt="" />
          <span
            v-if="chat.type === 'personal' && presenceStore.isOnline(chat.other_user_id)"
            class="online-dot"
          ></span>
          <span v-if="chat.unread_count > 0" class="unread-badge">{{
            chat.unread_count > 9 ? '9+' : chat.unread_count
          }}</span>
        </span>

        <span class="chat-card-body">
          <span class="chat-card-row">
            <span class="chat-card-name">
              <i v-if="chat.is_pinned" class="fas fa-thumbtack pin-indicator" title="Pinned"></i>
              {{ chat.name }}
            </span>
            <span class="chat-card-time">{{
              lastMessage(chat) ? formatChatTime(lastMessage(chat).created_at) : ''
            }}</span>
          </span>
          <span class="chat-card-row">
            <span class="chat-card-preview">
              <span v-if="isOwnMessage(lastMessage(chat))" class="font-weight-bold">You: </span>
              <span v-if="!lastMessage(chat)" class="font-weight-bold"
                >Start a new conversation</span
              >
              <span
                v-else
                :class="{
                  'font-weight-bold':
                    !isSeen(lastMessage(chat)) && !isOwnMessage(lastMessage(chat)),
                }"
                >{{ lastMessage(chat).content }}</span
              >
            </span>
            <span class="chat-card-actions">
              <i
                class="fas fa-thumbtack"
                :class="{ active: chat.is_pinned }"
                title="Pin chat"
                @click.stop.prevent="onPinClick(chat.id)"
              ></i>
              <i
                class="fas fa-bell-slash"
                :class="{ active: chat.is_muted }"
                title="Mute chat"
                @click.stop.prevent="onMuteClick(chat.id)"
              ></i>
              <i
                class="fas fa-box-archive"
                title="Archive chat"
                @click.stop.prevent="onArchiveClick(chat.id)"
              ></i>
            </span>
          </span>
        </span>
      </RouterLink>
    </li>
  </ul>
</template>

<script setup>
import emptyImage from '@/assets/images/emptyImage.png'
import { formatChatTime } from '@/functions/datetime'
import { useUserStore } from '@/stores/user'
import { usePresenceStore } from '@/stores/presence'
import { useRecentChatsStore } from '@/stores/recentChats'
import Swal from 'sweetalert2'

const userStore = useUserStore()
const presenceStore = usePresenceStore()
const recentChatsStore = useRecentChatsStore()
const props = defineProps({
  chats: {
    type: Array,
    required: true,
  },
})

function lastMessage(chat) {
  return chat.messages[chat.messages.length - 1] || null
}

function isOwnMessage(message) {
  if (!message) return false
  return message.creator.id === userStore.id
}

function isSeen(message) {
  if (!message) return false
  return message.seen_at !== null
}

async function onPinClick(chatId) {
  await recentChatsStore.togglePinChat(chatId)
}

async function onMuteClick(chatId) {
  await recentChatsStore.toggleMuteChat(chatId)
}

async function onArchiveClick(chatId) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Archive Chat',
    text: 'Archived chats are hidden from your list. You can unarchive them later.',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, archive it',
  })
  if (result.isConfirmed) {
    await recentChatsStore.toggleArchiveChat(chatId)
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
  transition: background-color 0.15s ease;
}

.chat-card:hover {
  background-color: rgba(255, 255, 255, 0.08);
  text-decoration: none;
}

.chat-card-active {
  background-color: var(--color-accent, #5b6ef5) !important;
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

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #dc3545;
  border: 2px solid var(--color-sidebar-bg, #1b2140);
  border-radius: 999px;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
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

.pin-indicator {
  font-size: 10px;
  color: #ffc107;
  margin-right: 4px;
  transform: rotate(45deg);
  display: inline-block;
}

.chat-card-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
}

.chat-card-preview {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.chat-card-active .chat-card-preview,
.chat-card-active .chat-card-time,
.chat-card-active .chat-card-name {
  color: #fff !important;
}

.chat-card-actions {
  display: flex;
  gap: 7px;
  flex-shrink: 0;
}

.chat-card-actions i {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    color 0.15s ease;
}

.chat-card:hover .chat-card-actions i {
  opacity: 1;
}

.chat-card-actions i:hover {
  color: #fff;
}

.chat-card-actions i.active {
  opacity: 1;
  color: #ffc107;
}

.chat-card-actions i.fa-bell-slash.active {
  color: #ff6b6b;
}
</style>
