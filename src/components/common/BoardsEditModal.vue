<template>
  <div class="modal fade show d-block bg-dark bg-opacity-50" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content p-4">
        <div class="modal-header">
          <h5 class="modal-title">게시글 수정</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <label class="form-label">카테고리</label>
          <select v-model="form.category" class="form-select mb-3">
            <option value="NOTICE">공지사항</option>
            <option value="FREE">자유게시판</option>
            <option value="QNA">QnA</option>
            <option value="INQUIRY">문의</option>
            <option value="REVIEW">리뷰</option>
          </select>

          <label class="form-label">제목</label>
          <input v-model="form.title" type="text" class="form-control mb-3" />

          <label class="form-label">상태</label>
          <select v-model="form.status" class="form-select">
            <option value="ACTIVE">공개</option>
            <option value="INACTIVE">비공개</option>
            <option value="DELETED">삭제됨</option>
          </select>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">닫기</button>
          <button class="btn btn-primary" @click="save">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import boardService from '@/services/admin'

const props = defineProps({ postId: Number })
const emit = defineEmits(['close', 'success'])

const form = ref({
  title: '',
  category: '',
  status: '',
})

const fetchDetail = async () => {
  const res = await boardService.getBoardDetail(props.postId)
  form.value.title = res.data.title
  form.value.category = res.data.category
  form.value.status = res.data.status
}

const save = async () => {
  try {
    await boardService.updateBoard(props.postId, { ...form.value })
    emit('success')
  } catch (err) {
    alert('수정에 실패했습니다.')
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.modal {
  display: block;
  z-index: 1050;
}
</style>
