<template>
  <div class="hotplace-list-view">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>핫플레이스</h2>
        <router-link to="/hotplaces/create" class="btn btn-primary">
          <i class="bi bi-plus-circle me-1"></i>
          핫플레이스 등록
        </router-link>
      </div>

      <!-- 검색 컴포넌트 -->
      <hotplace-search @search="onSearch" />

      <!-- 탭 메뉴 -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button
            :class="['nav-link', { active: currentTab === 'all' }]"
            @click="switchTab('all')"
          >
            전체 핫플레이스
          </button>
        </li>
        <li class="nav-item">
          <button
            :class="['nav-link', { active: currentTab === 'popular' }]"
            @click="switchTab('popular')"
          >
            인기 핫플레이스
          </button>
        </li>
      </ul>

      <!-- 핫플레이스 목록 -->
      <hotplace-list
        :hotplaces="hotplaces"
        :pageInfo="pageInfo"
        :loading="loading"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HotplaceSearch from '@/components/hotplace/HotplaceSearch.vue';
import HotplaceList from '@/components/hotplace/HotplaceList.vue';
import hotplaceService from '@/services/hotplace';

export default {
  name: 'HotplaceListView',
  components: {
    HotplaceSearch,
    HotplaceList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const hotplaces = ref([]);
    const pageInfo = ref(null);
    const loading = ref(false);
    const currentTab = ref('all');

    // 검색 조건 초기화
    const searchCondition = reactive({
      keyword: route.query.keyword || '',
      contentTypeId: route.query.contentTypeId || '',
      page: parseInt(route.query.page) || 1,
      size: parseInt(route.query.size) || 12
    });

    // 핫플레이스 목록 조회
    const fetchHotplaces = async () => {
      try {
        loading.value = true;

        // 쿼리스트링 업데이트
        updateQueryString();

        let response;
        if (currentTab.value === 'popular') {
          response = await hotplaceService.getPopularHotplaces(20);
          hotplaces.value = response.data || [];
          pageInfo.value = null; // 인기 목록은 페이징 없음
        } else if (searchCondition.keyword || searchCondition.contentTypeId) {
          response = await hotplaceService.searchHotplaces(searchCondition);
          hotplaces.value = response.data.content || [];
          pageInfo.value = {
            pageNumber: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            first: response.data.first,
            last: response.data.last,
            startPage: response.data.startPage,
            endPage: response.data.endPage
          };
        } else {
          response = await hotplaceService.getAllHotplaces(searchCondition);
          hotplaces.value = response.data.content || [];
          pageInfo.value = {
            pageNumber: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            first: response.data.first,
            last: response.data.last,
            startPage: response.data.startPage,
            endPage: response.data.endPage
          };
        }
      } catch (error) {
        console.error('핫플레이스 목록 조회 실패:', error);
        hotplaces.value = [];
        pageInfo.value = null;
      } finally {
        loading.value = false;
      }
    };

    // URL 쿼리스트링 업데이트
    const updateQueryString = () => {
      const query = {};

      // 빈 값이 아닌 필드만 쿼리에 추가
      if (searchCondition.keyword) query.keyword = searchCondition.keyword;
      if (searchCondition.contentTypeId) query.contentTypeId = searchCondition.contentTypeId;
      if (searchCondition.page > 1) query.page = searchCondition.page;
      if (searchCondition.size !== 12) query.size = searchCondition.size;

      // 현재 경로를 유지하면서 쿼리만 업데이트
      router.replace({
        path: route.path,
        query
      });
    };

    // 검색 이벤트 핸들러
    const onSearch = (params) => {
      searchCondition.keyword = params.keyword;
      searchCondition.contentTypeId = params.contentTypeId;
      searchCondition.page = 1; // 검색 시 첫 페이지로 초기화
      currentTab.value = 'all'; // 검색 시 전체 탭으로 이동
      fetchHotplaces();
    };

    // 페이지 변경 이벤트 핸들러
    const onPageChange = (page) => {
      searchCondition.page = page;
      fetchHotplaces();

      // 페이지 상단으로 스크롤
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // 탭 전환
    const switchTab = (tab) => {
      currentTab.value = tab;
      searchCondition.page = 1;

      if (tab === 'popular') {
        // 인기 탭으로 전환 시 검색 조건 초기화
        searchCondition.keyword = '';
        searchCondition.contentTypeId = '';
      }

      fetchHotplaces();
    };

    // 컴포넌트 마운트 시 핫플레이스 목록 조회
    onMounted(() => {
      fetchHotplaces();
    });

    return {
      hotplaces,
      pageInfo,
      loading,
      currentTab,
      onSearch,
      onPageChange,
      switchTab
    };
  }
};
</script>

<style scoped>
.hotplace-list-view {
  padding: 2rem 0;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #4361ee;
  border-bottom-color: #4361ee;
  background-color: transparent;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #4361ee;
}
</style>
