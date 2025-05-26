<template>
  <div class="product-manage container py-5">
    <h2 class="mb-4 fw-bold">내 상품 관리</h2>

    <div class="text-end mb-3">
      <router-link to="/products/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> 상품 등록
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">상품을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-5">
      <p class="text-muted">등록된 상품이 없습니다.</p>
    </div>

    <div v-else class="row g-4">
      <div v-for="product in products" :key="product.productId" class="col-md-4">
        <div class="card shadow-sm h-100">
          <img
            v-if="product.thumbnailImg"
            :src="`${apiBase}/${product.thumbnailImg}`"
            class="card-img-top"
            alt="썸네일"
            style="height: 200px; object-fit: cover"
          />
          <div class="card-body">
            <h5 class="card-title">{{ product.title }}</h5>
            <p class="card-text">{{ product.description }}</p>
            <p class="mb-1"><strong>기간:</strong> {{ product.duration }}시간</p>
            <p class="mb-1">
              <strong>모집상태:</strong>
              <span :class="statusClass(product.status)">{{ statusLabel(product.status) }}</span>
            </p>
            <div class="d-flex justify-content-between mt-3">
              <router-link
                :to="`/products/edit/${product.productId}`"
                class="btn btn-outline-primary btn-sm"
                >수정</router-link
              >
              <button
                class="btn btn-outline-danger btn-sm"
                @click="deleteProduct(product.productId)"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import productService from '@/services/product'

const loading = ref(false)
const products = ref([])
const apiBase = import.meta.env.VITE_API_BASE_URL

// 상품 상태 라벨
const statusLabel = (status) => {
  const map = {
    DRAFT: '비공개',
    OPEN: '모집 중',
    CLOSED: '모집 완료',
    CANCELLED: '취소됨',
  }
  return map[status] || '알수없음'
}

// 상태 클래스
const statusClass = (status) => {
  return {
    'text-success': status === 'OPEN',
    'text-danger': status === 'CANCELLED',
    'text-secondary': status === 'DRAFT',
    'text-muted': status === 'CLOSED',
  }
}

// 상품 목록 조회
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await productService.getMyProducts()
    products.value = res.data
  } catch (err) {
    console.error('상품 목록 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

// 상품 삭제
const deleteProduct = async (productId) => {
  if (!confirm('정말 취소하시겠습니까?')) return
  try {
    await productService.softDeleteProduct(productId)
    await fetchProducts() // 목록 전체를 다시 가져와서 갱신
  } catch (err) {
    console.error('상품 취소 실패:', err)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-manage .card-title {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
