<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold">상품 등록</h2>

    <form @submit.prevent="submitProduct">
      <!-- 관광지명 + 관광날짜 + 대표 이미지 -->
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">관광지명</label>
          <div class="position-relative">
            <input
              v-model="form.locationName"
              @input="searchAttractions"
              type="text"
              class="form-control"
              :class="{ 'border-primary border-2': isAttractionSelected }"
              autocomplete="off"
            />
            <ul
              v-if="suggestions.length"
              class="list-group position-absolute w-100 shadow"
              style="z-index: 10"
            >
              <li
                v-for="(title, idx) in suggestions"
                :key="idx"
                class="list-group-item list-group-item-action"
                @click="selectAttraction(title)"
              >
                {{ title }}
              </li>
            </ul>
          </div>
          <div class="mt-3">
            <label class="form-label">관광 날짜</label>
            <input v-model="form.startDate" type="date" class="form-control" required />
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

      <!-- 제목 -->
      <div class="mb-3">
        <label class="form-label">상품 제목</label>
        <input v-model="form.title" type="text" class="form-control" required />
      </div>

      <!-- 설명 -->
      <div class="mb-3">
        <label class="form-label">설명</label>
        <textarea v-model="form.description" class="form-control" rows="4"></textarea>
      </div>

      <!-- 인원, 가격 -->
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

      <!-- 운영 시간대 선택 -->
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

      <!-- 미팅 장소 -->
      <div class="mb-3">
        <label class="form-label">미팅 장소</label>
        <input v-model="form.meetingPlace" type="text" class="form-control" />
      </div>

      <!-- 미팅 시간 (몇 분 전), 소요 시간 -->
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

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
  thumbnailImg: '',
})

const previewImage = ref('')
const meetingBeforeMinutes = ref(30)

const suggestions = ref([])
const isAttractionSelected = ref(false)
const searchAttractions = async () => {
  const keyword = form.value.locationName.trim()
  isAttractionSelected.value = false
  if (!keyword) return (suggestions.value = [])
  const res = await axios.get(`/api/attractions/search?keyword=${keyword}`)
  suggestions.value = res.data
}
const selectAttraction = (title) => {
  form.value.locationName = title
  suggestions.value = []
  isAttractionSelected.value = true
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

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    previewImage.value = reader.result
  }
  reader.readAsDataURL(file)

  // 실제 업로드 처리 로직은 별도로 필요함
}

const submitProduct = () => {
  console.log(
    '등록할 데이터:',
    form.value,
    '시간대:',
    timeSlots.value,
    '몇 분 전:',
    meetingBeforeMinutes.value
  )
  // 등록 로직 작성 필요
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
.border-2 {
  border-width: 2px !important;
}
</style>
