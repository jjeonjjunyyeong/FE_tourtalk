<template>
  <div class="delete-board-button">
    <!-- 삭제 버튼 -->
    <button class="btn btn-danger" @click="showConfirmModal" :disabled="loading">
      <i class="bi bi-trash me-1"></i>
      <span v-if="loading">
        <span class="spinner-border spinner-border-sm me-1" role="status"></span>
        삭제 중...
      </span>
      <span v-else>삭제</span>
    </button>

    <!-- 확인 모달 -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">게시글 삭제 확인</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>정말 이 게시글을 삭제하시겠습니까?</p>
            <p class="text-danger">삭제된 게시글은 복구할 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-danger" @click="deleteBoard" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import boardService from '@/services/board'

export default {
  name: 'DeleteBoardButton',
  props: {
    postId: {
      type: [Number, String],
      required: true,
    },
    // 게시글 작성자와 현재 사용자 ID가 일치하는지 확인 (선택 사항)
    isAuthor: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['delete-success', 'delete-error'],
  setup(props, { emit }) {
    const router = useRouter()
    const loading = ref(false)
    const modalRef = ref(null)
    let modal = null

    // 모달 표시
    const showConfirmModal = () => {
      if (!props.isAuthor) {
        alert('게시글 작성자만 삭제할 수 있습니다.')
        return
      }
      modal.show()
    }

    // 게시글 삭제
    const deleteBoard = async () => {
      try {
        loading.value = true

        // boardService에 deleteBoard 메서드 추가 필요
        await boardService.softDeleteBoard(props.postId)

        modal.hide()
        emit('delete-success')

        // 성공 메시지 표시 후 목록으로 이동
        setTimeout(() => {
          router.push('/boards')
        }, 1000)
      } catch (error) {
        console.error('게시글 삭제 실패:', error)
        emit('delete-error', error)

        // 오류 메시지 표시
        if (error.response && error.response.status === 403) {
          alert('삭제 권한이 없습니다.')
        } else {
          alert('게시글 삭제 중 오류가 발생했습니다.')
        }
      } finally {
        loading.value = false
      }
    }

    // 컴포넌트 마운트 시 Bootstrap 모달 초기화
    onMounted(() => {
      // Bootstrap 5의 Modal 클래스 사용
      modal = new Modal(modalRef.value)
    })

    return {
      loading,
      modalRef,
      showConfirmModal,
      deleteBoard,
    }
  },
}
</script>

<style scoped>
.delete-board-button {
  display: inline-block;
}
</style>
