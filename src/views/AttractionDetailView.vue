<template>
  <div class="attraction-detail-view">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩중...</span>
      </div>
      <p class="mt-2">관광지 정보를 불러오는 중입니다...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="alert alert-danger text-center my-5">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <div class="mt-3">
        <router-link to="/attractions" class="btn btn-outline-primary">
          관광지 목록으로 돌아가기
        </router-link>
      </div>
    </div>

    <!-- 상세 정보 -->
    <div v-else-if="attraction" class="container">
      <div class="row">
        <!-- 좌측 컨텐츠 영역 -->
        <div class="col-lg-8">
          <!-- 기본 정보 -->
          <div class="card shadow-sm mb-4">
            <div class="row g-0">
              <!-- 이미지 영역 -->
              <div class="col-md-5">
                <div class="image-container">
                  <img
                    v-if="attraction.firstImage1"
                    :src="attraction.firstImage1"
                    class="img-fluid rounded-start h-100"
                    :alt="attraction.title"
                    style="object-fit: cover; width: 100%;"
                  >
                  <div v-else class="no-image">
                    <i class="bi bi-image"></i>
                    <span>이미지 없음</span>
                  </div>
                </div>
              </div>

              <!-- 정보 영역 -->
              <div class="col-md-7">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-2">
                    <span class="badge bg-primary me-2">{{ attraction.contentTypeName }}</span>
                    <span class="badge bg-info">
                      <i class="bi bi-eye me-1"></i> {{ attraction.viewCnt }}
                    </span>
                  </div>

                  <h3 class="card-title mb-2">{{ attraction.title }}</h3>

                  <p class="address mb-3">
                    <i class="bi bi-geo-alt-fill"></i>
                    {{ attraction.sido }} {{ attraction.gugun }} {{ attraction.addr }}
                  </p>

                  <div class="info-grid">
                    <div class="info-item" v-if="attraction.tel">
                      <div class="info-label">
                        <i class="bi bi-telephone me-1"></i> 연락처
                      </div>
                      <div class="info-value">{{ attraction.tel }}</div>
                    </div>

                    <div class="info-item" v-if="extractUrlFromHtml(attraction.homepage)">
                      <div class="info-label">
                        <i class="bi bi-globe me-1"></i> 웹사이트
                      </div>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-outline-primary" @click="openKakaoMap">
                      <i class="bi bi-map me-1"></i> 지도보기
                    </button>
                    <button 
                      v-if="extractUrlFromHtml(attraction.homepage)" 
                      class="btn btn-outline-secondary"
                      @click="openHomepage"
                    >
                      <i class="bi bi-globe me-1"></i> 홈페이지 방문
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 상세 설명 -->
          <!-- 상세 설명 카드에 AI 설명 버튼 추가 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>상세 설명</h4>
                <!-- AI 설명 보기 버튼 -->
                <button 
                  class="btn btn-outline-primary btn-sm"
                  @click="showAiDescription"
                  :disabled="aiLoading"
                >
                  <i v-if="!aiLoading" class="bi bi-robot me-1"></i>
                  <span v-if="aiLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  {{ aiLoading ? 'AI 분석 중...' : 'AI 설명 보기' }}
                </button>
              </div>
              
              <div v-if="attraction.overview" class="description" v-html="sanitizeHTML(attraction.overview)"></div>
              <p v-else class="text-muted">상세 설명이 없습니다.</p>
            </div>
          </div>

          <!-- AI 설명 모달 -->
          <div class="modal fade" id="aiDescriptionModal" tabindex="-1" aria-hidden="true" ref="aiModalRef">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">
                    <i class="bi bi-robot me-2 text-primary"></i>
                    AI가 분석한 {{ attraction?.title }} 설명
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  <!-- 로딩 상태 -->
                  <div v-if="aiLoading" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                      <span class="visually-hidden">AI 분석 중...</span>
                    </div>
                    <p class="text-muted">AI가 이 관광지에 대해 분석하고 있습니다...</p>
                  </div>
                  
                  <!-- AI 설명 내용 -->
                  <div v-else-if="aiDescription" class="ai-description">
                    <div class="alert alert-info d-flex align-items-start">
                      <i class="bi bi-info-circle me-2 mt-1"></i>
                      <div>
                        <strong>AI 설명</strong><br>
                        <small class="text-muted">
                          이 설명은 AI가 제공된 정보를 바탕으로 생성한 것입니다.
                        </small>
                      </div>
                    </div>
                    
                    <div class="ai-content">
                      <p style="white-space: pre-line; line-height: 1.6;">{{ aiDescription }}</p>
                    </div>
                  </div>
                  
                  <!-- 오류 상태 -->
                  <div v-else-if="aiError" class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
                    <h5>AI 설명을 불러올 수 없습니다</h5>
                    <p class="text-muted">{{ aiError }}</p>
                    <button class="btn btn-outline-primary" @click="showAiDescription">
                      <i class="bi bi-arrow-clockwise me-1"></i>
                      다시 시도
                    </button>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 사이드바 -->
        <div class="col-lg-4">
          <!-- 주변 관광지 -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">주변 관광지</h5>
            </div>
            <div class="card-body">
              <div v-if="nearbyAttractions.length === 0" class="text-center py-4">
                <i class="bi bi-map display-4 text-muted"></i>
                <p class="mt-2">주변 관광지가 없습니다.</p>
              </div>

              <div v-else class="nearby-list">
                <div
                  v-for="nearby in nearbyAttractions"
                  :key="nearby.no"
                  class="nearby-item mb-3"
                >
                  <router-link :to="`/attractions/${nearby.no}`" class="d-flex">
                    <div class="nearby-image">
                      <img
                        v-if="nearby.firstImage1"
                        :src="nearby.firstImage1"
                        :alt="nearby.title"
                        class="rounded"
                      >
                      <div v-else class="no-image rounded">
                        <i class="bi bi-image"></i>
                      </div>
                    </div>
                    <div class="nearby-info">
                      <div class="nearby-title">{{ nearby.title }}</div>
                      <div class="nearby-location">
                        {{ nearby.gugun }} · {{ nearby.contentTypeName }}
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- 여행 계획에 추가 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5>여행 계획에 추가하기</h5>
              <p class="text-muted small">이 관광지를 여행 계획에 추가하고 일정을 계획해보세요.</p>
              <button
                class="btn d-block"
                :class="isAddedToPlan ? 'btn-danger' : 'btn-primary'"
                @click="toggleTripPlan"
              >
                <i :class="isAddedToPlan ? 'bi bi-trash me-2' : 'bi bi-plus-circle me-2'"></i>
                {{ isAddedToPlan ? '일정에서 삭제' : '여행 계획에 추가' }}
              </button>
            </div>
          </div>

          <!-- Toast Container - Custom Toast -->
          <div v-if="showToastMessage" class="custom-toast-container">
            <div class="custom-toast" :class="{ 'show': showToastMessage }">
              <div class="toast-header">
                <i class="bi bi-info-circle text-primary me-2"></i>
                <strong class="me-auto">여행 계획</strong>
                <button type="button" class="btn-close" @click="hideToast"></button>
              </div>
              <div class="toast-body">
                {{ toastMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import attractionService from '@/services/attraction'
import aiService from '@/services/ai'

const props = defineProps({
  no: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['view-map', 'add-to-plan', 'select-nearby'])

const route = useRoute()
const attraction = ref(null)
const nearbyAttractions = ref([])
const loading = ref(true)
const error = ref(null)
const map = ref(null)
const isAddedToPlan = ref(false)
const toastMessage = ref('')
const showToastMessage = ref(false)

// AI 관련 상태 변수들
const aiLoading = ref(false)
const aiDescription = ref('')
const aiError = ref('')
const aiModalRef = ref(null)
let aiModal = null

// HTML에서 URL 추출 함수
const extractUrlFromHtml = (htmlString) => {
  if (!htmlString) return null
  
  const hrefMatch = htmlString.match(/href="([^"]*)"/)
  if (hrefMatch && hrefMatch[1]) {
    return decodeURIComponent(hrefMatch[1])
  }
  
  const urlMatch = htmlString.match(/(https?:\/\/[^\s<>"]+)/)
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1]
  }
  
  return null
}

// 카카오맵 열기
const openKakaoMap = () => {
  if (!attraction.value) return
  
  if (attraction.value.latitude && attraction.value.longitude) {
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(attraction.value.title)},${attraction.value.latitude},${attraction.value.longitude}`
    window.open(kakaoMapUrl, '_blank', 'noopener,noreferrer')
  } else {
    alert('위치 정보가 없어 지도를 표시할 수 없습니다.')
  }
}

// 홈페이지 열기
const openHomepage = () => {
  if (!attraction.value) return
  
  const extractedUrl = extractUrlFromHtml(attraction.value.homepage)
  if (extractedUrl) {
    window.open(extractedUrl, '_blank', 'noopener,noreferrer')
  }
}

// HTML 태그 필터링
const sanitizeHTML = (html) => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
}

// AI 설명 표시 함수 (안전한 모달 처리)
const showAiDescription = async () => {
  if (!attraction.value) return
  
  // 모달이 초기화되지 않았다면 초기화 시도
  if (!aiModal && aiModalRef.value) {
    try {
      const { Modal } = await import('bootstrap')
      aiModal = new Modal(aiModalRef.value)
    } catch (error) {
      console.error('Bootstrap Modal 초기화 실패:', error)
      return
    }
  }
  
  // 모달 표시
  if (aiModal) {
    aiModal.show()
  }
  
  // 이미 AI 설명이 있으면 다시 로드하지 않음
  if (aiDescription.value && !aiError.value) {
    return
  }
  
  try {
    aiLoading.value = true
    aiError.value = ''
    aiDescription.value = ''
    
    // AI 서비스 호출
    const attractionName = attraction.value.title
    const address = `${attraction.value.sido} ${attraction.value.gugun} ${attraction.value.addr || ''}`
    const overview = attraction.value.overview || ''
    
    const { data } = await aiService.attractionInfo(attractionName, address, overview)
    aiDescription.value = data.message || data.data?.message || '[응답 파싱 실패]';
    
  } catch (error) {
    console.error('AI 설명 생성 실패:', error)
    aiError.value = '현재 AI 기능을 사용할 수 없습니다.'
  } finally {
    aiLoading.value = false
  }
}

// 관광지 상세 정보 조회
const fetchAttractionDetail = async () => {
  const attractionId = Number(props.no)
  if (isNaN(attractionId)) {
    error.value = '잘못된 관광지 ID 입니다.'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const { data } = await attractionService.getAttractionDetail(attractionId)

    if (!data) {
      error.value = '관광지 정보를 찾을 수 없습니다.'
      return
    }

    attraction.value = data.attraction
    nearbyAttractions.value = data.nearbyAttractions || []

    setTimeout(() => {
      initMap()
    }, 100)
  } catch (err) {
    console.error('관광지 상세 정보 조회 실패:', err)
    error.value = '관광지 정보를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 지도 초기화
const initMap = () => {
  if (!attraction.value || !attraction.value.latitude || !attraction.value.longitude) return

  if (window.kakao && window.kakao.maps) {
    createMap()
  } else {
    const script = document.createElement('script')
    script.onload = () => {
      const callback = () => createMap()
      window.kakao.maps.load(callback)
    }
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&autoload=false`
    document.head.appendChild(script)
  }
}

// 지도 생성
const createMap = () => {
  const container = document.getElementById('map')
  if (!container) return

  const options = {
    center: new window.kakao.maps.LatLng(
      attraction.value.latitude,
      attraction.value.longitude
    ),
    level: attraction.value.mapLevel || 3
  }

  map.value = new window.kakao.maps.Map(container, options)

  const markerPosition = new window.kakao.maps.LatLng(
    attraction.value.latitude,
    attraction.value.longitude
  )

  const marker = new window.kakao.maps.Marker({
    position: markerPosition
  })

  marker.setMap(map.value)

  const iwContent = `<div style="padding:5px;">${attraction.value.title}</div>`
  const infowindow = new window.kakao.maps.InfoWindow({
    content: iwContent
  })

  infowindow.open(map.value, marker)
}

// 토스트 메시지 생성
const generateToastMessage = () => {
  const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}')
  const attractionNames = tripPlan.attractions.map(attr => attr.title).join(', ')
  return `등록된 일정 : ${attractionNames || '없음'}`
}

// 토스트 보여주기
const showToast = () => {
  toastMessage.value = generateToastMessage()
  showToastMessage.value = true
  
  setTimeout(() => {
    showToastMessage.value = false
  }, 2000)
}

// 토스트 숨기기
const hideToast = () => {
  showToastMessage.value = false
}

// 여행 계획 추가/삭제 토글
const toggleTripPlan = () => {
  if (!attraction.value) return

  const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}')
  const existingIndex = tripPlan.attractions.findIndex(item => item.no === attraction.value.no)

  if (existingIndex !== -1) {
    tripPlan.attractions.splice(existingIndex, 1)
    localStorage.setItem('tripPlan', JSON.stringify(tripPlan))
    isAddedToPlan.value = false
  } else {
    tripPlan.attractions.push(attraction.value)
    localStorage.setItem('tripPlan', JSON.stringify(tripPlan))
    isAddedToPlan.value = true
  }

  showToast()
}

// 여행 계획 추가 상태 확인
const checkTripPlanStatus = () => {
  if (!attraction.value) return

  const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}')
  const exists = tripPlan.attractions.some(item => item.no === attraction.value.no)
  isAddedToPlan.value = exists
}

// attraction 값이 변경될 때 여행 계획 상태 확인
watch(attraction, (newAttraction) => {
  if (newAttraction) {
    checkTripPlanStatus()
    // 새로운 관광지로 변경되면 AI 설명 초기화
    aiDescription.value = ''
    aiError.value = ''
  }
})

// 컴포넌트 마운트 시 초기화 (수정된 부분)
onMounted(async () => {
  // DOM이 완전히 렌더링될 때까지 기다림
  await nextTick()
  
  // Bootstrap 모달 초기화
  try {
    const { Modal } = await import('bootstrap')
    if (aiModalRef.value) {
      aiModal = new Modal(aiModalRef.value)
    }
  } catch (error) {
    console.error('Bootstrap Modal 초기화 실패:', error)
  }
  
  // 데이터 조회
  fetchAttractionDetail()
})
</script>

<style scoped>
.attraction-image {
  position: relative;
  height: 400px;
  background-color: #f8f9fa;
  overflow: hidden;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
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

.badge-container {
  position: absolute;
  top: 20px;
  right: 20px;
}

.address {
  font-size: 1.1rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.description {
  line-height: 1.7;
}

.info-item {
  margin-bottom: 1rem;
}

.info-label {
  color: #6c757d;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.nearby-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  margin-right: 1rem;
}

.nearby-image img, .nearby-image .no-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nearby-image .no-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
  font-size: 1.5rem;
}

.nearby-info {
  flex-grow: 1;
  overflow: hidden;
}

.nearby-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nearby-location {
  font-size: 0.85rem;
  color: #6c757d;
}

.nearby-item a {
  color: inherit;
  text-decoration: none;
}

.nearby-item:hover {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

/* 커스텀 Toast 스타일 */
.custom-toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}

.custom-toast {
  min-width: 300px;
  max-width: 400px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.custom-toast.show {
  transform: translateX(0);
  opacity: 1;
}

.custom-toast .toast-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: #6c757d;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-top-left-radius: calc(0.375rem - 1px);
  border-top-right-radius: calc(0.375rem - 1px);
}

.custom-toast .toast-body {
  padding: 0.75rem;
  word-wrap: break-word;
}

.custom-toast .btn-close {
  padding: 0.25rem 0.25rem;
  margin: -0.125rem -0.125rem -0.125rem auto;
  background: transparent;
  border: 0;
  border-radius: 0.375rem;
  opacity: 0.5;
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 1em;
}

.custom-toast .btn-close:hover {
  opacity: 0.75;
}
</style>