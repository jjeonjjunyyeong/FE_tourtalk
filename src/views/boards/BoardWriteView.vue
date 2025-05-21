<template>
  <div class="board-write-view">
    <div class="container">
      <h2 class="mb-4">{{ isEdit ? '게시글 수정' : '게시글 작성' }}</h2>

      <div class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="submitForm">
            <div
              v-if="message"
              :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']"
            >
              {{ message }}
            </div>

            <div class="mb-3">
              <label for="title" class="form-label">제목</label>
              <input
                type="text"
                id="title"
                v-model="boardForm.title"
                class="form-control"
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            <div class="mb-3">
              <label for="category" class="form-label">카테고리</label>
              <select v-model="boardForm.category" class="form-select" required>
                <option disabled value="">카테고리를 선택하세요</option>
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label for="content" class="form-label">내용</label>
              <textarea
                id="content"
                v-model="boardForm.content"
                class="form-control"
                placeholder="내용을 입력하세요"
                rows="10"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">게시글 상태</label>
              <div class="d-flex">
                <div class="form-check me-3">
                  <input
                    type="radio"
                    id="statusActive"
                    v-model="boardForm.status"
                    value="ACTIVE"
                    class="form-check-input"
                  />
                  <label class="form-check-label" for="Active">공개</label>
                </div>
                <div class="form-check">
                  <input
                    type="radio"
                    id="statusInactive"
                    v-model="boardForm.status"
                    value="INACTIVE"
                    class="form-check-input"
                  />
                  <label class="form-check-label" for="Inactive">비공개</label>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label for="fileUpload" class="form-label">파일 첨부 (선택사항)</label>
              <input type="file" id="fileUpload" class="form-control" @change="handleFileUpload" />
              <div v-if="boardForm.filePath" class="mt-2">
                <span class="text-muted"
                  >현재 파일: {{ getFileNameFromPath(boardForm.filePath) }}</span
                >
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger ms-2"
                  @click="removeFile"
                >
                  삭제
                </button>
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <router-link to="/boards" class="btn btn-secondary">
                <i class="bi bi-x-circle me-1"></i> 취소
              </router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                <i v-else class="bi bi-check-circle me-1"></i>
                {{ isEdit ? '수정하기' : '등록하기' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import boardService from '@/services/board'
import fileService from '@/services/file'

export default {
  name: 'BoardWriteView',
  setup() {
    const authStore = useAuthStore()
    const userRole = computed(() => authStore.role)

    const route = useRoute()
    const router = useRouter()

    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')
    const selectedFile = ref(null)

    const categoryOptions = computed(() => {
      const base = [
        { value: 'FREE', label: '자유게시판' },
        { value: 'QNA', label: 'Q&A' },
        { value: 'INQUIRY', label: '문의' },
      ]
      if (userRole.value === 'ADMIN') {
        return [{ value: 'NOTICE', label: '공지사항' }, ...base]
      }
      return base
    })

    const boardForm = reactive({
      postId: null,
      title: '',
      content: '',
      category: '',
      status: '',
      filePath: '',
    })

    const isEdit = computed(() => route.path.includes('/edit/'))
    const postId = computed(() => (isEdit.value ? Number(route.params.no) : null))

    const handleFileUpload = (event) => {
      selectedFile.value = event.target.files[0]
    }

    const getFileNameFromPath = (path) => (!path ? '' : path.split('/').pop())

    const removeFile = () => {
      boardForm.filePath = ''
      selectedFile.value = null
      const fileInput = document.getElementById('fileUpload')
      if (fileInput) fileInput.value = ''
    }

    const createBoard = async () => {
      try {
        loading.value = true
        if (selectedFile.value) {
          const result = await fileService.upload(selectedFile.value, 'boards')
          boardForm.filePath = result.filePath
        }

        const response = await boardService.createBoard(boardForm)
        message.value = '게시글이 등록되었습니다.'
        messageType.value = 'success'
        setTimeout(() => router.push(`/boards`), 1000)
      } catch (error) {
        message.value = '게시글 등록에 실패했습니다.'
        messageType.value = 'error'
      } finally {
        loading.value = false
      }
    }

    const updateBoard = async () => {
      try {
        loading.value = true
        if (selectedFile.value) {
          const result = await fileService.upload(selectedFile.value, 'boards')
          boardForm.filePath = result.filePath
        }

        await boardService.updateBoard(boardForm)
        message.value = '게시글이 수정되었습니다.'
        messageType.value = 'success'
        setTimeout(() => router.push(`/boards/${postId.value}`), 1000)
      } catch (error) {
        console.error('게시글 수정 실패:', error)
        message.value = '게시글 수정에 실패했습니다.'
        messageType.value = 'error'
      } finally {
        loading.value = false
      }
    }

    const submitForm = () => {
      if (isEdit.value) {
        boardForm.postId = postId.value
        updateBoard()
      } else {
        createBoard()
      }
    }

    const fetchBoardDetail = async () => {
      if (!isEdit.value) return
      try {
        loading.value = true
        const { data } = await boardService.getBoardDetail(postId.value)
        if (!data) {
          message.value = '게시글 정보를 찾을 수 없습니다.'
          messageType.value = 'error'
          return
        }
        Object.assign(boardForm, data)
      } catch (error) {
        console.error('게시글 정보 조회 실패:', error)
        message.value = '게시글 정보를 불러오는데 실패했습니다.'
        messageType.value = 'error'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchBoardDetail()
    })

    return {
      boardForm,
      loading,
      message,
      messageType,
      isEdit,
      submitForm,
      handleFileUpload,
      getFileNameFromPath,
      removeFile,
      categoryOptions,
    }
  },
}
</script>

<style scoped>
.board-write-view {
  padding: 2rem 0;
}
</style>
