<template>
  <div class="hotplace-list">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩중...</span>
      </div>
      <p class="mt-2">핫플레이스를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="hotplaces.length === 0" class="text-center py-5">
      <i class="bi bi-geo-alt display-4 text-muted"></i>
      <h4 class="mt-3">검색 결과가 없습니다</h4>
      <p class="text-muted">다른 검색 조건으로 다시 시도해보세요.</p>
    </div>

    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="hotplace in hotplaces" :key="hotplace.id" class="col">
        <hotplace-card :hotplace="hotplace" />
      </div>
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

<script setup>
import { computed, defineEmits, defineProps } from 'vue'
import HotplaceCard from './HotplaceCard.vue'

const props = defineProps({
  hotplaces: {
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
})

const emit = defineEmits(['page-change'])

// 화면에 표시할 페이지 번호 계산
const displayedPages = computed(() => {
  if (!props.pageInfo) return []

  const { pageNumber, startPage, endPage } = props.pageInfo
  let pages = []

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// 페이지 변경 이벤트 핸들러
const onPageChange = (page) => {
  if (page < 1 || page > props.pageInfo.totalPages) return
  if (page === props.pageInfo.pageNumber) return

  emit('page-change', page)
}
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