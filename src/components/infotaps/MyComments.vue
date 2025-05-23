<template>
  <div class="my-comments container-fluid py-5">
    <h3 class="text-center mb-4 fw-bold">내가 작성한 댓글</h3>

    <div class="card shadow p-4 rounded-4 mx-auto" style="max-width: 1000px">
      <div v-if="comments.length" class="table-responsive">
        <table class="table table-bordered table-hover text-center align-middle">
          <thead class="table-light">
            <tr>
              <th style="width: 5%">번호</th>
              <th style="width: 20%">게시글 제목</th>
              <th style="width: 40%">내용</th>
              <th style="width: 20%">작성일</th>
              <th style="width: 15%">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(comment, index) in comments" :key="comment.commentId">
              <td>{{ index + 1 + ((page ?? 1) - 1) * size }}</td>
              <td>{{ truncateTitle(comment.postTitle) }}</td>
              <td class="text-start">
                <router-link
                  :to="`/boards/${comment.postId}`"
                  class="text-decoration-none text-dark"
                >
                  {{ comment.content }}
                </router-link>
              </td>
              <td>{{ formatDate(comment.createdAt) }}</td>
              <td>{{ statusToKorean(comment.status) }}</td>
            </tr>
          </tbody>
        </table>

        <nav class="mt-3 d-flex justify-content-center">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: page === 1 }">
              <button class="page-link" @click="prevPage">이전</button>
            </li>
            <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: p === page }">
              <button class="page-link" @click="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: page === totalPages }">
              <button class="page-link" @click="nextPage">다음</button>
            </li>
          </ul>
        </nav>
      </div>

      <p v-else class="text-center my-5 text-muted">작성한 댓글이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import commentService from '@/services/comment'
import { useAuthStore } from '@/stores/authStore'

const comments = ref([])
const page = ref(1)
const size = 10
const totalPages = ref(1)
const authStore = useAuthStore()

const fetchComments = async () => {
  try {
    const res = await commentService.getMyComments(authStore.mno, page.value, size)
    comments.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.error('댓글 조회 실패:', err)
  }
}

const changePage = (p) => {
  const nextPage = Number(p)
  if (!isNaN(nextPage) && nextPage >= 1 && nextPage <= totalPages.value) {
    page.value = nextPage
    fetchComments()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchComments()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchComments()
  }
}

const formatDate = (datetimeStr) => {
  if (!datetimeStr) return ''
  return datetimeStr.slice(0, 10) // yyyy-mm-dd 형식만 추출
}

const truncateTitle = (title) => {
  if (!title) return ''
  return title.length > 10 ? title.slice(0, 10) + '...' : title
}

const statusToKorean = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '공개'
    case 'INACTIVE':
      return '비공개'
    default:
      return '기타'
  }
}

onMounted(fetchComments)
</script>

<style scoped>
.table {
  font-size: 0.95rem;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f8fbff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table thead th {
  background-color: #e6f0ff;
  color: #1d3557;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 1px solid #d0e2ff;
}

.table tbody td {
  padding: 0.7rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e6ea;
  color: #333;
}

.table tbody tr:hover {
  background-color: #edf6ff;
  transition: background-color 0.2s ease;
}

.table-bordered th,
.table-bordered td {
  border: none;
}

th:nth-child(1),
td:nth-child(1) {
  min-width: 50px;
  white-space: nowrap;
}

.page-link {
  border-radius: 20px;
  margin: 0 2px;
  color: #1c3faa;
  border: 1px solid #cce0ff;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}
</style>
