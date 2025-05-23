<template>
  <div class="my-posts container-fluid py-5">
    <h3 class="text-center mb-4 fw-bold">내가 작성한 게시글</h3>

    <div class="card shadow p-4 rounded-4 mx-auto" style="max-width: 1000px">
      <div v-if="posts.length" class="table-responsive">
        <table class="table table-bordered table-hover text-center align-middle">
          <thead class="table-light">
            <tr>
              <th style="width: 5%">번호</th>
              <th style="width: 40%">제목</th>
              <th style="width: 10%">조회수</th>
              <th style="width: 10%">댓글수</th>
              <th style="width: 20%">작성일</th>
              <th style="width: 15%">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(post, index) in posts" :key="post.postId">
              <td>{{ index + 1 + (page - 1) * size }}</td>
              <td class="text-start">
                <router-link
                  :to="`/boards/${post.postId}`"
                  class="text-decoration-none text-dark fw-semibold"
                >
                  {{ truncateTitle(post.title) }}
                </router-link>
              </td>
              <td>{{ post.viewCount }}</td>
              <td>{{ post.commentCount }}</td>
              <td>{{ formatDate(post.createdAt) }}</td>
              <td>{{ formatStatus(post.status) }}</td>
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

      <p v-else class="text-center my-5 text-muted">작성한 게시글이 없습니다.</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import boardService from '@/services/board'
import { useAuthStore } from '@/stores/authStore'

const posts = ref([])
const page = ref(1)
const size = 10
const totalPages = ref(1)
const authStore = useAuthStore()
const writerId = computed(() => authStore.mno)

const postNumber = (index) => index + 1 + (page.value - 1) * size

const fetchPosts = async () => {
  try {
    const res = await boardService.getMyPosts(writerId.value, page.value, size)
    posts.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.error('게시글 목록을 불러오는데 실패했습니다.', err)
  }
}

const truncateTitle = (title) => {
  if (!title) return ''
  return title.length > 15 ? title.slice(0, 15) + '...' : title
}

watch(page, fetchPosts)
onMounted(fetchPosts)

const changePage = (p) => {
  const next = Number(p)
  if (!isNaN(next) && next >= 1 && next <= totalPages.value) {
    page.value = next
  }
}

const prevPage = () => {
  if (page.value > 1) page.value--
}

const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}

const formatDate = (dateStr) => dateStr?.substring(0, 10) || ''

const formatStatus = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '공개'
    case 'DELETED':
      return '삭제됨'
    case 'INACTIVE':
      return '비공개'
    default:
      return status
  }
}
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

.router-link {
  color: #1c3faa;
  font-weight: 500;
  text-decoration: none;
}

.router-link:hover {
  color: #0d6efd;
  text-decoration: underline;
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
