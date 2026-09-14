<template>
  <div class="content-wrapper">
    <section class="content pt-3">
      <div class="container-fluid">
        <div class="card card-primary card-outline direct-chat direct-chat-primary">
          <div class="card-header d-flex align-items-center">
            <h3 class="card-title">
              <img class="direct-chat-img elevation-3" :src="emptyImage" />
            </h3>
            <h3 class="card-title mx-3"></h3>
            <div class="card-tools ml-auto">
              <button type="button" class="btn btn-tool" @click="toggleSearchPanel">
                <i class="fas fa-search text-primary"></i>
              </button>
              <RouterLink
                :to="{ name: 'chat.details', params: { chatId: props.chatId } }"
                type="button"
                class="btn btn-tool"
              >
                <i class="fas fa-list text-primary"></i>
              </RouterLink>
            </div>
          </div>
          <div v-if="showSearchPanel" class="card-body border-bottom py-2">
            <input
              v-model="searchKeyword"
              type="text"
              class="form-control form-control-sm"
              placeholder="Search messages in this chat..."
              @keyup="handleSearchKeyup"
            />
            <div v-if="isSearching" class="text-muted small mt-2">
              <i class="fas fa-spinner fa-spin"></i> Searching...
            </div>
            <div
              v-else-if="searchKeyword.trim() && searchResults.length === 0"
              class="text-muted small mt-2"
            >
              No messages found.
            </div>
            <div v-else-if="searchResults.length" class="search-results mt-2">
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="search-result-item"
                @click="onSearchResultClick(result)"
              >
                <div class="d-flex justify-content-between">
                  <strong>{{ result.creator.name }}</strong>
                  <span class="text-muted small">{{ formatChatTime(result.created_at) }}</span>
                </div>
                <div class="text-truncate">{{ result.content }}</div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="direct-chat-messages" style="min-height: calc(100vh - 280px)">
              <template v-for="message in chat?.messages" :key="message.id">
                <div
                  class="direct-chat-msg"
                  :id="'message-' + message.id"
                  :class="isOwnMessage(message) ? 'right' : 'left'"
                >
                  <div class="direct-chat-infos clearfix">
                    <span
                      class="direct-chat-timestamp mx-1"
                      :class="isOwnMessage(message) ? 'float-right' : 'float-left'"
                      >{{ formatChatTime(message.created_at) }}</span
                    >
                  </div>
                  <img
                    class="direct-chat-img"
                    :src="message.creator.profile_thumbnail || emptyImage"
                    alt="message user image"
                  />
                  <div
                    class="direct-chat-text"
                    :class="
                      isOwnMessage(message) ? 'text-right float-right' : 'text-left float-left'
                    "
                  >
                    <template v-if="editingMessageId === message.id">
                      <div class="input-group input-group-sm">
                        <input
                          v-model="editContent"
                          type="text"
                          class="form-control"
                          maxlength="5000"
                          @keyup.enter="saveEdit(message.id)"
                          @keyup.esc="cancelEdit"
                        />
                        <span class="input-group-append">
                          <button
                            type="button"
                            class="btn btn-success btn-sm"
                            @click="saveEdit(message.id)"
                            :disabled="!editContent.trim()"
                          >
                            <i class="fas fa-check"></i>
                          </button>
                          <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            @click="cancelEdit"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </span>
                      </div>
                    </template>
                    <template v-else-if="message.type === 'voice'">
                      <audio controls :src="message.fileBlob" style="max-width: 250px"></audio>
                    </template>
                    <template v-else-if="message.type === 'image'">
                      <img
                        :src="message.fileBlob"
                        style="max-width: 250px; border-radius: 4px; cursor: pointer"
                        @click="openImagePreview(message.fileBlob)"
                        alt="image message"
                      />
                    </template>
                    <template v-else>
                      {{ message.content }}
                    </template>
                  </div>
                </div>

                <div
                  v-if="message.reactions && message.reactions.length"
                  class="reaction-chips clearfix"
                  :class="isOwnMessage(message) ? 'text-right' : 'text-left'"
                >
                  <span
                    v-for="r in message.reactions"
                    :key="r.emoji"
                    class="reaction-chip"
                    :class="{ mine: r.reacted_by_me }"
                    :title="r.user_names.join(', ')"
                    @click="onReactionClick(message.id, r.emoji)"
                  >
                    {{ r.emoji }} {{ r.count }}
                  </span>
                </div>

                <div
                  v-if="reactingMessageId === message.id"
                  class="emoji-palette clearfix"
                  :class="isOwnMessage(message) ? 'float-right' : 'float-left'"
                >
                  <span
                    v-for="emoji in quickEmojis"
                    :key="emoji"
                    class="emoji-option"
                    @click="onReactionClick(message.id, emoji)"
                    >{{ emoji }}</span
                  >
                </div>

                <div class="direct-chat-infos clearfix">
                  <span
                    class="direct-chat-name"
                    :class="isOwnMessage(message) ? 'float-right' : 'float-left'"
                    >{{ message.creator.name }}</span
                  >
                  <i
                    v-if="isOwnMessage(message)"
                    @click="deleteMessage(message.id)"
                    class="fas fa-trash-alt text-danger float-right mt-1 mx-1"
                    style="cursor: pointer"
                    title="Delete message"
                  ></i>
                  <i
                    v-if="isOwnMessage(message) && isTextMessage(message)"
                    @click="startEditMessage(message)"
                    class="fas fa-edit text-primary float-right mt-1 mx-1"
                    style="cursor: pointer"
                    title="Edit message"
                  ></i>
                  <i
                    @click="toggleReactionPicker(message.id)"
                    class="far fa-smile text-warning float-right mt-1 mx-1"
                    style="cursor: pointer"
                    title="React"
                  ></i>
                </div>
                <hr />
              </template>
            </div>
            <!--/.direct-chat-messages-->
            <div v-if="typingUsers.length" class="text-muted px-2 pb-1" style="font-size: 0.85rem">
              <i class="fas fa-ellipsis-h mr-1"></i>
              {{ typingUsers.join(', ') }} {{ typingUsers.length > 1 ? 'are' : 'is' }} typing...
            </div>
          </div>
          <div class="card-footer">
            <form @submit.prevent="sendMessage">
              <div class="input-group">
                <template v-if="isRecording">
                  <span class="form-control d-flex align-items-center text-danger">
                    <i class="fas fa-circle mr-2"></i> {{ formatRecordingTime(recordingSeconds) }}
                  </span>
                </template>
                <template v-else-if="recordedBlob">
                  <span class="form-control d-flex align-items-center">
                    <i class="fas fa-microphone mr-2 text-secondary"></i>
                    {{ formatRecordingTime(recordingSeconds) }}
                  </span>
                </template>
                <template v-else-if="selectedImageFile">
                  <span class="form-control d-flex align-items-center">
                    <i class="fas fa-image mr-2 text-secondary"></i> {{ selectedImageFile.name }}
                  </span>
                </template>
                <template v-else>
                  <input
                    v-model="messageContent"
                    type="text"
                    name="message"
                    placeholder="Type Message ..."
                    class="form-control"
                    maxlength="5000"
                    @keyup="handleTyping"
                  />
                </template>
                <span class="input-group-append">
                  <button
                    v-if="selectedImageFile"
                    type="button"
                    class="btn btn-secondary"
                    @click="selectedImageFile = null"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button
                    v-if="recordedBlob && !isRecording"
                    type="button"
                    class="btn btn-secondary"
                    @click="resetRecordingState"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button
                    v-if="!recordedBlob && !selectedImageFile"
                    type="button"
                    class="btn"
                    :class="isRecording ? 'btn-danger' : 'btn-secondary'"
                    @click="toggleRecording"
                  >
                    <i class="fas fa-microphone"></i>
                  </button>
                  <button
                    v-if="!recordedBlob && !isRecording"
                    type="button"
                    class="btn btn-secondary"
                    @click="$refs.imageInput.click()"
                  >
                    <i class="fas fa-image"></i>
                  </button>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
                    style="display: none"
                    @change="onImageSelected"
                  />
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="!recordedBlob && !messageContent.trim() && !selectedImageFile"
                  >
                    Send
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { watch, ref, onMounted, computed } from 'vue'
import emptyImage from '@/assets/images/emptyImage.png'
import { useUserStore } from '@/stores/user'
import { useRecentChatsStore } from '@/stores/recentChats'
import { formatChatTime } from '@/functions/datetime'
import {
  apiGetChatMessages,
  apiCreateChatMessage,
  apiCreateVoiceChatMessage,
  apiCreateImageChatMessage,
  apiUpdateChatMessage,
  apiDeleteChatMessage,
  apiMarkAllChatMessagesAsSeen,
  apiSendTyping,
  apiToggleMessageReaction,
  apiSearchChatMessages,
} from '@/functions/api/chat'
import $ from 'jquery'
import { apiReadChat } from '@/functions/api/chat'
import Swal from 'sweetalert2'
import { MessageModal } from '@/functions/swal'

const userStore = useUserStore()
const recentChatsStore = useRecentChatsStore()

const props = defineProps({
  chatId: {
    required: true,
  },
})

// Local state for messages (independent of store)

// Message input
const messageContent = ref('')
const chat = computed(() => recentChatsStore.getChatById(props.chatId))

// Typing indicator
const typingUsers = computed(() => recentChatsStore.getTypingUsers(props.chatId))
let typingThrottleTimer = null

function handleTyping() {
  if (typingThrottleTimer) {
    return // Already sent a typing event recently, wait for throttle to clear
  }
  apiSendTyping(props.chatId).catch(() => {})
  typingThrottleTimer = setTimeout(() => {
    typingThrottleTimer = null
  }, 2000)
}

function resetTypingThrottle() {
  clearTimeout(typingThrottleTimer)
  typingThrottleTimer = null
}

// Message search
const showSearchPanel = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)
let searchDebounceTimer = null

function toggleSearchPanel() {
  showSearchPanel.value = !showSearchPanel.value
  if (!showSearchPanel.value) {
    searchKeyword.value = ''
    searchResults.value = []
  }
}

function handleSearchKeyup() {
  clearTimeout(searchDebounceTimer)
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  isSearching.value = true
  searchDebounceTimer = setTimeout(async () => {
    try {
      const response = await apiSearchChatMessages(props.chatId, keyword)
      searchResults.value = response.data.chat_messages
    } catch (error) {
      console.error('Error searching messages:', error)
    } finally {
      isSearching.value = false
    }
  }, 400)
}

function onSearchResultClick(result) {
  showSearchPanel.value = false
  const el = document.getElementById('message-' + result.id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-message')
    setTimeout(() => el.classList.remove('highlight-message'), 2000)
  } else {
    MessageModal({
      icon: 'info',
      title: 'Message found',
      text: 'This message is further back in the chat history. Scroll up to load it.',
    })
  }
}

// Message reactions
const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏']
const reactingMessageId = ref(null)

function toggleReactionPicker(messageId) {
  reactingMessageId.value = reactingMessageId.value === messageId ? null : messageId
}

async function onReactionClick(messageId, emoji) {
  reactingMessageId.value = null
  try {
    const response = await apiToggleMessageReaction(props.chatId, messageId, emoji)
    recentChatsStore.syncChatMessage(props.chatId, response.data.chat_message)
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}

// Edit state
const editingMessageId = ref(null)
const editContent = ref('')

function isOwnMessage(message) {
  if (!message) return false
  return message.creator.id === userStore.id
}

function isTextMessage(message) {
  return message?.type === 'text'
}

function startEditMessage(message) {
  editingMessageId.value = message.id
  editContent.value = message.content
}

function cancelEdit() {
  editingMessageId.value = null
  editContent.value = ''
}

// Image upload state
const selectedImageFile = ref(null)

function onImageSelected(event) {
  const file = event.target.files[0]
  if (file) {
    selectedImageFile.value = file
  }
  event.target.value = ''
}

async function sendImageMessage(file) {
  try {
    const response = await apiCreateImageChatMessage(props.chatId, file)
    recentChatsStore.syncChatMessage(props.chatId, response.data.chat_message)
    scrollToBottom()
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}

function openImagePreview(src) {
  Swal.fire({
    imageUrl: src,
    imageAlt: 'Image message',
    showConfirmButton: false,
    showCloseButton: true,
  })
}

// Voice recording state
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])
const recordedBlob = ref(null)
const recordingSeconds = ref(0)
let recordingTimer = null

function resetRecordingState() {
  recordedBlob.value = null
  recordingSeconds.value = 0
  clearInterval(recordingTimer)
  mediaRecorder.value?.stop()
  isRecording.value = false
}
function formatRecordingTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function toggleRecording() {
  if (isRecording.value) {
    clearInterval(recordingTimer)
    mediaRecorder.value?.stop()
    isRecording.value = false
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []
      recordingSeconds.value = 0

      mediaRecorder.value.ondataavailable = (e) => {
        audioChunks.value.push(e.data)
      }

      mediaRecorder.value.onstop = () => {
        recordedBlob.value = new Blob(audioChunks.value, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.value.start()
      isRecording.value = true
      recordingTimer = setInterval(() => {
        recordingSeconds.value++
        if (recordingSeconds.value >= 60) {
          // Limit recording to 60 seconds
          clearInterval(recordingTimer)
          mediaRecorder.value?.stop()
          isRecording.value = false
        }
      }, 1000)
    } catch (error) {
      return MessageModal({ icon: 'error', title: 'Error', text: 'Microphone access denied.' })
    }
  }
}

async function sendVoiceMessage(blob) {
  try {
    const response = await apiCreateVoiceChatMessage(props.chatId, blob)
    recentChatsStore.syncChatMessage(props.chatId, response.data.chat_message)
    scrollToBottom()
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}

async function saveEdit(messageId) {
  if (!editContent.value.trim()) {
    return
  }

  try {
    const response = await apiUpdateChatMessage(props.chatId, messageId, editContent.value)
    recentChatsStore.syncChatMessage(props.chatId, response.data.chat_message)
    editingMessageId.value = null
    editContent.value = ''
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}

async function sendMessage() {
  if (selectedImageFile.value) {
    await sendImageMessage(selectedImageFile.value)
    selectedImageFile.value = null
    return
  }

  if (recordedBlob.value) {
    await sendVoiceMessage(recordedBlob.value)
    resetRecordingState()
    return
  }

  if (!messageContent.value.trim()) {
    return
  }

  try {
    const response = await apiCreateChatMessage(props.chatId, messageContent.value)

    // Add message to store
    recentChatsStore.syncChatMessage(props.chatId, response.data.chat_message)

    // Clear input
    messageContent.value = ''

    scrollToBottom()
  } catch (error) {
    return MessageModal({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message,
    })
  }
}

async function deleteMessage(messageId) {
  Swal.fire({
    icon: 'warning',
    title: 'Delete Message',
    text: 'Are you sure you want to delete this message?',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await apiDeleteChatMessage(props.chatId, messageId)
        recentChatsStore.removeChatMessage(props.chatId, messageId)
        return MessageModal({ icon: 'success', title: 'Success', text: response.data.message })
      } catch (error) {
        return MessageModal({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || error.message,
        })
      }
    }
  })
}

const currentPage = ref(1)
const lastPage = ref(1)
const pageSize = ref(25)
const isLoadingMore = ref(false)

async function loadChat() {
  try {
    if (chat.value) {
      return // Chat already exists in store
    }
    // If not in store, fetch from API
    const response = await apiReadChat(props.chatId)
    recentChatsStore.syncChat(response.data.chat)
  } catch (error) {
    console.error('Error loading chat:', error)
  }
}

async function loadMessages(page = 1) {
  try {
    // Fetch from API
    const response = await apiGetChatMessages(props.chatId, {
      page: page,
      per_page: pageSize.value,
    })

    recentChatsStore.syncMultiChatMessages(props.chatId, [
      ...response.data.chat_messages,
      ...chat.value.messages,
    ])

    currentPage.value = response.data.meta.current_page
    lastPage.value = response.data.meta.last_page
  } catch (error) {
    console.error('Error loading messages:', error)
  }
}

async function markMessagesAsSeen() {
  try {
    await apiMarkAllChatMessagesAsSeen(props.chatId)
    recentChatsStore.resetUnreadCount(props.chatId) // Clear the badge once messages are marked seen
  } catch (error) {
    console.error('Error marking messages as seen:', error)
  }
}

async function loadMoreMessages() {
  if (isLoadingMore.value) {
    return
  }

  if (currentPage.value >= lastPage.value) {
    return
  }

  isLoadingMore.value = true

  await loadMessages(currentPage.value + 1)

  isLoadingMore.value = false
}

function scrollToBottom() {
  const chatContainer = $('.direct-chat-messages')
  if (chatContainer.length > 0) {
    chatContainer.scrollTop(chatContainer[0].scrollHeight)
  }
}

function setupScrollListener() {
  const chatContainer = $('.direct-chat-messages')

  // Remove existing listener
  chatContainer.off('scroll')

  // Add scroll listener for infinite scroll
  chatContainer.on('scroll', async function () {
    if (isLoadingMore.value) {
      return
    }

    if (currentPage.value >= lastPage.value) {
      return
    }

    if (currentPage.value >= lastPage.value) {
      return // No more pages to load
    }
    // Load more when scrolling near the top
    const scrollTop = this.scrollTop
    if (scrollTop > 150) {
      return // Not near the top yet
    }
    const previousScrollHeight = this.scrollHeight
    await loadMoreMessages()

    // Maintain scroll position after prepending messages
    const newScrollHeight = this.scrollHeight
    this.scrollTop = newScrollHeight - previousScrollHeight + scrollTop
  })
}
watch(
  () => chat.value?.messages?.length,
  (newLen, oldLen) => {
    if (newLen > (oldLen || 0)) {
      const container = document.querySelector('.direct-chat-messages')
      if (!container) return

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 150

      if (isNearBottom) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight
        }, 30)
      }
    }
  },
)

// Watch for chat changes
watch(
  () => props.chatId,
  async () => {
    recentChatsStore.setActiveChatId(props.chatId) // Mark this chat as currently open

    // Reset state
    isLoadingMore.value = false
    currentPage.value = 1
    lastPage.value = 1
    messageContent.value = '' // Clear message input when switching chats
    editingMessageId.value = null // Cancel any ongoing edit
    editContent.value = ''
    resetRecordingState() // Reset recording state when switching chats
    selectedImageFile.value = null // Reset selected image when switching chats
    resetTypingThrottle() // Reset typing throttle when switching chats
    reactingMessageId.value = null // Close any open emoji picker when switching chats
    showSearchPanel.value = false // Close search panel when switching chats
    searchKeyword.value = ''
    searchResults.value = []

    await loadChat()
    // await loadMessages(1);
    scrollToBottom()
    setupScrollListener()
    await markMessagesAsSeen()
  },
)

// Initial load
onMounted(async () => {
  recentChatsStore.setActiveChatId(props.chatId) // Mark this chat as currently open
  await loadChat()
  await loadMessages(1)
  scrollToBottom()
  setupScrollListener()
  await markMessagesAsSeen()
})
</script>

<style scoped>
.reaction-chips {
  margin: 2px 8px 4px;
}

.reaction-chip {
  display: inline-block;
  background-color: #f1f1f1;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  padding: 1px 8px;
  margin: 0 3px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.reaction-chip.mine {
  background-color: #cfe8ff;
  border-color: #3c8dbc;
}

.emoji-palette {
  margin: 2px 8px 4px;
  background: #fff;
  border: 1px solid #dcdcdc;
  border-radius: 20px;
  padding: 4px 8px;
  display: inline-block;
}

.emoji-option {
  display: inline-block;
  font-size: 18px;
  padding: 0 4px;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.emoji-option:hover {
  transform: scale(1.3);
}

.search-results {
  max-height: 250px;
  overflow-y: auto;
}

.search-result-item {
  padding: 6px 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

:deep(.highlight-message) {
  animation: highlight-fade 2s ease;
}

@keyframes highlight-fade {
  0% {
    background-color: #fff3cd;
  }
  100% {
    background-color: transparent;
  }
}
</style>
