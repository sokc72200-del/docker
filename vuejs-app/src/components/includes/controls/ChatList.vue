<template>
  <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
    <li class="nav-item" v-for="chat in chats" :key="chat.id">
      <RouterLink :to="{ name: 'chat.box', params: { chatId: chat.id } }" class="nav-link" active-class="active"
        role="button">
        <span class="position-relative d-inline-block">
          <img class="nav-icon img-circle elevation-3 my-1" :src="chat.avatar || emptyImage" />
          <span v-if="chat.type === 'personal' && presenceStore.isOnline(chat.other_user_id)"
            class="online-dot"></span>
          <span v-if="chat.unread_count > 0" class="unread-badge">{{ chat.unread_count > 9 ? '9+' : chat.unread_count }}</span>
        </span>
        <p class="chat-name">
          <i v-if="chat.is_pinned" class="fas fa-thumbtack pin-indicator" title="Pinned"></i>
          {{ chat.name }}
        </p>
        <p class="chat-datetime">
          {{ lastMessage(chat) ? formatChatTime(lastMessage(chat).created_at) : "" }}
        </p>
        <br />
        <p class="chat-message mt-1">
          <span v-if="isOwnMessage(lastMessage(chat))" :class="'text-bold'">You:
          </span>
          <span v-if="!lastMessage(chat)" class="text-bold">Start a new conversation</span>
          <span v-else :class="isSeen(lastMessage(chat)) || isOwnMessage(lastMessage(chat)) ? '' : 'text-bold'">{{
            lastMessage(chat).content
            }}</span>
        </p>
        <p class="chat-activity-icon">
          <i class="far fa-paper-plane"></i>
          <i class="far fa-comment-dots"></i>
          <i class="fas fa-microphone"></i>
        </p>
        <p class="chat-quick-actions">
          <i class="fas fa-thumbtack" :class="{ active: chat.is_pinned }" title="Pin chat"
            @click.stop.prevent="onPinClick(chat.id)"></i>
          <i class="fas fa-bell-slash" :class="{ active: chat.is_muted }" title="Mute chat"
            @click.stop.prevent="onMuteClick(chat.id)"></i>
          <i class="fas fa-box-archive" title="Archive chat"
            @click.stop.prevent="onArchiveClick(chat.id)"></i>
        </p>
      </RouterLink>
    </li>
  </ul>
</template>


<script setup>
import emptyImage from "@/assets/images/emptyImage.png";
import { formatChatTime } from "@/functions/datetime";
import { useUserStore } from '@/stores/user';
import { usePresenceStore } from '@/stores/presence';
import { useRecentChatsStore } from '@/stores/recentChats';
import Swal from 'sweetalert2';

const userStore = useUserStore();
const presenceStore = usePresenceStore();
const recentChatsStore = useRecentChatsStore();
const props = defineProps({
  chats: {
    type: Array,
    required: true,
  },
});

function lastMessage(chat) {
  return chat.messages[chat.messages.length - 1] || null;
}

function isOwnMessage(message) {
  if (!message) return false;
  return (message.creator.id === userStore.id);
}

function isSeen(message) {
  if (!message) return false;
  return message.seen_at !== null;
}

async function onPinClick(chatId) {
  await recentChatsStore.togglePinChat(chatId);
}

async function onMuteClick(chatId) {
  await recentChatsStore.toggleMuteChat(chatId);
}

async function onArchiveClick(chatId) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Archive Chat',
    text: 'Archived chats are hidden from your list. You can unarchive them later.',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, archive it',
  });
  if (result.isConfirmed) {
    await recentChatsStore.toggleArchiveChat(chatId);
  }
}
</script>

<style scoped>
.online-dot {
  position: absolute;
  bottom: 4px;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #28a745;
  border: 2px solid #343a40;
  border-radius: 50%;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #dc3545;
  border: 2px solid #343a40;
  border-radius: 999px;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
}

.pin-indicator {
  font-size: 11px;
  color: #ffc107;
  margin-right: 4px;
  transform: rotate(45deg);
  display: inline-block;
}

.chat-quick-actions {
  position: absolute;
  top: 6px;
  right: 8px;
  margin: 0;
  display: flex;
  gap: 8px;
}

.chat-quick-actions i {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: color 0.15s ease;
}

.chat-quick-actions i:hover {
  color: rgba(255, 255, 255, 0.8);
}

.chat-quick-actions i.active {
  color: #ffc107;
}

.chat-quick-actions i.fa-bell-slash.active {
  color: #dc3545;
}
</style>