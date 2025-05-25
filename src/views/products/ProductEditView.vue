<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold">상품 수정</h2>
    <form @submit.prevent="submitUpdate">
      <!-- 관광지명 + 태그 + 날짜 + 이미지 -->
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">관광지명</label>
          <input v-model="form.locationName" type="text" class="form-control" disabled />

          <div class="mt-3">
            <label class="form-label">태그</label>
            <select v-model="form.tags" class="form-select" required>
              <option disabled value="">태그를 선택하세요</option>
              <option v-for="tag in tagOptions" :key="tag" :value="tag">{{ tag }}</option>
            </select>
          </div>

          <div class="mt-3">
            <label class="form-label">관광 날짜</label>
            <input v-model="form.startDate" type="date" class="form-control" required />
          </div>

          <div class="mt-3">
            <label class="form-label">모집 상태</label>
            <select v-model="form.status" class="form-select">
              <option value="OPEN">모집 중</option>
              <option value="CLOSED">모집 완료</option>
              <option value="CANCELLED">취소</option>
              <option value="DRAFT">비공개</option>
            </select>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">상품 대표 이미지</label>
          <div
            class="mb-2 border rounded d-flex align-items-center justify-content-center bg-light"
            style="width: 100%; height: 180px; overflow: hidden"
          >
            <img
              v-if="previewImage"
              :src="previewImage"
              alt="미리보기"
              style="max-height: 100%; max-width: 100%; object-fit: contain"
            />
            <span v-else class="text-muted">이미지를 선택하세요</span>
          </div>
          <input type="file" class="form-control" @change="handleImageUpload" />
        </div>
      </div>

      <!-- 상품 정보 -->
      <div class="mb-3">
        <label class="form-label">상품 제목</label>
        <input v-model="form.title" type="text" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">설명</label>
        <textarea v-model="form.description" class="form-control" rows="4" />
      </div>

      <!-- 인원/가격 -->
      <div class="row">
        <div class="col-md-3 mb-3">
          <label class="form-label">최소 인원</label>
          <input v-model="form.minParticipants" type="number" class="form-control" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">최대 인원</label>
          <input v-model="form.maxParticipants" type="number" class="form-control" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">가격 타입</label>
          <select v-model="form.priceType" class="form-select" required>
            <option disabled value="">선택</option>
            <option value="TOTAL">총액</option>
            <option value="PER_PERSON">1인당</option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">가격</label>
          <input v-model="form.price" type="number" class="form-control" required />
        </div>
      </div>

      <!-- 시간대 + 예약 현황 -->
      <div class="mb-3">
        <label class="form-label">운영 시간대 (예약 현황)</label>
        <ul class="list-group">
          <li
            v-for="slot in form.timeSlots"
            :key="slot"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{{ slot }}</span>
            <span class="badge bg-primary rounded-pill">
              {{ bookingsPerTimeSlot[slot] || 0 }}/{{ form.maxParticipants }}
            </span>
          </li>
        </ul>
      </div>

      <!-- 미팅 장소 및 시간 -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">미팅 장소</label>
          <input v-model="form.meetingPlace" type="text" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">미팅 시간 (분 전)</label>
          <input v-model="form.meetingTime" type="number" class="form-control" />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">소요 시간 (시간)</label>
        <input v-model="form.duration" type="number" class="form-control" />
      </div>

      <div class="text-end">
        <button type="submit" class="btn btn-primary">수정 완료</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import productService from '@/services/product'
import fileService from '@/services/file'

const route = useRoute()
const router = useRouter()
const productId = route.params.productId

const tagOptions = [
  '역사',
  '문화',
  '자연',
  '체험',
  '가족',
  '힐링',
  '사진명소',
  '맛집투어',
  '야경',
  '트레킹',
]
const previewImage = ref('')
const bookingsPerTimeSlot = ref({})

const form = ref({
  title: '',
  description: '',
  minParticipants: 1,
  maxParticipants: 10,
  priceType: '',
  price: 0,
  startDate: '',
  meetingPlace: '',
  meetingTime: 0,
  duration: 1,
  locationName: '',
  locationNo: null,
  thumbnailImg: '',
  tags: '',
  status: 'OPEN',
  timeSlots: [],
})

const fetchProduct = async () => {
  try {
    const res = await productService.getProductById(productId)
    form.value = { ...res.data }
    previewImage.value = import.meta.env.VITE_API_BASE_URL + '/' + res.data.thumbnailImg
    bookingsPerTimeSlot.value = res.data.bookingsPerTimeSlot || {}
  } catch (err) {
    console.error('상품 상세 조회 실패:', err)
    alert('상품 정보를 불러오는 데 실패했습니다.')
    router.back()
  }
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    const result = await fileService.upload(file, 'products')
    form.value.thumbnailImg = result.filePath
    previewImage.value = import.meta.env.VITE_API_BASE_URL + '/' + result.filePath
  } catch (err) {
    console.error('이미지 업로드 실패:', err)
    alert('이미지 업로드에 실패했습니다.')
  }
}

const submitUpdate = async () => {
  try {
    await productService.updateProduct(productId, form.value)
    alert('상품이 성공적으로 수정되었습니다.')
    router.push('/products/manage')
  } catch (err) {
    console.error('상품 수정 실패:', err)
    alert('상품 수정 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.list-group-item {
  font-size: 15px;
}
</style>
