<template>
  <div class="mypage container-fulid py-5">
    <div class="row align-items-start" style="min-height: 80vh">
      <!-- 왼쪽 메뉴 -->
      <div class="col-md-3 sidebar-menu d-flex flex-column justify-content-start">
        <!-- 탭 -->
        <ul class="nav flex-column nav-pills">
          <li class="nav-item" v-for="item in menuItems" :key="item.key">
            <button
              class="nav-link"
              :class="{ active: currentTab === item.key }"
              @click="currentTab = item.key"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>

      <!-- 오른쪽 콘텐츠 -->
      <div class="col-md-9 d-flex justify-content-center">
        <div class="content-box w-100" style="max-width: 100%">
          <component :is="currentComponent" :member="member" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import memberService from '@/services/member'

import MemberInfo from '@/components/infotaps/MemberInfo.vue'
import MyPosts from '@/components/infotaps/MyPosts.vue'
import MyComments from '@/components/infotaps/MyComments.vue'
import MyGroups from '@/components/infotaps/MyGroups.vue'
import MyBookings from '@/components/infotaps/MyBookings.vue'

const apiBase = __API_BASE_URL__
const member = ref({})
const currentTab = ref('info')

const menuItems = [
  { key: 'info', label: '회원 정보' },
  { key: 'posts', label: '내 게시글' },
  { key: 'comments', label: '내 댓글' },
  { key: 'groups', label: '여행 그룹' },
  { key: 'bookings', label: '예약 상품' },
]

const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'posts':
      return MyPosts
    case 'comments':
      return MyComments
    case 'groups':
      return MyGroups
    case 'bookings':
      return MyBookings
    default:
      return MemberInfo
  }
})

onMounted(async () => {
  const res = await memberService.getMyInfo()
  member.value = res.data
})
</script>

<style scoped>
.sidebar-menu {
  max-width: 220px;
  padding-top: 10%;
}

.nav-pills {
  display: flex;
  flex-direction: column;
}

.nav-link {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.nav-link.active {
  background-color: #0d6efd;
  color: white;
  font-weight: 600;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.2);
}
</style>
