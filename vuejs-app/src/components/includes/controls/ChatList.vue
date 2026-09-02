<template>
  <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
    <li class="nav-item" v-for="chat in chats" :key="chat.id">
      <RouterLink :to="{ name: 'chat.box', params: { chatId: chat.id } }" class="nav-link" active-class="active"
        role="button">
        <span class="position-relative d-inline-block">
          <img class="nav-icon img-circle elevation-3 my-1" :src="chat.avatar || emptyImage" />
          <span v-if="chat.type === 'personal' && presenceStore.isOnline(chat.other_user_id)"
            class="online-dot"></span>
        </span>
        <p class="chat-name">{{ chat.name }}</p>
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
      </RouterLink>
    </li>
  </ul>
</template>


<script setup>
import emptyImage from "@/assets/images/emptyImage.png";
import { formatChatTime } from "@/functions/datetime";
import { useUserStore } from '@/stores/user';
import { usePresenceStore } from '@/stores/presence';

const userStore = useUserStore();
const presenceStore = usePresenceStore();
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
</style>