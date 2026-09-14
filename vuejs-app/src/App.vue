<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <router-view name="navbar"></router-view>
  <router-view name="left_sidebar"></router-view>
  <router-view></router-view>
  <router-view name="right_sidebar"></router-view>
  <router-view name="footer"></router-view>
</template>

<style scoped></style>