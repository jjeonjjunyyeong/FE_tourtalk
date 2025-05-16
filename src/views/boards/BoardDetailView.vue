<template>
  <div class="board-detail-view">
    <div class="container">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
        <p class="mt-2">게시글을 불러오는 중입니다...</p>
      </div>

      <!-- 오류 상태 -->
      <div v-else-if="error" class="alert alert-danger text-center my-5">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
        <div class="mt-3">
          <router-link to="/boards" class="btn btn-outline-primary">
            게시글 목록으로 돌아가기
          </router-link>
        </div>
      </div>

      <!-- 게시글 상세 정보 -->
      <div v-else-if="board" class="card shadow-sm">
        <div class="card-header bg-light">
          <h3 class="card-title mb-0">{{ board.title }}</h3>
        </div>
        <div class="card-body">
          <div class="mb-3 d-flex justify-content-between border-bottom pb-3">
            <div>
              <span class="fw-bold me-2">작성자:</span> {{ getWriterName(board.writerId) }}
              <span v-if="board.status !== 'ACTIVE'" class="ms-2 badge bg-warning">
                {{ getStatusLabel(board.status) }}
              </span>
            </div>
            <div>
              <span class="me-3"><i class="bi bi-calendar-date me-1"></i> {{ formatDate(board.createdAt) }}</span>
              <span><i class="bi bi-eye me-1"></i> {{ board.viewCount }}</span>
            </div>
          </div>

          <!-- 게시글 내용 -->
          <div class="board-content mb-4">
            <div v-html="board.content"></div>
          </div>

          <!-- 첨부 파일 -->
          <div v-if="board.filePath" class="mt-3 mb-4 p-3 bg-light rounded">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark me-2"></i>
              <a :href="board.filePath" target="_blank" class="text-decoration-none">
                첨부 파일 다운로드
              </a>
            </div>
          </div>

          <!-- 버튼 영역 -->
          <div class="d-flex justify-content-between mt-4">
            <router-link to="/boards" class="btn btn-secondary">
              <i class="bi bi-list me-1"></i> 목록
            </router-link>
            <div>
              <router-link :to="`/boards/edit/${board.postId}`" class="btn btn-primary me-2">
                <i class="bi bi-pencil me-1"></i> 수정
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import boardService from '@/services/board';

export default {
  name: 'BoardDetailView',
  setup() {
    const route = useRoute();
    const board = ref(null);
    const loading = ref(true);
    const error = ref(null);

    // 임시로 사용자 정보를 저장 (실제로는 API 호출 또는 스토어에서 관리)
    const userMap = ref({
      1: '관리자',
      2: '홍길동',
      3: '김철수'
      // 실제 환경에서는 API를 통해 사용자 정보를 가져오는 것이 좋음
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

    // 날짜 포맷팅
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // 게시글 상세 정보 조회
    const fetchBoardDetail = async () => {
      const postId = Number(route.params.no);
      if (isNaN(postId)) {
        error.value = '잘못된 게시글 ID 입니다.';
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        const { data } = await boardService.getBoardDetail(postId);

        if (!data) {
          error.value = '게시글 정보를 찾을 수 없습니다.';
          return;
        }

        board.value = data;
      } catch (err) {
        console.error('게시글 상세 정보 조회 실패:', err);
        error.value = '게시글 정보를 불러오는데 실패했습니다.';
      } finally {
        loading.value = false;
      }
    };

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(() => {
      fetchBoardDetail();
    });

    return {
      board,
      loading,
      error,
      formatDate,
      getStatusLabel,
      getWriterName
    };
  }
};
</script>

<style scoped>
.board-detail-view {
  padding: 2rem 0;
}

.board-content {
  min-height: 300px;
}
</style>