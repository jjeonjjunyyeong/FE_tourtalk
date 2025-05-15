<template>
  <div class="attraction-search card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-3">여행지 검색</h5>

      <form @submit.prevent="onSearch">
        <div class="row g-3">
          <!-- 콘텐츠 유형 선택 -->
          <div class="col-md-6 col-lg-3">
            <label for="contentType" class="form-label">콘텐츠 유형</label>
            <select
              id="contentType"
              v-model="searchParams.contentTypeId"
              class="form-select"
            >
              <option value="">전체</option>
              <option
                v-for="content in contentTypes"
                :key="content.id"
                :value="content.id"
              >
                {{ content.name }}
              </option>
            </select>
          </div>

          <!-- 시도 선택 -->
          <div class="col-md-6 col-lg-3">
            <label for="sido" class="form-label">지역</label>
            <select
              id="sido"
              v-model="searchParams.sidoCode"
              class="form-select"
              @change="onSidoChange"
            >
              <option value="">전체</option>
              <option
                v-for="sido in sidos"
                :key="sido.id"
                :value="sido.id"
              >
                {{ sido.name }}
              </option>
            </select>
          </div>

          <!-- 구군 선택 -->
          <div class="col-md-6 col-lg-3">
            <label for="gugun" class="form-label">시/군/구</label>
            <select
              id="gugun"
              v-model="searchParams.gugunCode"
              class="form-select"
              :disabled="!searchParams.sidoCode"
            >
              <option value="">전체</option>
              <option
                v-for="gugun in guguns"
                :key="gugun.id"
                :value="gugun.id"
              >
                {{ gugun.name }}
              </option>
            </select>
          </div>

          <!-- 키워드 검색 -->
          <div class="col-md-6 col-lg-3">
            <label for="keyword" class="form-label">키워드</label>
            <input
              type="text"
              id="keyword"
              v-model="searchParams.keyword"
              class="form-control"
              placeholder="검색어를 입력하세요"
            >
          </div>

          <!-- 추가 필터링 옵션 -->
          <div class="col-12">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="onlyWithImage"
                    v-model="searchParams.onlyWithImage"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="onlyWithImage">
                    이미지 있는 관광지만 표시
                  </label>
                </div>
              </div>

              <div class="col-auto">
                <div class="form-check">
                  <input
                    type="radio"
                    id="orderByDefault"
                    value=""
                    v-model="searchParams.orderBy"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="orderByDefault">
                    기본 정렬
                  </label>
                </div>
              </div>

              <div class="col-auto">
                <div class="form-check">
                  <input
                    type="radio"
                    id="orderByViewCount"
                    value="viewCount"
                    v-model="searchParams.orderBy"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="orderByViewCount">
                    인기순
                  </label>
                </div>
              </div>

              <div class="col-auto">
                <div class="form-check">
                  <input
                    type="radio"
                    id="orderByTitle"
                    value="title"
                    v-model="searchParams.orderBy"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="orderByTitle">
                    이름순
                  </label>
                </div>
              </div>

              <div class="col-auto ms-auto">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-search me-1"></i> 검색
                </button>
                <button type="button" class="btn btn-outline-secondary ms-2" @click="resetSearch">
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue';
import attractionService from '@/services/attraction';

export default {
  name: 'AttractionSearch',
  emits: ['search'],
  setup(props, { emit }) {
    // 검색 파라미터
    const searchParams = reactive({
      contentTypeId: '',
      sidoCode: '',
      gugunCode: '',
      keyword: '',
      onlyWithImage: false,
      orderBy: '',
      orderDirection: 'DESC',
      pageNumber: 1,
      pageSize: 12
    });

    // 카테고리 데이터
    const contentTypes = ref([]);
    const sidos = ref([]);
    const guguns = ref([]);
    const loading = ref(false);

    // 폼 데이터 조회
    const fetchFormData = async () => {
      try {
        loading.value = true;
        const { data } = await attractionService.getFormData();
        contentTypes.value = data.contentList || [];
        sidos.value = data.sidoList || [];
      } catch (error) {
        console.error('폼 데이터 조회 실패:', error);
        alert('카테고리 정보를 불러오는데 실패했습니다.');
      } finally {
        loading.value = false;
      }
    };

    // 시도 변경시 구군 목록 조회
    const onSidoChange = async () => {
      searchParams.gugunCode = ''; // 구군 선택 초기화

      if (!searchParams.sidoCode) {
        guguns.value = [];
        return;
      }

      try {
        loading.value = true;
        const { data } = await attractionService.getGugunList(searchParams.sidoCode);
        guguns.value = data || [];
      } catch (error) {
        console.error('구군 목록 조회 실패:', error);
        alert('시군구 정보를 불러오는데 실패했습니다.');
        guguns.value = [];
      } finally {
        loading.value = false;
      }
    };

    // 검색 실행
    const onSearch = () => {
      // 페이지 번호 초기화
      searchParams.pageNumber = 1;
      emit('search', { ...searchParams });
    };

    // 검색 조건 초기화
    const resetSearch = () => {
      Object.assign(searchParams, {
        contentTypeId: '',
        sidoCode: '',
        gugunCode: '',
        keyword: '',
        onlyWithImage: false,
        orderBy: '',
        orderDirection: 'DESC',
        pageNumber: 1
      });

      guguns.value = [];
      emit('search', { ...searchParams });
    };

    // 시도 변경 감지
    watch(() => searchParams.sidoCode, onSidoChange);

    // 컴포넌트 마운트 시 폼 데이터 조회
    onMounted(fetchFormData);

    return {
      searchParams,
      contentTypes,
      sidos,
      guguns,
      loading,
      onSidoChange,
      onSearch,
      resetSearch
    };
  }
};
</script>

<style scoped>
.attraction-search {
  margin-bottom: 2rem;
}
</style>
