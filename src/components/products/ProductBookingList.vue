<template>
  <div class="product-booking-list">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩 중...</span>
      </div>
      <p class="mt-2">상품을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-5">
      <i class="bi bi-clipboard-x display-4 text-muted"></i>
      <h4 class="mt-3">조회된 상품이 없습니다</h4>
    </div>

    <div v-else class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col" v-for="product in products" :key="product.productId">
        <div class="card h-100 shadow-sm">
          <img
            v-if="product.thumbnailImg"
            :src="`${apiBase}/${product.thumbnailImg}`"
            class="card-img-top"
            :alt="product.title"
          />
          <div
            v-else
            class="placeholder-img card-img-top bg-secondary text-white d-flex align-items-center justify-content-center"
          >
            <span>이미지 없음</span>
          </div>

          <div class="card-body">
            <h5 class="card-title">{{ product.title }}</h5>
            <p class="card-text text-truncate">
              <strong>상품 소개 : </strong>{{ product.description }}
            </p>
            <p class="card-text text-end text-muted small">
              🗓 {{ formatDate(product.startDate) }} &nbsp; · ⏱ {{ product.duration }}시간
            </p>

            <div class="d-flex justify-content-between mt-3">
              <router-link
                class="btn btn-outline-primary btn-sm"
                :to="`/products/${product.productId}`"
              >
                <i class="bi bi-search me-1"></i> 자세히 보기
              </router-link>
              <router-link
                class="btn btn-primary btn-sm"
                :to="{ name: 'BookingView', params: { productId: product.productId } }"
              >
                <i class="bi bi-cart-plus me-1"></i> 예약하기
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 (선택) -->
    <div v-if="pageInfo && pageInfo.totalPages > 1" class="mt-4 d-flex justify-content-center">
      <nav>
        <ul class="pagination">
          <li
            class="page-item"
            :class="{ disabled: pageInfo.pageNumber === 1 }"
            @click="changePage(pageInfo.pageNumber - 1)"
          >
            <span class="page-link">이전</span>
          </li>
          <li
            v-for="page in pageInfo.totalPages"
            :key="page"
            class="page-item"
            :class="{ active: pageInfo.pageNumber === page }"
            @click="changePage(page)"
          >
            <span class="page-link">{{ page }}</span>
          </li>
          <li
            class="page-item"
            :class="{ disabled: pageInfo.pageNumber === pageInfo.totalPages }"
            @click="changePage(pageInfo.pageNumber + 1)"
          >
            <span class="page-link">다음</span>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  pageInfo: {
    type: Object,
    default: () => null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['page-change'])

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const changePage = (page) => {
  if (page !== props.pageInfo.pageNumber && page >= 1 && page <= props.pageInfo.totalPages) {
    emit('page-change', page)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}
</script>

<style scoped>
.card-img-top {
  height: 200px;
  object-fit: cover;
}
.placeholder-img {
  height: 200px;
  font-size: 1.2rem;
}
</style>
