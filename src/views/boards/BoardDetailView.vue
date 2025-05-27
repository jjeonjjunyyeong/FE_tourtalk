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
              {{ board.writerNickname || `사용자#${board.writerId}` }}
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
              <a :href="board.filePath" target="_blank" class="text-decoration-none"
                >첨부 파일 다운로드</a
              >
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
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            댓글 <span class="badge bg-secondary">{{ comments.length }}</span>
          </h5>
        </div>
        <div class="card-body">
          <comment-form :postId="board.postId" @comment-added="loadComments" />
          <hr />
          <comment-list
            :comments="comments"
            :boardWriterId="board.writerId"
            @comment-updated="loadComments"
            @delete-comment="handleDeleteComment"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import commentService from '@/services/comment'
import boardService from '@/services/board'
import DeleteBoardButton from '@/components/board/DeleteBoardButton.vue'
import CommentList from '@/components/comment/CommentList.vue'
import CommentForm from '@/components/comment/CommentForm.vue'

export default {
  name: 'BoardDetailView',
  components: {
    DeleteBoardButton,
    CommentForm,
    CommentList,
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
    const comments = ref([])

    const currentUserId = computed(() => authStore.mno)

    const checkAuthStatus = () => {
      if (!authStore.isLogin) {
        alert('로그인이 필요합니다.')
        router.push('/login')
      }
    }

    const isAuthor = computed(() => String(board.value?.writerId) === String(currentUserId.value))

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

    const sanitizeHTML = (html) => {
      if (!html) return ''
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes()
      ).padStart(2, '0')}`
    }

    const fetchBoardDetail = async () => {
      const postId = Number(route.params.no)
      if (isNaN(postId)) {
        error.value = '잘못된 게시글 ID입니다.'
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

    const loadComments = async () => {
      const res = await commentService.getComments(board.value.postId)
      comments.value = res.data
      board.value.commentCount = comments.value.length // 동기화
    }

    const handleDeleteComment = async (commentId) => {
      if (confirm('댓글을 삭제하시겠습니까?')) {
        await commentService.softDeleteComment(commentId)
        await loadComments()
      }
    }

    const onDeleteSuccess = () => {
      message.value = '게시글이 성공적으로 삭제되었습니다.'
      messageType.value = 'success'
      setTimeout(() => {
        router.push('/boards')
      }, 1500)
    }

    const onDeleteError = (error) => {
      message.value = '게시글 삭제 중 오류가 발생했습니다.'
      messageType.value = 'error'
      console.error('삭제 오류:', error)
    }

    onMounted(async () => {
      checkAuthStatus()
      await fetchBoardDetail()
      await loadComments()
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
      sanitizeHTML,
      onDeleteSuccess,
      onDeleteError,
      comments,
      handleDeleteComment,
      loadComments,
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
