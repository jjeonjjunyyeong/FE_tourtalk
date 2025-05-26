<template>
  <div class="card shadow-sm p-4">
    <h4 class="mb-3">내 예약 상품</h4>

    <div v-if="!loading && bookings.length">
      <ul class="list-group list-group-flush">
        <li v-for="booking in bookings" :key="booking.bookingId" class="list-group-item">
          <div class="row">
            <div class="col-md-6">
              <p>
                <strong>상품명 : </strong>
                <router-link
                  :to="`/products/${booking.productId}`"
                  class="text-decoration-underline text-primary"
                >
                  {{ booking.title }}
                </router-link>
              </p>
              <p><strong>담당 학예사 : </strong> {{ booking.curatorNickname || '정보 없음' }}</p>
              <p><strong>인원 : </strong> {{ booking.participantCount }}명</p>
              <p><strong>총 가격 : </strong> {{ booking.totalPrice.toLocaleString() }}원</p>
            </div>
            <div class="col-md-6">
              <p><strong>출발날짜 : </strong> {{ booking.startDate }}</p>
              <p><strong>예약 시간 : </strong> {{ booking.time }}</p>
              <p>
                <strong>결제 상태 : </strong>
                <span :class="statusBadgeClass(booking.paymentStatus)">
                  {{ paymentStatusLabel(booking.paymentStatus) }}
                </span>
              </p>
              <p>
                <strong>예약 상태 : </strong>
                <span :class="statusBadgeClass(booking.status)">
                  {{ bookingStatusLabel(booking.status) }}
                </span>
              </p>
            </div>
          </div>

          <!-- 버튼 영역 -->
          <div class="d-flex justify-content-end mt-3 gap-2">
            <button
              class="btn btn-outline-danger"
              :class="{ disabled: booking.status === 'CANCELLED' }"
              :disabled="booking.status === 'CANCELLED'"
              @click="cancel(booking)"
            >
              예약 취소
            </button>

            <button
              class="btn btn-primary"
              :class="{
                disabled: booking.paymentStatus === 'PAID' || booking.status === 'CANCELLED',
              }"
              :disabled="booking.paymentStatus === 'PAID' || booking.status === 'CANCELLED'"
              @click="pay(booking)"
            >
              {{ booking.loading ? '결제 중...' : '결제하기' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
    <p v-else-if="!loading" class="text-muted">예약한 상품이 없습니다.</p>
    <div v-else class="text-center py-3">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">예약 정보를 불러오는 중입니다...</p>
    </div>
  </div>
  <BaseModal
    :visible="showModal"
    :message="modalMessage"
    :mode="modalMode"
    @close="showModal = false"
    @cancel="showModal = false"
    @confirm="onConfirm && onConfirm()"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import bookingService from '@/services/tourBooking'
import memberService from '@/services/member'
import BaseModal from '@/components/BaseModal.vue'

// 모달 상태
const showModal = ref(false)
const modalMessage = ref('')
const modalMode = ref('alert') // 'alert' 또는 'confirm'
const onConfirm = ref(null)

// 알림 모달
const openAlert = (msg) => {
  modalMessage.value = msg
  modalMode.value = 'alert'
  showModal.value = true
}

// 확인 모달
const openConfirm = (msg, callback) => {
  modalMessage.value = msg
  modalMode.value = 'confirm'
  onConfirm.value = () => {
    callback()
    showModal.value = false
  }
  showModal.value = true
}

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
})

const bookings = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await bookingService.getMyBookings()
    bookings.value = res.data
  } catch (err) {
    console.error('예약 목록 조회 실패:', err)
  } finally {
    loading.value = false
  }
})

// 한글 라벨
const paymentStatusLabel = (status) => {
  const map = {
    UNPAID: '미결제',
    PAID: '결제완료',
    REFUNDED: '환불',
  }
  return map[status] || '알수없음'
}

const bookingStatusLabel = (status) => {
  const map = {
    PENDING_PAYMENT: '결제 대기',
    RESERVED: '예약 완료',
    CANCELLED: '취소됨',
    COMPLETED: '투어 완료',
  }
  return map[status] || '알수없음'
}

// 상태별 배지 클래스
const statusBadgeClass = (status) => {
  return (
    {
      UNPAID: 'badge text-bg-secondary',
      PAID: 'badge text-bg-success',
      REFUNDED: 'badge text-bg-warning',
      PENDING_PAYMENT: 'badge text-bg-secondary',
      RESERVED: 'badge text-bg-primary',
      CANCELLED: 'badge text-bg-danger',
      COMPLETED: 'badge text-bg-dark',
    }[status] || 'badge text-bg-light'
  )
}

const fetchBookings = async () => {
  loading.value = true
  try {
    const res = await bookingService.getMyBookings()
    bookings.value = res.data
  } catch (err) {
    console.error('예약 목록 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

// 예약 취소
const cancel = async (booking) => {
  openConfirm('정말 예약을 취소하시겠습니까?', async () => {
    try {
      await bookingService.cancelBooking(booking.bookingId)
      openAlert('예약이 취소되었습니다.')
      fetchBookings()
    } catch (err) {
      console.error('예약 취소 실패:', err)
      openAlert('예약 취소에 실패했습니다.')
    }
  })
}

// 결제
const pay = async (booking) => {
  if (booking.paymentStatus === 'PAID') return
  booking.loading = true

  try {
    const res = await memberService.getMyInfo()
    const myInfo = res.data

    const { IMP } = window
    const portoneImpCode = import.meta.env.VITE_PORTONE_IMP_CODE
    IMP.init(portoneImpCode)

    IMP.request_pay(
      {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid: `order_${Date.now()}`,
        name: booking.title,
        amount: booking.totalPrice,
        buyer_email: myInfo.email || 'guest@tour.com',
        buyer_name: myInfo.nickname || '비회원',
        buyer_tel: myInfo.phone || '010-1234-5678',
      },
      async function (rsp) {
        if (rsp.success) {
          try {
            await bookingService.confirmPayment(booking.bookingId)
            openAlert('결제가 완료되었습니다.')
            fetchBookings()
          } catch (err) {
            console.error('결제 상태 업데이트 실패', err)
          }
        } else {
          openAlert('결제에 실패했습니다: ' + rsp.error_msg)
        }
        booking.loading = false
      }
    )
  } catch (err) {
    console.error('회원 정보 조회 실패:', err)
    booking.loading = false
    openAlert('회원 정보를 불러오는 데 실패했습니다.')
  }
}
</script>

<style scoped>
.list-group-item {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 0;
}
.btn {
  min-width: 120px;
}
.badge {
  font-size: 0.9rem;
  padding: 0.5em 0.7em;
  border-radius: 0.5rem;
}
</style>
