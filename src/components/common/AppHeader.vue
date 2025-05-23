<template>
  <header class="shadow-sm">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <!-- 로고 -->
        <router-link class="navbar-brand" to="/">
          <img src="@/assets/images/logo.png" alt="TourTalk Logo" height="40" v-if="logo" />
          <span v-else class="h4 mb-0 text-primary font-weight-bold">TourTalk</span>
        </router-link>

        <!-- 모바일 토글 버튼 -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 네비게이션 메뉴 -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/" active-class="active">홈</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/attractions" active-class="active"
                >여행지 검색</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/trip-plan" active-class="active"
                >여행 계획</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/boards" active-class="active"
                >상품 예약하기</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/boards" active-class="active"
                >커뮤니티</router-link
              >
            </li>
          </ul>

          <!-- 인증 메뉴 -->
          <ul class="navbar-nav">
            <template v-if="isLoggedIn">
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ userNickname }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><router-link class="dropdown-item" to="/profile">내 정보</router-link></li>

                  <!-- 큐레이터 메뉴 -->
                  <li v-if="isCurator">
                    <router-link class="dropdown-item" to="/products/manage">상품 관리</router-link>
                  </li>

                  <!-- 관리자 메뉴 -->
                  <li v-if="isAdmin">
                    <router-link class="dropdown-item" to="/admin/users">회원 관리</router-link>
                  </li>
                  <li v-if="isAdmin">
                    <router-link class="dropdown-item" to="/admin/posts">게시글 관리</router-link>
                  </li>

                  <li><a class="dropdown-item" href="#" @click.prevent="onLogout">로그아웃</a></li>
                </ul>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/login">로그인</router-link>
              </li>
              <li class="nav-item">
                <router-link class="btn btn-primary btn-sm mt-1" to="/register"
                  >회원가입</router-link
                >
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 전역 상태로부터 로그인 여부와 닉네임 가져오기
const isLoggedIn = computed(() => authStore.isLogin)
const userNickname = computed(() => authStore.nickname)
const userRole = computed(() => authStore.role)
const isCurator = computed(() => userRole.value === 'CURATOR')
const isAdmin = computed(() => userRole.value === 'ADMIN')
const logo = ref(null)

// 로그아웃 처리
const onLogout = async () => {
  try {
    await authStore.logout() // 상태 초기화 + 쿠키 제거
    alert('로그아웃되었습니다.')
    router.push('/')
  } catch (error) {
    console.error('로그아웃 처리 중 오류:', error)
  }
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  authStore.checkLogin() // 새로고침 시 상태 복원

  // 로고 이미지가 있는지 확인
  try {
    // 이미지가 없을 경우 에러가 발생할 수 있으므로 try-catch로 처리
    // 실제 프로젝트에서는 이미지 경로를 적절히 조정하세요
    logo.value = null
  } catch (e) {
    logo.value = null
  }
})
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
}

.navbar-brand {
  font-weight: bold;
}

.nav-link {
  font-weight: 500;
}

.nav-link.active {
  color: #4361ee !important;
}
</style>
