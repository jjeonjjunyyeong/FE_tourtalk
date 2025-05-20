<template>
  <div class="board-list-view">
    <div class="container">
      <h2 class="mb-4">커뮤니티</h2>
      <!--기존 Q&A 게시판으로 표기-->

      <!-- 검색 영역 -->
      <board-search-form @search="onSearch" />

      <!-- 게시글 목록 -->
      <div class="card shadow-sm">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <span class="fw-bold">게시글 목록</span>
          <!--글쓰기 vue로 이동-->
          <router-link to="/boards/write" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>글쓰기
          </router-link>
        </div>
        <!--게시글 리스트-->
        <div class="card-body p-0">
          <board-list
            :boardList="boardList"
            :pageInfo="pageInfo"
            :loading="loading"
            @page-change="onPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BoardSearchForm from '@/components/board/BoardSearchForm.vue'
import BoardList from '@/components/board/BoardList.vue'
import boardService from '@/services/board'

export default {
  name: 'BoardListView',
  components: {
    BoardSearchForm,
    BoardList,
  },
  setup() {
    const route = useRoute() // 현재 라우트 정보
    const router = useRouter() // 라우팅 제어 및 조작에 사용
    const boardList = ref([])
    const pageInfo = ref(null)
    const loading = ref(false)

    // 검색 조건 초기화
    const searchCondition = reactive({
      searchType: route.query.searchType || '',
      keyword: route.query.keyword || '',
      status: route.query.status || '',
      orderBy: route.query.orderBy || 'createdAt',
      orderDirection: route.query.orderDirection || 'DESC',
      pageNumber: parseInt(route.query.page) || 1,
      pageSize: parseInt(route.query.size) || 10,
      categoryId: 1, // QnA 게시판 카테고리 ID (백엔드와 협의 필요)
    })

    // 게시글 목록 조회
    const fetchBoardList = async () => {
      try {
        loading.value = true

        // 쿼리스트링 업데이트
        updateQueryString()

        const { data } = await boardService.getBoardList(searchCondition)
        boardList.value = data.content || []
        pageInfo.value = {
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          first: data.first,
          last: data.last,
          startPage: data.startPage,
          endPage: data.endPage,
        }
      } catch (error) {
        boardList.value = []
        pageInfo.value = null
      } finally {
        loading.value = false
      }
    }

    // URL 쿼리스트링 업데이트
    const updateQueryString = () => {
      const query = {}

      // 빈 값이 아닌 필드만 쿼리에 추가
      if (searchCondition.searchType) query.searchType = searchCondition.searchType
      if (searchCondition.keyword) query.keyword = searchCondition.keyword
      if (searchCondition.status) query.status = searchCondition.status
      if (searchCondition.orderBy !== 'createdAt') query.orderBy = searchCondition.orderBy
      if (searchCondition.orderDirection !== 'DESC')
        query.orderDirection = searchCondition.orderDirection
      if (searchCondition.pageNumber > 1) query.page = searchCondition.pageNumber
      if (searchCondition.pageSize !== 10) query.size = searchCondition.pageSize

      // 현재 경로를 유지하면서 쿼리만 업데이트
      router.replace({
        path: route.path,
        query,
      })
    }

    // 검색 이벤트 핸들러
    const onSearch = (params) => {
      searchCondition.searchType = params.searchType
      searchCondition.keyword = params.keyword
      searchCondition.status = params.status
      searchCondition.pageNumber = 1 // 검색 시 첫 페이지로 초기화
      fetchBoardList()
    }

    // 페이지 변경 이벤트 핸들러
    const onPageChange = (page) => {
      searchCondition.pageNumber = page
      fetchBoardList()

      // 페이지 상단으로 스크롤
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    // 컴포넌트 마운트 시 게시글 목록 조회
    onMounted(() => {
      fetchBoardList()
    })

    return {
      boardList,
      pageInfo,
      loading,
      onSearch,
      onPageChange,
    }
  },
}
</script>

<style scoped>
.board-list-view {
  padding: 2rem 0;
}
</style>
