<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold">상품 등록</h2>
    <form @submit.prevent="submitProduct">
      <!-- 관광지명 + 관광날짜 + 태그 + 대표 이미지 -->
      <div class="row mb-3">
        <!-- 왼쪽 영역 -->
        <div class="col-md-6">
          <label class="form-label">관광지명</label>
          <div class="position-relative">
            <div v-if="isAttractionSelected" class="selected-tag">
              {{ form.locationName }}
              <span class="remove-btn" @click="clearAttraction">&times;</span>
            </div>
            <input
              v-else
              v-model="form.locationName"
              type="text"
              class="form-control"
              autocomplete="off"
            />
            <ul
              v-if="suggestions.length && !isAttractionSelected"
              class="list-group position-absolute w-100 shadow"
              style="z-index: 10"
            >
              <li
                v-for="(item, idx) in suggestions"
                :key="item.no"
                class="list-group-item list-group-item-action"
                :class="{ active: highlightedIndex === idx }"
                @click="selectAttraction(item)"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>

          <!-- ✅ 태그가 먼저 -->
          <div class="mt-3">
            <label class="form-label">태그</label>
            <select v-model="form.tags" class="form-select" required>
              <option disabled value="">태그를 선택하세요</option>
              <option v-for="tag in tagOptions" :key="tag" :value="tag">
                {{ tag }}
              </option>
            </select>
          </div>

          <!-- ✅ 관광 날짜가 그 아래 -->
          <div class="mt-3">
            <label class="form-label">관광 날짜</label>
            <input v-model="form.startDate" type="date" class="form-control" required />
          </div>
        </div>

        <!-- 오른쪽 영역 (이미지) -->
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
        <textarea v-model="form.description" class="form-control" rows="4"></textarea>
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

      <!-- 시간대 선택 -->
      <div class="mb-3">
        <label class="form-label">운영 시간대</label>
        <div class="mb-2">
          <button type="button" class="btn btn-outline-primary me-2" @click="setTimeMode('00')">
            00분
          </button>
          <button type="button" class="btn btn-outline-primary" @click="setTimeMode('30')">
            30분
          </button>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="time in filteredTimes.filter(
                  (t) => parseInt(t.split(':')[0]) >= 8 && parseInt(t.split(':')[0]) <= 19
                )"
                :key="time"
                type="button"
                class="btn btn-sm"
                :class="timeSlots.includes(time) ? 'btn-primary' : 'btn-outline-secondary'"
                @click="toggleTimeSlot(time)"
              >
                {{ time }}
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="time in filteredTimes.filter(
                  (t) => parseInt(t.split(':')[0]) < 8 || parseInt(t.split(':')[0]) > 19
                )"
                :key="time"
                type="button"
                class="btn btn-sm"
                :class="timeSlots.includes(time) ? 'btn-primary' : 'btn-outline-secondary'"
                @click="toggleTimeSlot(time)"
              >
                {{ time }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 미팅장소/미팅시간/소요시간 -->
      <div class="mb-3">
        <label class="form-label">미팅 장소</label>
        <input v-model="form.meetingPlace" type="text" class="form-control" />
      </div>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">미팅 시간 (몇 분 전)</label>
          <input
            v-model="meetingBeforeMinutes"
            type="number"
            class="form-control"
            placeholder="예: 30"
          />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">소요 시간 (시간 단위)</label>
          <input v-model="form.duration" type="number" class="form-control" required />
        </div>
      </div>

      <div class="text-end">
        <button type="submit" class="btn btn-primary">등록하기</button>
      </div>
    </form>
    <BaseModal
      :visible="showModal"
      :message="modalMessage"
      :mode="modalType"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import attractionService from '@/services/attraction'
import productService from '@/services/product'
import fileService from '@/services/file'
import BaseModal from '@/components/BaseModal.vue'

// 모달 관련 설정
const showModal = ref(false)
const modalMessage = ref('')
const modalType = ref('success')
const openModal = (message, type = 'success') => {
  modalMessage.value = message
  modalType.value = type
  showModal.value = true
}

const router = useRouter()

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

const form = ref({
  title: '',
  description: '',
  minParticipants: 1,
  maxParticipants: 10,
  priceType: '',
  price: 0,
  startDate: '',
  meetingPlace: '',
  meetingTime: '',
  duration: 1,
  locationName: '',
  locationNo: null,
  thumbnailImg: '',
  tags: '',
  status: 'OPEN',
})

const previewImage = ref('')
const meetingBeforeMinutes = ref(30)

const suggestions = ref([])
const isAttractionSelected = ref(false)
const highlightedIndex = ref(-1)

watch(
  () => form.value.locationName,
  async (newVal) => {
    if (!newVal.trim() || isAttractionSelected.value) {
      suggestions.value = []
      return
    }
    const res = await attractionService.getAttractionTitles(newVal.trim())
    suggestions.value = res.data.map((item) => ({ no: item.no, title: item.title }))
    highlightedIndex.value = -1
  }
)

const selectAttraction = (item) => {
  form.value.locationName = item.title
  form.value.locationNo = item.no
  suggestions.value = []
  isAttractionSelected.value = true
  highlightedIndex.value = -1
}

const clearAttraction = () => {
  form.value.locationName = ''
  form.value.locationNo = null
  isAttractionSelected.value = false
}

const timeMode = ref('00')
const timeSlots = ref([])

const allTimes = computed(() => {
  const result = []
  for (let h = 0; h < 24; h++) {
    result.push(`${h.toString().padStart(2, '0')}:00`)
    result.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return result
})

const filteredTimes = computed(() => allTimes.value.filter((t) => t.endsWith(timeMode.value)))

const toggleTimeSlot = (time) => {
  const idx = timeSlots.value.indexOf(time)
  if (idx === -1) timeSlots.value.push(time)
  else timeSlots.value.splice(idx, 1)
}

const setTimeMode = (mode) => {
  timeMode.value = mode
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const result = await fileService.upload(file, 'products') // 업로드 경로 구분
    console.log('업로드 응답:', result)

    if (!result?.filePath) {
      throw new Error('파일 경로가 응답에 없습니다.')
    }

    form.value.thumbnailImg = result.filePath

    const baseUrl = import.meta.env.VITE_API_BASE_URL
    previewImage.value = `${baseUrl}/${result.filePath}`
    openModal('이미지 업로드 성공', 'alert')
  } catch (err) {
    console.error('상품 이미지 업로드 실패:', err)
    form.value.thumbnailImg = ''
    previewImage.value = ''
    openModal('상품 이미지 업로드에 실패했습니다.', 'alert')
  }
}

const submitProduct = async () => {
  try {
    const payload = {
      ...form.value,
      timeSlots: timeSlots.value,
      meetingBeforeMinutes: Number(meetingBeforeMinutes.value),
    }
    await productService.createProduct(payload)
    openModal('상품이 성공적으로 등록되었습니다.', 'alert')
  } catch (err) {
    console.error('상품 등록 실패:', err)
    openModal('상품 등록에 실패했습니다.', 'alert')
  }
}

const handleModalClose = () => {
  showModal.value = false
  if (modalMessage.value.includes('등록되었습니다')) {
    router.push('/products/manage')
  }
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
.border-2 {
  border-width: 2px !important;
}
.selected-tag {
  background-color: #e7f1ff;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #004085;
}
.remove-btn {
  margin-left: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #004085;
}
.remove-btn:hover {
  color: red;
}
</style>
