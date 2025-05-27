<template>
  <div class="attraction-view">
    <div class="container-custom">
       <h2 class="mb-4">여행지 검색</h2>

      <!-- 검색 컴포넌트 -->
      <attraction-search @search="onSearch" />

      <!-- 검색 결과 -->
      <attraction-list
        :attractions="attractions"
        :pageInfo="pageInfo"
        :loading="loading"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AttractionSearch from '@/components/attraction/AttractionSearch.vue'
import AttractionList from '@/components/attraction/AttractionList.vue'
import attractionService from '@/services/attraction'

const route = useRoute()
const router = useRouter()
const attractions = ref([])
const pageInfo = ref(null)
const loading = ref(false)

// 검색 조건 초기화
const searchCondition = reactive({
  contentTypeId: route.query.contentTypeId || '',
  sidoCode: route.query.sidoCode || '',
  gugunCode: route.query.gugunCode || '',
  keyword: route.query.keyword || '',
  onlyWithImage: route.query.onlyWithImage === 'true',
  orderBy: route.query.orderBy || '',
  orderDirection: route.query.orderDirection || 'DESC',
  pageNumber: parseInt(route.query.page) || 1,
  pageSize: parseInt(route.query.size) || 12
})

// 관광지 검색
const searchAttractions = async () => {
  try {
    loading.value = true

    // 쿼리스트링 업데이트
    updateQueryString()

    const { data } = await attractionService.searchAttractions(searchCondition)
    attractions.value = data.content || []
    pageInfo.value = {
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      first: data.first,
      last: data.last,
      startPage: data.startPage,
      endPage: data.endPage
    }
  } catch (error) {
    console.error('관광지 검색 실패:', error)
    attractions.value = []
    pageInfo.value = null
  } finally {
    loading.value = false
  }
}

// URL 쿼리스트링 업데이트
const updateQueryString = () => {
  const query = {}

  // 빈 값이 아닌 필드만 쿼리에 추가
  if (searchCondition.contentTypeId) query.contentTypeId = searchCondition.contentTypeId
  if (searchCondition.sidoCode) query.sidoCode = searchCondition.sidoCode
  if (searchCondition.gugunCode) query.gugunCode = searchCondition.gugunCode
  if (searchCondition.keyword) query.keyword = searchCondition.keyword
  if (searchCondition.onlyWithImage) query.onlyWithImage = searchCondition.onlyWithImage
  if (searchCondition.orderBy) query.orderBy = searchCondition.orderBy
  if (searchCondition.orderDirection !== 'DESC') query.orderDirection = searchCondition.orderDirection
  if (searchCondition.pageNumber > 1) query.page = searchCondition.pageNumber
  if (searchCondition.pageSize !== 12) query.size = searchCondition.pageSize

  // 현재 경로를 유지하면서 쿼리만 업데이트
  router.replace({
    path: route.path,
    query
  })
}

// 검색 이벤트 핸들러
const onSearch = (params) => {
  // 검색 조건 업데이트
  Object.assign(searchCondition, params)
  searchAttractions()
}

// 페이지 변경 이벤트 핸들러
const onPageChange = (page) => {
  searchCondition.pageNumber = page
  searchAttractions()

  // 페이지 상단으로 스크롤
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 컴포넌트 마운트 시 검색 실행
searchAttractions()
</script>

<style scoped>
.attraction-view {
  padding: 1rem 0;
}

.container-custom {
  width: 80%;
  max-width: 80%;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 모바일 반응형 - 작은 화면에서는 90%로 조정 */
@media (max-width: 768px) {
  .container-custom {
    width: 90%;
    max-width: 90%;
  }
}

/* 아주 작은 화면에서는 95%로 조정 */
@media (max-width: 480px) {
  .container-custom {
    width: 95%;
    max-width: 95%;
  }
}
</style>