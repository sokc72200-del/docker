import { defineStore } from 'pinia'

let isSubscribed = false

export const usePresenceStore = defineStore('presence', {
  state: () => ({
    onlineUserIds: [], // array of user ids currently online
  }),
  getters: {
    isOnline: (state) => (userId) => {
      return state.onlineUserIds.includes(Number(userId))
    },
  },
  actions: {
    addOnlineUser(userId) {
      const id = Number(userId)
      if (!this.onlineUserIds.includes(id)) {
        this.onlineUserIds.push(id)
      }
    },
    removeOnlineUser(userId) {
      const id = Number(userId)
      this.onlineUserIds = this.onlineUserIds.filter((uid) => uid !== id)
    },
    subscribe() {
      if (isSubscribed) {
        return
      }

      window.Echo.join('Presence.Online')
        .here((users) => {
          // Full list of users currently present, received on join
          this.onlineUserIds = users.map((u) => Number(u.id))
        })
        .joining((user) => {
          this.addOnlineUser(user.id)
        })
        .leaving((user) => {
          this.removeOnlineUser(user.id)
        })

      isSubscribed = true
    },
  },
})
