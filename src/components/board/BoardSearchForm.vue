<template>
  <div class="board-search-form card shadow-sm mb-4">
    <div class="card-body">
      <form @submit.prevent="onSearch">
        <div class="row g-3">
          <!-- 검색 유형 선택 -->
          <div class="col-md-3">
            <select v-model="searchParams.searchType" class="form-select">
              <option value="">전체</option>
              <option value="title">제목</option>
              <option value="writer">작성자</option>
              <option value="content">내용</option>
            </select>
          </div>

          <!-- 검색어 입력 -->
          <div class="col-md-6">
            <input 
              type="text" 
              class="form-control" 
              v-model="searchParams.keyword"
              placeholder="검색어를 입력하세요"
            >
          </div>

          <!-- 상태 필터링 -->
          <div class="col-md-3">
            <select v-model="searchParams.status" class="form-select">
              <option value="">모든 상태</option>
              <option value="ACTIVE">공개</option>
              <option value="INACTIVE">비공개</option>
            </select>
          </div>

          <!-- 검색 버튼 -->
          <div class="col-12 d-flex justify-content-end">
            <button type="reset" class="btn btn-outline-secondary me-2" @click="resetSearch">
              <i class="bi bi-arrow-clockwise me-1"></i> 초기화
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-search me-1"></i> 검색
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  name: 'BoardSearchForm',
  emits: ['search'],
  setup(props, { emit }) {
    // 검색 파라미터
    const searchParams = reactive({
      searchType: '',
      keyword: '',
      status: ''
    });

    // 검색 실행
    const onSearch = () => {
      emit('search', { ...searchParams });
    };

    // 검색 초기화
    const resetSearch = () => {
      searchParams.searchType = '';
      searchParams.keyword = '';
      searchParams.status = '';
      emit('search', { ...searchParams });
    };

    return {
      searchParams,
      onSearch,
      resetSearch
    };
  }
};
</script>

<style scoped>
.board-search-form {
  background-color: #f8f9fa;
}
</style>