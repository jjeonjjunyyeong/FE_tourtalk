<template>
  <div class="hotplace-search card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-3">핫플레이스 검색</h5>

      <form @submit.prevent="onSearch">
        <div class="row g-3">
          <!-- 카테고리 선택 -->
          <div class="col-md-4">
            <label for="contentType" class="form-label">카테고리</label>
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

          <!-- 키워드 검색 -->
          <div class="col-md-6">
            <label for="keyword" class="form-label">키워드</label>
            <input
              type="text"
              id="keyword"
              v-model="searchParams.keyword"
              class="form-control"
              placeholder="장소명, 설명, 후기로 검색하세요"
            >
          </div>

          <!-- 검색 버튼 -->
          <div class="col-md-2 d-flex align-items-end">
            <div class="d-grid w-100">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-search me-1"></i> 검색
              </button>
            </div>
          </div>

          <!-- 초기화 버튼 -->
          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-secondary" @click="resetSearch">
              <i class="bi bi-arrow-clockwise me-1"></i> 초기화
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits } from 'vue'
import hotplaceService from '@/services/hotplace'

const emit = defineEmits(['search'])

// 검색 파라미터
const searchParams = reactive({
  contentTypeId: '',
  keyword: ''
})

// 카테고리 데이터
const contentTypes = ref([])
const loading = ref(false)

// 카테고리 목록 조회
const fetchContentTypes = async () => {
  try {
    loading.value = true
    const { data } = await hotplaceService.getContentTypes()
    contentTypes.value = data.contentList || []
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error)
    alert('카테고리 정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 검색 실행
const onSearch = () => {
  emit('search', { ...searchParams })
}

// 검색 조건 초기화
const resetSearch = () => {
  Object.assign(searchParams, {
    contentTypeId: '',
    keyword: ''
  })

  emit('search', { ...searchParams })
}

// 컴포넌트 마운트 시 카테고리 목록 조회
onMounted(fetchContentTypes)
</script>

<style scoped>
.hotplace-search {
  margin-bottom: 2rem;
}
</style>