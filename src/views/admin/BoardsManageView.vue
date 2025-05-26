<template>
  <div class="container py-5">
    <h3 class="fw-bold text-center mb-4">게시글 관리</h3>

    <!-- 필터 영역 -->
    <div class="d-flex gap-3 mb-3">
      <input
        v-model="search.keyword"
        type="text"
        class="form-control"
        placeholder="제목 또는 작성자"
      />
      <select v-model="search.category" class="form-select">
        <option value="">전체 카테고리</option>
        <option value="NOTICE">공지사항</option>
        <option value="FREE">자유게시판</option>
        <option value="QNA">QnA</option>
        <option value="INQUIRY">문의</option>
        <option value="REVIEW">리뷰</option>
      </select>
      <select v-model="search.status" class="form-select">
        <option value="">전체 상태</option>
        <option value="ACTIVE">공개</option>
        <option value="INACTIVE">비공개</option>
        <option value="DELETED">삭제됨</option>
      </select>
      <button class="btn btn-primary" @click="fetchPosts">검색</button>
    </div>

    <!-- 게시글 목록 -->
    <table class="table table-bordered text-center align-middle">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>카테고리</th>
          <th>제목</th>
          <th>작성자</th>
          <th>조회수</th>
          <th>댓글수</th>
          <th>상태</th>
          <th>작성일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.postId">
          <td>{{ post.postId }}</td>
          <td>{{ getCategoryLabel(post.category) }}</td>
          <td>{{ post.title }}</td>
          <td>{{ post.writerNickname }}</td>
          <td>{{ post.viewCount }}</td>
          <td>{{ post.commentCount }}</td>
          <td>{{ getStatusLabel(post.status) }}</td>
          <td>{{ formatDate(post.createdAt) }}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary" @click="editingPostId = post.postId">
              수정
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <nav class="d-flex justify-content-center mt-4">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(page - 1)">이전</a>
        </li>
        <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: page === p }">
          <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
        </li>
        <li class="page-item" :class="{ disabled: page === totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(page + 1)">다음</a>
        </li>
      </ul>
    </nav>

    <!-- 수정 모달 -->
    <BoardsEditModal
      v-if="editingPostId"
      :post-id="editingPostId"
      @close="editingPostId = null"
      @success="handleSuccess"
    />

    <!-- 알림 모달 -->
    <BaseModal
      :visible="showModal"
      :message="modalMessage"
      mode="alert"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BoardsEditModal from '@/components/common/BoardsEditModal.vue'
import BaseModal from '@/components/BaseModal.vue'
import boardService from '@/services/admin'

const posts = ref([])
const page = ref(1)
const size = 10
const totalPages = ref(1)

const search = ref({
  keyword: '',
  category: '',
  status: '',
})

// 모달
const showModal = ref(false)
const modalMessage = ref('')
const openModal = (msg) => {
  modalMessage.value = msg
  showModal.value = true
}
const editingPostId = ref(null)
const handleSuccess = () => {
  editingPostId.value = null
  fetchPosts()
  openModal('게시글이 수정되었습니다.')
}

const fetchPosts = async () => {
  const res = await boardService.getBoardList({
    ...search.value,
    pageNumber: page.value,
    pageSize: size,
  })
  posts.value = res.data.content
  totalPages.value = res.data.totalPages
}

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
    fetchPosts()
  }
}

// 변환 함수
const getCategoryLabel = (category) => {
  const map = {
    NOTICE: '공지사항',
    FREE: '자유',
    QNA: 'QnA',
    INQUIRY: '문의',
    REVIEW: '리뷰',
  }
  return map[category] || category
}

const getStatusLabel = (status) => {
  const map = {
    ACTIVE: '공개',
    INACTIVE: '비공개',
    DELETED: '삭제됨',
  }
  return map[status] || status
}

const formatDate = (datetime) => {
  return datetime?.slice(0, 10) || ''
}

onMounted(fetchPosts)
</script>
