<template>
  <div class="container py-5">
    <div class="mb-3">
      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i> 목록으로 돌아가기
      </button>
    </div>

    <h3 class="mb-4 text-center">📜 상품 예약</h3>

    <div v-if="product" class="card p-4 shadow-sm">
      <h4 class="mb-3">{{ product.title }}</h4>

      <p><strong>출발일 : </strong> {{ formatDate(product.startDate) }}</p>
      <p><strong>소요 시간 : </strong> {{ product.duration }}시간</p>

      <p v-if="product.priceType === 'PER_PERSON'">
        <strong>1인당 가격 : </strong> 💰 {{ product.price.toLocaleString() }}원
      </p>
      <p v-else><strong>총 금액 : </strong> 💰 {{ product.price.toLocaleString() }}원</p>

      <p>
        <strong>모집 인원 : </strong> 최소 {{ product.minParticipants }}명 / 최대
        {{ product.maxParticipants }}명
      </p>

      <p><strong>태그:</strong> {{ product.tags }}</p>
      <p><strong>모임 장소:</strong> {{ product.meetingPlace }}</p>
      <p v-if="curatorNickname"><strong>담당 학예사:</strong> {{ curatorNickname }}</p>

      <!-- 시간 선택 -->
      <div class="mt-4">
        <label for="time" class="form-label">시간 선택</label>
        <select v-model="selectedTime" class="form-select" id="time">
          <option disabled value="">-- 시간대를 선택하세요 --</option>
          <option
            v-for="time in product.timeSlots"
            :key="time"
            :value="formatTime(time)"
            :disabled="isTimeSlotFull(time)"
          >
            {{ formatTime(time) }} | (현재 예약: {{ reservations[formatTime(time)] || 0 }}명) | [{{
              getTimeSlotStatus(time)
            }}]
          </option>
        </select>
      </div>

      <!-- 인원 입력 -->
      <div class="mt-4">
        <label for="participants" class="form-label">예약 인원 수</label>
        <input
          v-model.number="participantCount"
          type="number"
          id="participants"
          class="form-control"
          min="1"
          :max="product.maxParticipants"
        />
      </div>

      <!-- 가격 계산 -->
      <div class="mt-3">
        <strong>총 가격:</strong>
        <span class="ms-2 text-success fw-bold">
          {{
            (product.priceType === 'PER_PERSON'
              ? product.price * participantCount
              : product.price
            ).toLocaleString()
          }}원
        </span>
      </div>

      <!-- 버튼 -->
      <div class="mt-4 d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary" @click="reserveOnly">
          <i class="bi bi-pencil-square me-1"></i> 예약하기
        </button>
        <button class="btn btn-primary" @click="payAndReserve">
          <i class="bi bi-credit-card me-1"></i> 결제하기
        </button>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">상품 정보를 불러오는 중입니다...</p>
    </div>

    <!-- 커스텀 모달 -->
    <BaseModal
      :visible="showModal"
      :message="modalMessage"
      :mode="modalMode"
      @close="showModal = false"
      @cancel="showModal = false"
      @confirm="handleConfirm"
      @custom-action-1="goToBookingList"
      @custom-action-2="goToMyPage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import productService from '@/services/product'
import bookingService from '@/services/tourBooking'
import memberService from '@/services/member'
import { useAuthStore } from '@/stores/authStore'
import BaseModal from '@/components/BaseModal.vue'

const route = useRoute()
const router = useRouter()
const productId = route.params.productId
const timeParam = route.params.time || ''
const product = ref(null)
const reservations = ref({})
const selectedTime = ref(timeParam || '')
const participantCount = ref(1)
const curatorNickname = ref('')
const auth = useAuthStore()

// 모달 상태
const showModal = ref(false)
const modalMessage = ref('')
const modalMode = ref('alert')
const onConfirm = ref(null)

const openModal = (msg, mode = 'alert', confirmCallback = null) => {
  modalMessage.value = msg
  modalMode.value = mode
  showModal.value = true
  onConfirm.value = confirmCallback
}
const openAlert = (msg) => openModal(msg, 'alert')
const handleConfirm = () => {
  if (onConfirm.value) onConfirm.value()
  showModal.value = false
}

const getTimeSlotStatus = (time) => {
  const reserved = reservations.value[formatTime(time)] || 0
  return reserved >= product.value.maxParticipants ? '모집 완료' : '모집 중'
}
const isTimeSlotFull = (time) => {
  return (reservations.value[formatTime(time)] || 0) >= product.value.maxParticipants
}
const formatDate = (str) => {
  const d = new Date(str)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
const formatTime = (t) => t?.slice(0, 5)
const goBack = () => router.push({ name: 'ProductBooking' })

const goToMyPage = () => router.push({ name: 'MyPageView', query: { tab: 'bookings' } })
const goToBookingList = () => router.push({ name: 'ProductBooking' })

const createRequest = (status, paymentStatus) => ({
  mno: auth.mno,
  productId: parseInt(productId),
  time: selectedTime.value + ':00',
  participantCount: participantCount.value,
  totalPrice:
    product.value.priceType === 'PER_PERSON'
      ? product.value.price * participantCount.value
      : product.value.price,
  paymentMethod: 'CREDIT_CARD',
  paymentStatus,
  status,
})

const reserveOnly = async () => {
  if (!selectedTime.value) return openAlert('시간을 선택해주세요.')
  try {
    await bookingService.createBooking(createRequest('PENDING_PAYMENT', 'UNPAID'))
    openModal(
      '✅ <strong>예약이 완료되었습니다!</strong><br>💳 결제가 완료되어야 예약이 확정됩니다.<br><span class="text-primary fw-bold">마이페이지 → 예약 상품</span>에서 결제를 진행해주세요.',
      'custom'
    )
  } catch (err) {
    console.error('예약 실패:', err)
    openAlert('예약에 실패했습니다.')
  }
}

const payAndReserve = async () => {
  if (!selectedTime.value) return openAlert('시간을 선택해주세요.')

  const res = await memberService.getMyInfo()
  const myInfo = res.data
  const totalPrice =
    product.value.priceType === 'PER_PERSON'
      ? product.value.price * participantCount.value
      : product.value.price

  const { IMP } = window
  const portoneImpCode = import.meta.env.VITE_PORTONE_IMP_CODE
  IMP.init(portoneImpCode)

  IMP.request_pay(
    {
      pg: 'html5_inicis.INIpayTest',
      pay_method: 'card',
      merchant_uid: `order_${Date.now()}`,
      name: product.value.title,
      amount: totalPrice,
      buyer_email: myInfo.email || 'guest@tour.com',
      buyer_name: myInfo.nickname || '비회원',
      buyer_tel: myInfo.phone || '010-1234-5678',
    },
    async (rsp) => {
      if (rsp.success) {
        try {
          await bookingService.createBooking({
            ...createRequest('RESERVED', 'PAID'),
            totalPrice,
          })
          openModal('결제 및 예약이 완료되었습니다!', 'custom')
        } catch (err) {
          console.error('예약 저장 실패:', err)
          openAlert('결제는 성공했지만 예약 저장에 실패했습니다. 관리자에게 문의해주세요.')
        }
      } else {
        openAlert(`결제 실패: ${rsp.error_msg}`)
      }
    }
  )
}

const loadCuratorNickname = async (mno) => {
  try {
    const res = await memberService.getNicknameByMno(mno)
    curatorNickname.value = res.data.nickname
  } catch {
    curatorNickname.value = ''
  }
}
const loadProduct = async () => {
  try {
    const res = await productService.getProductById(productId)
    product.value = res.data

    if (product.value.mno) await loadCuratorNickname(product.value.mno)
    if (product.value.timeSlots) {
      const countRes = await bookingService.getReservationsByTime(productId)
      reservations.value = countRes.data
    }
    if (!selectedTime.value && product.value.timeSlots.length > 0) {
      selectedTime.value = formatTime(product.value.timeSlots[0])
    }
  } catch (err) {
    console.error('상품 조회 실패:', err)
  }
}

onMounted(loadProduct)
</script>

<style scoped>
.card {
  border-radius: 1rem;
  border: none;
}
h3,
h4 {
  font-weight: bold;
}
.form-label {
  font-weight: 500;
}
.form-select,
.form-control {
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}
.mt-3,
.mt-4 {
  margin-top: 1.5rem !important;
}
.text-success {
  font-size: 1.2rem;
}
button {
  min-width: 140px;
}
</style>
