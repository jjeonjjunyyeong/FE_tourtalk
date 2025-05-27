<template>
  <div class="product-detail container py-5" v-if="product">
    <!-- 목록으로 돌아가기 버튼 -->
    <div class="mb-3">
      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i> 목록으로 돌아가기
      </button>
    </div>

    <!-- 이미지 + 정보 카드 -->
    <div class="card shadow-sm mb-4">
      <div class="row g-0">
        <!-- 이미지 영역 -->
        <div class="col-md-5">
          <div class="image-container">
            <img
              v-if="product.thumbnailImg"
              :src="`${apiBase}/${product.thumbnailImg}`"
              class="img-fluid rounded-start h-100"
              :alt="product.title"
              style="object-fit: cover; width: 100%"
            />
            <div v-else class="no-image">
              <i class="bi bi-image"></i>
              <span>이미지 없음</span>
            </div>
          </div>
        </div>

        <!-- 상세 정보 -->
        <div class="col-md-7">
          <div class="card-body">
            <h3 class="card-title mb-3">{{ product.title }}</h3>
            <hr />
            <p><strong>출발일:</strong> {{ formatDate(product.startDate) }}</p>
            <p><strong>소요 시간:</strong> {{ product.duration }}시간</p>

            <p v-if="product.priceType === 'PER_PERSON'">
              <strong>1인당 가격:</strong> 💰 {{ product.price.toLocaleString() }}원
            </p>
            <p v-else-if="product.priceType === 'TOTAL'">
              <strong>총 금액:</strong> 💰 {{ product.price.toLocaleString() }}원
            </p>

            <p class="mb-2">
              <strong>모집 인원:</strong><br />
              최소: {{ product.minParticipants }}명<br />
              최대: {{ product.maxParticipants }}명
            </p>

            <p><strong>태그:</strong> {{ product.tags }}</p>
            <p><strong>모임 장소:</strong> {{ product.meetingPlace }}</p>
            <p><strong>등록일:</strong> {{ formatDateTime(product.createdAt) }}</p>
            <p v-if="curatorNickname"><strong>담당 학예사:</strong> {{ curatorNickname }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 소개 카드 -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">상세 소개</h5>
        <p>{{ product.description }}</p>
      </div>
    </div>

    <!-- 시간대 및 예약 현황 카드 -->
    <div v-if="product.timeSlots && product.timeSlots.length" class="card shadow-sm">
      <div class="card-body">
        <h5 class="mb-3">운영 시간대 및 예약 현황</h5>
        <hr />
        <ul class="list-group">
          <li
            v-for="time in product.timeSlots"
            :key="time"
            class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
          >
            <div class="d-flex align-items-center gap-3">
              <span>🕒 {{ formatTime(time) }}</span>
              <span
                class="badge"
                :class="{
                  'bg-success': getTimeSlotStatus(time) === '모집 중',
                  'bg-secondary': getTimeSlotStatus(time) === '모집 완료',
                  'bg-danger': getTimeSlotStatus(time) === '취소됨',
                }"
              >
                {{ getTimeSlotStatus(time) }}
              </span>
              <span>예약 {{ reservations[formatTime(time)] || 0 }}명</span>
            </div>
            <button
              class="btn btn-outline-primary btn-sm"
              :disabled="getTimeSlotStatus(time) !== '모집 중'"
              @click="goToBooking(time)"
            >
              <i class="bi bi-cart-plus me-1"></i> 예약하기
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="mt-3">상품 정보를 불러오는 중입니다...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import productService from '@/services/product'
import bookingService from '@/services/tourBooking'
import memberService from '@/services/member'

const route = useRoute()
const router = useRouter()
const productId = route.params.productId
const product = ref(null)
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const reservations = ref({})
const curatorNickname = ref('')

const goBack = () => {
  router.push({ name: 'ProductBooking' }) // ✅ 존재하는 라우트 이름 사용
}

const goToBooking = (time) => {
  const formattedTime = formatTime(time)
  router.push({ name: 'BookingView', params: { productId, time: formattedTime } })
}

const formatTime = (timeStr) => timeStr?.slice(0, 5)
const formatDate = (str) => {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
const formatDateTime = (str) => {
  if (!str) return ''
  const d = new Date(str)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`
}

const getTimeSlotStatus = (time) => {
  const reserved = reservations.value[formatTime(time)] || 0
  const max = product.value.maxParticipants
  if (product.value.status === 'CANCELLED') return '취소됨'
  if (reserved >= max) return '모집 완료'
  return '모집 중'
}

const loadCuratorNickname = async (mno) => {
  try {
    const { data } = await memberService.getNicknameByMno(mno)
    curatorNickname.value = data.nickname
  } catch (e) {
    console.warn('학예사 닉네임 조회 실패:', e)
  }
}

const loadProduct = async () => {
  try {
    const productRes = await productService.getProductById(productId)
    product.value = productRes.data

    if (product.value.mno) {
      await loadCuratorNickname(product.value.mno)
    }

    if (product.value.timeSlots && product.value.timeSlots.length > 0) {
      const countRes = await bookingService.getReservationsByTime(productId)
      reservations.value = countRes.data
    }
  } catch (e) {
    console.error('상품 상세 정보 로딩 실패:', e)
  }
}

onMounted(loadProduct)
</script>

<style scoped>
.image-container {
  height: 100%;
  min-height: 250px;
  background-color: #f8f9fa;
  position: relative;
}

.no-image {
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #adb5bd;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.list-group-item {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.badge {
  font-size: 0.85rem;
  padding: 0.4em 0.6em;
}
</style>
