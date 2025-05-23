<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold">상품 등록</h2>

    <form @submit.prevent="submitProduct">
      <div class="mb-3">
        <label class="form-label">제목</label>
        <input v-model="form.title" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">설명</label>
        <textarea v-model="form.description" class="form-control" rows="4"></textarea>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">최대 인원</label>
          <input v-model="form.maxParticipants" type="number" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">최소 인원</label>
          <input v-model="form.minParticipants" type="number" class="form-control" required />
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">가격</label>
          <input v-model="form.price" type="number" class="form-control" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">가격 타입</label>
          <select v-model="form.priceType" class="form-select" required>
            <option disabled value="">선택</option>
            <option value="TOTAL">총액</option>
            <option value="PER_PERSON">1인당</option>
          </select>
        </div>
      </div>
      <!-- 시간대 선택 -->
      <!-- 운영 시간대 -->
      <div class="mb-3">
        <label class="form-label">운영 시간대</label>
        <div class="d-flex flex-wrap gap-2">
          <div
            v-for="(time, index) in timeSlots"
            :key="index"
            class="time-slot d-flex align-items-center justify-content-between"
          >
            <span>{{ time }}</span>
            <button type="button" class="btn-close btn-sm" @click="removeTimeSlot(index)"></button>
          </div>

          <div class="d-flex align-items-center gap-2">
            <select v-model="newTime" class="form-select" style="width: 130px">
              <option disabled value="">시간 선택</option>
              <option v-for="time in availableTimes" :key="time" :value="time">{{ time }}</option>
            </select>
            <button class="btn btn-outline-primary btn-sm" @click="addTimeSlot">추가</button>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">시작일</label>
        <input v-model="form.startDate" type="date" class="form-control" required />
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">미팅 시간 (자동 지정)</label>
          <input v-model="form.meetingTime" type="time" class="form-control" readonly />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">소요 시간 (시간 단위)</label>
          <input v-model="form.duration" type="number" class="form-control" required />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">관광지</label>
        <input v-model="form.locationName" type="number" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">미팅 장소</label>
        <input v-model="form.meetingPlace" type="text" class="form-control" />
      </div>

      <div class="mb-4">
        <label class="form-label">썸네일 이미지 경로</label>
        <input v-model="form.thumbnailImg" type="text" class="form-control" />
      </div>

      <div class="text-end">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          등록하기
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import productService from '@/services/product'
const timeSlots = ref([])
const newTime = ref('')
const availableTimes = Array.from({ length: (22 - 8 + 1) * 2 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

const addTimeSlot = () => {
  if (newTime.value && !timeSlots.value.includes(newTime.value)) {
    timeSlots.value.push(newTime.value)
    newTime.value = ''
    updateMeetingTime()
  }
}
const removeTimeSlot = (index) => {
  timeSlots.value.splice(index, 1)
  updateMeetingTime()
}

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
  mno: authStore.mno,
  title: '',
  description: '',
  maxParticipants: 10,
  minParticipants: 1,
  priceType: '',
  price: 0,
  startDate: '',
  status: 'DRAFT',
  thumbnailImg: '',
  tags: '',
  meetingPlace: '',
  meetingTime: '',
  duration: 1,
  locationName: '',
})

const submitProduct = async () => {
  if (!form.value.title || !form.value.priceType || !form.value.startDate) {
    alert('필수 정보를 입력해주세요.')
    return
  }

  loading.value = true
  try {
    // 1. 상품 등록
    const productRes = await productService.createProduct(form.value)
    const productId = productRes.data.productId

    // 2. 유효한 시간만 저장
    const validSlots = timeSlots.value.filter((t) => t && t.trim() !== '')
    await Promise.all(validSlots.map((t) => productService.createTimeSlot(productId, t)))

    alert('상품이 등록되었습니다.')
    router.push('/products/manage')
  } catch (err) {
    console.error('상품 등록 실패:', err)
    alert('상품 등록 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const updateMeetingTime = () => {
  if (timeSlots.value.length === 0) {
    form.value.meetingTime = ''
    return
  }

  // 가장 빠른 시간 기준
  const sorted = [...timeSlots.value].sort()
  const firstTime = sorted[0]

  const [hour, minute] = firstTime.split(':').map(Number)
  let meetingHour = hour
  let meetingMinute = minute - 30

  if (meetingMinute < 0) {
    meetingHour -= 1
    meetingMinute += 60
  }

  form.value.meetingTime = `${meetingHour.toString().padStart(2, '0')}:${meetingMinute
    .toString()
    .padStart(2, '0')}`
}
</script>

<style scoped>
label {
  font-weight: 500;
}
.time-slot {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  margin-bottom: 5px;
}
</style>
