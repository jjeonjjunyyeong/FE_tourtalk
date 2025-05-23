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
              <td>{{ index + 1 + (page.value - 1) * size }}</td>
              <td class="text-start">{{ post.title }}</td>
              <td>{{ post.viewCount }}</td>
              <td>{{ post.commentCount }}</td>
              <td>{{ formatDate(post.createdAt) }}</td>
              <td>{{ formatStatus(post.status) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 페이징 버튼 -->
        <nav class="mt-3 d-flex justify-content-center">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: page.value === 1 }">
              <button class="page-link" @click="changePage(page.value - 1)">이전</button>
            </li>
            <li
              v-for="p in totalPages"
              :key="p"
              class="page-item"
              :class="{ active: p === page.value }"
            >
              <button class="page-link" @click="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: page.value === totalPages }">
              <button class="page-link" @click="changePage(page.value + 1)">다음</button>
            </li>
          </ul>
        </nav>
      </div>

      <p v-else class="text-center my-5 text-muted">작성한 게시글이 없습니다.</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import boardService from '@/services/board'
import { useAuthStore } from '@/stores/authStore' // 사용자 정보 추출용 (예: Pinia 등에서 사용)

// 상태
const posts = ref([])
const page = ref(1)
const size = 10
const totalPages = ref(1)
const authStore = useAuthStore()
const writerId = computed(() => authStore.mno)

const fetchPosts = async () => {
  try {
    const res = await boardService.getMyPosts({
      writerId: writerId.value,
      page: page.value,
      size,
    })

    posts.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.log('게시글 목록을 불러오는데 실패했습니다.')
  }
}

const changePage = (p) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchPosts()
}

const formatDate = (dateStr) => dateStr?.substring(0, 10) || ''
const formatStatus = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '정상'
    case 'DELETED':
      return '삭제됨'
    case 'INACTIVE':
      return '비공개'
    default:
      return status
  }
}

onMounted(fetchPosts)
</script>
