<template>
  <form @submit.prevent="submitComment" class="comment-form p-3 border rounded">
    <div class="mb-2">
      <textarea
        v-model="content"
        class="form-control"
        placeholder="댓글을 입력하세요 (Ctrl + Enter로 작성)"
        rows="3"
        required
        @keydown.ctrl.enter.prevent="submitComment"
      ></textarea>
    </div>

    <div class="mb-2 d-flex align-items-center justify-content-between">
      <div>
        <label class="form-check-label me-2">공개 여부:</label>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            id="public"
            value="ACTIVE"
            v-model="status"
          />
          <label class="form-check-label" for="public">공개</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            id="secret"
            value="INACTIVE"
            v-model="status"
          />
          <label class="form-check-label" for="secret">비밀</label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-sm" :disabled="content.trim().length === 0">
        작성
      </button>
    </div>
  </form>
  <BaseModal
    :visible="showModal"
    :message="modalMessage"
    :mode="modalMode"
    @close="showModal = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import commentService from '@/services/comment'
import BaseModal from '@/components/BaseModal.vue'

const props = defineProps(['postId'])
const emit = defineEmits(['comment-added'])

// 모달 관련 설정
const showModal = ref(false)
const modalMessage = ref('')
const modalMode = ref('alert')
const openModal = (msg, mode = 'alert') => {
  modalMessage.value = msg
  modalMode.value = mode
  showModal.value = true
}

const content = ref('')
const status = ref('ACTIVE')

async function submitComment() {
  if (!content.value.trim()) return

  try {
    await commentService.writeComment({
      postId: props.postId,
      content: content.value,
      status: status.value,
    })
    content.value = ''
    status.value = 'ACTIVE'
    emit('comment-added')
  } catch (err) {
    console.error('댓글 작성 실패:', err)
    openModal('댓글 작성 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.comment-form textarea {
  resize: none;
}
.comment-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
