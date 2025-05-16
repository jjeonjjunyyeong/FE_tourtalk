<template>
  <div class="board-list">
    <!-- 로딩 표시 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩중...</span>
      </div>
      <p class="mt-2">게시글을 불러오는 중입니다...</p>
    </div>

    <!-- 게시글이 없는 경우 -->
    <div v-else-if="boardList.length === 0" class="text-center py-5">
      <i class="bi bi-clipboard-x display-4 text-muted"></i>
      <h4 class="mt-3">게시글이 없습니다</h4>
      <p class="text-muted">첫 번째 게시글을 작성해보세요.</p>
    </div>

    <!-- 게시글 목록 테이블 -->
    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th style="width: 10%">번호</th>
            <th style="width: 50%">제목</th>
            <th style="width: 15%">작성자</th>
            <th style="width: 15%">작성일</th>
            <th style="width: 10%">조회수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="board in boardList" :key="board.postId" @click="viewDetail(board.postId)" style="cursor: pointer">
            <td>{{ board.postId }}</td>
            <td class="text-start">
              {{ board.title }}
              <span v-if="board.commentCount > 0" class="ms-2 badge bg-secondary">
                {{ board.commentCount }}
              </span>
              <span v-if="board.status !== 'ACTIVE'" class="ms-2 badge bg-warning">
                {{ getStatusLabel(board.status) }}
              </span>
            </td>
            <td>{{ getWriterName(board.writerId) }}</td>
            <td>{{ formatDate(board.createdAt) }}</td>
            <td>{{ board.viewCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="pageInfo && pageInfo.totalPages > 1" class="pagination-container mt-4">
      <nav aria-label="Page navigation">
        <ul class="pagination justify-content-center">
          <!-- 처음 페이지 -->
          <li :class="['page-item', { disabled: pageInfo.first }]">
            <a class="page-link" href="#" @click.prevent="onPageChange(1)">
              <i class="bi bi-chevron-double-left"></i>
            </a>
          </li>

          <!-- 이전 페이지 -->
          <li :class="['page-item', { disabled: pageInfo.first }]">
            <a class="page-link" href="#" @click.prevent="onPageChange(pageInfo.pageNumber - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>

          <!-- 페이지 번호 -->
          <li v-for="page in displayedPages" :key="page"
              :class="['page-item', { active: page === pageInfo.pageNumber }]">
            <a class="page-link" href="#" @click.prevent="onPageChange(page)">
              {{ page }}
            </a>
          </li>

          <!-- 다음 페이지 -->
          <li :class="['page-item', { disabled: pageInfo.last }]">
            <a class="page-link" href="#" @click.prevent="onPageChange(pageInfo.pageNumber + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>

          <!-- 마지막 페이지 -->
          <li :class="['page-item', { disabled: pageInfo.last }]">
            <a class="page-link" href="#" @click.prevent="onPageChange(pageInfo.totalPages)">
              <i class="bi bi-chevron-double-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'BoardList',
  props: {
    boardList: {
      type: Array,
      default: () => []
    },
    pageInfo: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['page-change'],
  setup(props, { emit }) {
    const router = useRouter();
    
    // 임시로 사용자 정보를 저장 (실제로는 API 호출 또는 스토어에서 관리)
    const userMap = ref({
      1: '관리자',
      2: '홍길동',
      3: '김철수'
      // 실제 환경에서는 API를 통해 사용자 정보를 가져오는 것이 좋음
    });

    // 화면에 표시할 페이지 번호 계산
    const displayedPages = computed(() => {
      if (!props.pageInfo) return [];

      const { pageNumber, startPage, endPage } = props.pageInfo;
      let pages = [];

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    });

    // 게시글 상태 레이블 반환
    const getStatusLabel = (status) => {
      switch (status) {
        case 'ACTIVE':
          return '공개';
        case 'INACTIVE':
          return '비공개';
        case 'DELETED':
          return '삭제됨';
        default:
          return '알 수 없음';
      }
    };

    // 작성자 ID로 이름 찾기 (실제로는 API 호출 또는 스토어에서 처리)
    const getWriterName = (writerId) => {
      return userMap.value[writerId] || `사용자#${writerId}`;
    };

    // 페이지 변경 이벤트 핸들러
    const onPageChange = (page) => {
      if (page < 1 || page > props.pageInfo.totalPages) return;
      if (page === props.pageInfo.pageNumber) return;

      emit('page-change', page);
    };

    // 게시글 상세 페이지로 이동
    const viewDetail = (postId) => {
      router.push(`/boards/${postId}`);
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };

    return {
      displayedPages,
      onPageChange,
      viewDetail,
      formatDate,
      getStatusLabel,
      getWriterName
    };
  }
};
</script>

<style scoped>
.pagination-container {
  overflow-x: auto;
}

.page-link {
  color: #4361ee;
}

.page-item.active .page-link {
  background-color: #4361ee;
  border-color: #4361ee;
}
</style>