<template>
  <div class="comment-list">
    <div v-if="comments.length === 0" class="text-muted">아직 작성된 댓글이 없습니다.</div>

    <div
      v-for="comment in comments"
      :key="comment.commentId"
      class="comment-item border-bottom py-2"
    >
      <!-- 작성자 정보 + 비밀 표시 -->
      <div class="d-flex justify-content-between">
        <strong>
          {{ comment.writerNickname }}
          <template v-if="comment.status === 'INACTIVE'">
            <span v-if="isCommentOwner(comment)" class="text-muted fst-italic">
              (본인 비밀댓글)
            </span>
            <span v-else-if="isBoardOwner" class="text-muted fst-italic">
              (비밀댓글)
            </span>
          </template>
        </strong>
        <small>{{ formatDate(comment.createdAt) }}</small>
      </div>

      <!-- 댓글 내용 또는 수정 폼 -->
      <p class="mt-1 mb-0" v-if="editingCommentId === comment.commentId">
        <textarea
          v-model="editContent"
          rows="3"
          class="form-control mb-2"
          @keydown.enter.ctrl.prevent="submitEdit(comment.commentId)"
          @keydown.esc.prevent="cancelEdit"
        />
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" value="ACTIVE" v-model="editStatus" />
          <label class="form-check-label">공개</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" value="INACTIVE" v-model="editStatus" />
          <label class="form-check-label">비밀</label>
        </div>
        <div class="mt-2">
          <button @click="submitEdit(comment.commentId)" class="btn btn-sm btn-primary me-2">저장</button>
          <button @click="cancelEdit" class="btn btn-sm btn-secondary">취소</button>
        </div>
      </p>

      <p class="mt-1 mb-0" v-else>
        <template v-if="comment.status === 'DELETED'">
          <span class="text-muted fst-italic">삭제된 댓글입니다.</span>
        </template>
        <template v-else-if="comment.status === 'INACTIVE' && !isVisible(comment)">
          <span class="text-muted fst-italic">비밀 댓글입니다.</span>
        </template>
        <template v-else>
          {{ comment.content }}
        </template>
      </p>

      <!-- 수정/삭제 버튼: 수정 중이 아닐 때만 -->
      <div
        v-if="isCommentOwner(comment) && comment.status !== 'DELETED' && editingCommentId !== comment.commentId"
        class="mt-1 text-end"
      >
        <button
          @click="startEdit(comment)"
          class="btn btn-sm btn-outline-secondary me-2"
        >
          수정
        </button>
        <button
          @click="$emit('delete-comment', comment.commentId)"
          class="btn btn-sm btn-outline-danger"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import commentService from '@/services/comment'

const props = defineProps(['comments', 'boardWriterId'])
const emit = defineEmits(['comment-updated'])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.mno)

const editingCommentId = ref(null)
const editContent = ref('')
const editStatus = ref('ACTIVE')

// 댓글 작성자인지
function isCommentOwner(comment) {
  return Number(comment.writerId) === Number(currentUserId.value)
}

// 글 작성자인지
const isBoardOwner = computed(() => {
  return Number(props.boardWriterId) === Number(currentUserId.value)
})

// 비밀 댓글 표시 가능 여부
function isVisible(comment) {
  const userId = Number(currentUserId.value)
  return Number(comment.writerId) === userId || isBoardOwner.value
}

// 수정 시작
function startEdit(comment) {
  editingCommentId.value = comment.commentId
  editContent.value = comment.content
  editStatus.value = comment.status
}

// 수정 제출
async function submitEdit(commentId) {
  try {
    await commentService.modifyComment({
      commentId,
      content: editContent.value,
      status: editStatus.value,
    })
    editingCommentId.value = null
    emit('comment-updated')
  } catch (err) {
    alert('댓글 수정 실패')
    console.error(err)
  }
}

// 수정 취소
function cancelEdit() {
  editingCommentId.value = null
}

// 날짜 포맷
function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`
}
</script>

<style scoped>
.comment-item {
  transition: all 0.2s ease;
}
.comment-item:hover {
  background-color: #f9f9f9;
}
</style>
