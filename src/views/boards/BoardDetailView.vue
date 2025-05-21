<template>
  <div class="board-detail-view">
    <div class="container">
      <!-- 알림 메시지 -->
      <div
        v-if="message"
        :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']"
        role="alert"
      >
        <i
          :class="[
            messageType === 'error' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill',
            'me-2',
          ]"
        ></i>
        {{ message }}
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
        <p class="mt-2">게시글을 불러오는 중입니다...</p>
      </div>

      <!-- 오류 상태 -->
      <div v-else-if="error" class="alert alert-danger text-center my-5">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
        <div class="mt-3">
          <router-link to="/boards" class="btn btn-outline-primary">
            게시글 목록으로 돌아가기
          </router-link>
        </div>
      </div>

      <!-- 게시글 상세 정보 -->
      <div v-else-if="board" class="card shadow-sm">
        <div class="card-header bg-light">
          <h3 class="card-title mb-0">{{ board.title }}</h3>
        </div>
        <div class="card-body">
          <div class="mb-3 d-flex justify-content-between border-bottom pb-3">
            <div>
              <span class="fw-bold me-2">작성자:</span>
              {{ board.writerUserId || `사용자#${board.writerId}` }}
              <span v-if="board.status !== 'ACTIVE'" class="ms-2 badge bg-warning">
                {{ getStatusLabel(board.status) }}
              </span>
            </div>
            <div>
              <span class="me-3"
                ><i class="bi bi-calendar-date me-1"></i> {{ formatDate(board.createdAt) }}</span
              >
              <span><i class="bi bi-eye me-1"></i> {{ board.viewCount }}</span>
            </div>
          </div>

          <!-- 게시글 내용 -->
          <div class="board-content mb-4">
            <div v-html="sanitizeHTML(board.content)"></div>
          </div>

          <!-- 첨부 파일 -->
          <div v-if="board.filePath" class="mt-3 mb-4 p-3 bg-light rounded">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark me-2"></i>
              <a :href="board.filePath" target="_blank" class="text-decoration-none">
                첨부 파일 다운로드
              </a>
            </div>
          </div>

          <!-- 버튼 영역 -->
          <div class="d-flex justify-content-between mt-4">
            <router-link to="/boards" class="btn btn-secondary">
              <i class="bi bi-list me-1"></i> 목록
            </router-link>
            <div>
              <router-link
                v-if="isAuthor"
                :to="`/boards/edit/${board.postId}`"
                class="btn btn-primary me-2"
              >
                <i class="bi bi-pencil me-1"></i> 수정
              </router-link>

              <!-- 삭제 버튼 컴포넌트 -->
              <delete-board-button
                :postId="board.postId"
                :isAuthor="isAuthor"
                @delete-success="onDeleteSuccess"
                @delete-error="onDeleteError"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div v-if="board && !loading" class="card shadow-sm mt-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">
            댓글 <span class="badge bg-secondary">{{ board.commentCount || 0 }}</span>
          </h5>
        </div>
        <div class="card-body">
          <p class="text-muted">댓글 기능은 아직 준비 중입니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import boardService from '@/services/board'
import DeleteBoardButton from '@/components/board/DeleteBoardButton.vue'

export default {
  name: 'BoardDetailView',
  components: {
    DeleteBoardButton,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const board = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const message = ref('')
    const messageType = ref('')
    const authStore = useAuthStore()

    // 현재 사용자 정보
    const currentUserId = computed(() => authStore.mno)

    // 로그인 상태 확인 및 사용자 정보 로드
    const checkAuthStatus = () => {
      if (!authStore.isLogin) {
        alert('로그인이 필요합니다.')
        router.push('/login')
      }
    }

    // 현재 사용자가 게시글 작성자인지 확인
    const isAuthor = computed(() => {
      return String(board.value?.writerId) === String(currentUserId.value)
    })

    // 게시글 상태 레이블 반환
    const getStatusLabel = (status) => {
      switch (status) {
        case 'ACTIVE':
          return '공개'
        case 'INACTIVE':
          return '비공개'
        case 'DELETED':
          return '삭제됨'
        default:
          return '알 수 없음'
      }
    }

    // 작성자 ID로 이름 찾기 (실제로는 API 호출 또는 스토어에서 처리)
    const getWriterName = () => {
      return board.value?.writerNickname || `사용자#${board.value?.writerId}`
    }

    // HTML 태그 필터링 (악의적인 스크립트 방지)
    const sanitizeHTML = (html) => {
      if (!html) return ''

      // 실제 프로덕션에서는 DOMPurify 등의 라이브러리 사용 권장
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
    }

    // 날짜 포맷팅
    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    // 삭제 성공 처리
    const onDeleteSuccess = () => {
      message.value = '게시글이 성공적으로 삭제되었습니다.'
      messageType.value = 'success'

      // 잠시 후 목록 페이지로 이동
      setTimeout(() => {
        router.push('/boards')
      }, 1500)
    }

    // 삭제 오류 처리
    const onDeleteError = (error) => {
      message.value = '게시글 삭제 중 오류가 발생했습니다.'
      messageType.value = 'error'
      console.error('삭제 오류:', error)
    }

    // 게시글 상세 정보 조회
    const fetchBoardDetail = async () => {
      const postId = Number(route.params.no)
      if (isNaN(postId)) {
        error.value = '잘못된 게시글 ID 입니다.'
        loading.value = false
        return
      }

      try {
        loading.value = true
        const { data } = await boardService.getBoardDetail(postId)

        if (!data) {
          error.value = '게시글 정보를 찾을 수 없습니다.'
          return
        }

        board.value = data
      } catch (err) {
        console.error('게시글 상세 정보 조회 실패:', err)
        error.value = '게시글 정보를 불러오는데 실패했습니다.'
      } finally {
        loading.value = false
      }
    }

    // 컴포넌트 마운트 시 실행
    onMounted(() => {
      checkAuthStatus()
      fetchBoardDetail()
    })

    return {
      board,
      loading,
      error,
      message,
      messageType,
      isAuthor,
      formatDate,
      getStatusLabel,
      getWriterName,
      sanitizeHTML,
      onDeleteSuccess,
      onDeleteError,
    }
  },
}
</script>

<style scoped>
.board-detail-view {
  padding: 2rem 0;
}

.board-content {
  min-height: 300px;
}

/* 알림 메시지 애니메이션 */
.alert {
  transition: opacity 0.5s ease;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
