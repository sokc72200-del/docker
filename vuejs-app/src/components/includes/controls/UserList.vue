<template>
  <ul
    class="nav nav-pills nav-sidebar flex-column"
    data-widget="treeview"
    role="menu"
    data-accordion="false"
  >
    <li class="nav-item" v-for="user in users" :key="user.id">
      <a role="button" class="nav-link" @click="onUserClick(user.id)">
        <span class="position-relative d-inline-block">
          <img
            class="nav-icon img-circle elevation-3 my-1"
            :src="user.profile_image || emptyImage"
          />
          <span v-if="presenceStore.isOnline(user.id)" class="online-dot"></span>
        </span>
        <p class="chat-name">{{ user.name }}</p>
        <br />
        <p class="chat-message mt-1">
          <span class="text-bold text-muted">Start a new conversation</span>
        </p>
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
