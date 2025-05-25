<template>
  <div class="product-booking-view">
    <h2 class="mb-4">상품 예약</h2>

    <!-- 검색 폼 -->
    <product-booking-search @search="onSearch" />

    <!-- 예약 가능한 상품 리스트 -->
    <product-booking-list
      :products="products"
      :pageInfo="pageInfo"
      :loading="loading"
      @page-change="onPageChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import productService from '@/services/product'
import ProductBookingSearch from '@/components/products/ProductBookingSearch.vue'
import ProductBookingList from '@/components/products/ProductBookingList.vue'

const products = ref([])
const pageInfo = ref(null)
const loading = ref(false)

const searchCondition = ref({
  keyword: '',
  date: '',
  participantCount: null,
  pageNumber: 1,
  pageSize: 12,
})

const isInitialLoad = ref(true)

// 페이지 진입 시 전체 조회 실행
onMounted(() => {
  isInitialLoad.value = true
  searchProducts()
})

const onSearch = (params) => {
  searchCondition.value = { ...params, pageNumber: 1 }
  isInitialLoad.value = false
  searchProducts()
}

const searchProducts = async () => {
  loading.value = true
  try {
    const condition = { ...searchCondition.value }
    if (isInitialLoad.value) {
      // 필터 없이 요청
      delete condition.keyword
      delete condition.date
      delete condition.participantCount
    }

    const { data } = await productService.searchAvailableProducts(condition)
    products.value = data.content
    pageInfo.value = {
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    }
    console.log('조회된 상품:', data.content)
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.product-booking-view {
  padding: 1rem 0;
}
</style>
