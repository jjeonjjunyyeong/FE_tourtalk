<template>
  <div class="board-list-view">
    <div class="container">
      <h2 class="mb-4">커뮤니티</h2>

      <board-search-form @search="onSearch" />

      <div class="card shadow-sm">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <span class="fw-bold">게시글 목록</span>
          <router-link to="/boards/write" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>글쓰기
          </router-link>
        </div>

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
    const route = useRoute()
    const router = useRouter()
    const boardList = ref([])
    const pageInfo = ref(null)
    const loading = ref(false)

    const searchCondition = reactive({
      keywordType: route.query.keywordType || '',
      keyword: route.query.keyword || '',
      status: route.query.status || '',
      orderBy: route.query.orderBy || 'createdAt',
      orderDirection: route.query.orderDirection || 'DESC',
      pageNumber: parseInt(route.query.page) || 1,
      pageSize: parseInt(route.query.size) || 10,
    })

    const fetchBoardList = async () => {
      try {
        loading.value = true
        updateQueryString()

        let data
        const isSearch =
          searchCondition.keyword?.trim().length > 0 ||
          searchCondition.keywordType?.trim().length > 0

        if (isSearch) {
          const res = await boardService.getBoardSearch(searchCondition)
          data = res.data
        } else {
          const params = {
            pageNumber: searchCondition.pageNumber,
            pageSize: searchCondition.pageSize,
            ...(searchCondition.status && { status: searchCondition.status }),
          }
          const res = await boardService.getBoardList(params)
          data = res.data
        }

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
        console.error('게시글 목록 조회 실패:', error)
        boardList.value = []
        pageInfo.value = null
      } finally {
        loading.value = false
      }
    }

    const updateQueryString = () => {
      const query = {}
      if (searchCondition.keywordType) query.keywordType = searchCondition.keywordType
      if (searchCondition.keyword) query.keyword = searchCondition.keyword
      if (searchCondition.status) query.status = searchCondition.status
      if (searchCondition.orderBy !== 'createdAt') query.orderBy = searchCondition.orderBy
      if (searchCondition.orderDirection !== 'DESC')
        query.orderDirection = searchCondition.orderDirection
      if (searchCondition.pageNumber > 1) query.page = searchCondition.pageNumber
      if (searchCondition.pageSize !== 10) query.size = searchCondition.pageSize

      router.replace({
        path: route.path,
        query,
      })
    }

    const onSearch = (params) => {
      searchCondition.keywordType = params.keywordType
      searchCondition.keyword = params.keyword
      searchCondition.status = params.status
      searchCondition.pageNumber = 1
      fetchBoardList()
    }

    const onPageChange = (page) => {
      searchCondition.pageNumber = page
      fetchBoardList()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onMounted(fetchBoardList)

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
