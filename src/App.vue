<template>
  <div class="app-container">
    <app-header />
    <app-banner v-if="showBanner" />
    <router-view class="main-content" />
    <app-footer />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import AppBanner from '@/components/common/AppBanner.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// 활성화 된 컴포넌트 사용
const route = useRoute();

// 메인 페이지에서만 배너 표시
const showBanner = computed(() => route.name === 'Home');

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
