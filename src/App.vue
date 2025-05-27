<template>
  <div class="app-container">
    <app-header />
    <app-banner v-if="showBanner" />
    <router-view class="main-content" />
    <app-footer />
    <trip-chat-widget />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppBanner from '@/components/common/AppBanner.vue'
import TripChatWidget from '@/components/ai/TripChatWidget.vue'

import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// 활성화 된 컴포넌트 사용
const route = useRoute()

// 메인 페이지에서만 배너 표시
const showBanner = computed(() => route.name === 'Home')

// 로그인 상태
const authStore = useAuthStore()

onMounted(() => {
  authStore.checkLogin() // 앱 로드시 로그인 상태 복원
})
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style>
