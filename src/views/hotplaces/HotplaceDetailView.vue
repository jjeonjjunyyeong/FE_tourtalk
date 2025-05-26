<template>
  <div class="hotplace-detail-view">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩중...</span>
      </div>
      <p class="mt-2">핫플레이스 정보를 불러오는 중입니다...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="alert alert-danger text-center my-5">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <div class="mt-3">
        <router-link to="/hotplaces" class="btn btn-outline-primary">
          핫플레이스 목록으로 돌아가기
        </router-link>
      </div>
    </div>

    <!-- 상세 정보 -->
    <div v-else-if="hotplace" class="container">
      <div class="row">
        <!-- 좌측 컨텐츠 영역 -->
        <div class="col-lg-8">
          <!-- 이미지 갤러리 -->
          <div class="card shadow-sm mb-4">
            <div class="image-gallery" v-if="hotplace.imageUrls && hotplace.imageUrls.length > 0">
              <div id="imageCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-indicators" v-if="hotplace.imageUrls.length > 1">
                  <button
                    v-for="(image, index) in hotplace.imageUrls"
                    :key="index"
                    type="button"
                    data-bs-target="#imageCarousel"
                    :data-bs-slide-to="index"
                    :class="{ active: index === 0 }"
                  ></button>
                </div>
                <div class="carousel-inner">
                  <div
                    v-for="(image, index) in hotplace.imageUrls"
                    :key="index"
                    :class="['carousel-item', { active: index === 0 }]"
                  >
                    <img :src="image" class="d-block w-100" :alt="`${hotplace.title} 이미지 ${index + 1}`">
                  </div>
                </div>
                <button v-if="hotplace.imageUrls.length > 1" class="carousel-control-prev" type="button" data-bs-target="#imageCarousel" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon"></span>
                </button>
                <button v-if="hotplace.imageUrls.length > 1" class="carousel-control-next" type="button" data-bs-target="#imageCarousel" data-bs-slide="next">
                  <span class="carousel-control-next-icon"></span>
                </button>
              </div>
            </div>
            <div v-else class="no-image">
              <i class="bi bi-image"></i>
              <span>이미지 없음</span>
            </div>
          </div>

          <!-- 기본 정보 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="badge bg-primary">{{ hotplace.contentTypeName }}</span>
                    <div class="rating">
                      <i v-for="star in 5" :key="star"
                         :class="['bi', star <= hotplace.rating ? 'bi-star-fill' : 'bi-star']"
                         class="star-icon">
                      </i>
                      <span class="ms-2">{{ hotplace.rating }}점</span>
                    </div>
                  </div>
                  <h2 class="card-title">{{ hotplace.title }}</h2>
                </div>

                <!-- 액션 버튼 (본인 게시물일 경우) -->
                <div v-if="hotplace.isOwner" class="btn-group">
                  <router-link :to="`/hotplaces/edit/${hotplace.id}`" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-pencil me-1"></i>수정
                  </router-link>
                  <button class="btn btn-outline-danger btn-sm" @click="showDeleteModal">
                    <i class="bi bi-trash me-1"></i>삭제
                  </button>
                </div>
              </div>

              <div class="info-sections">
                <!-- 설명 -->
                <div v-if="hotplace.description" class="info-section">
                  <h5><i class="bi bi-info-circle me-2"></i>설명</h5>
                  <p>{{ hotplace.description }}</p>
                </div>

                <!-- 방문 후기 -->
                <div v-if="hotplace.review" class="info-section">
                  <h5><i class="bi bi-chat-square-text me-2"></i>방문 후기</h5>
                  <p>{{ hotplace.review }}</p>
                </div>

                <!-- 추천 이유 -->
                <div v-if="hotplace.recommendationReason" class="info-section">
                  <h5><i class="bi bi-heart me-2"></i>추천 이유</h5>
                  <p>{{ hotplace.recommendationReason }}</p>
                </div>
              </div>

              <div class="meta-info mt-4 pt-3 border-top">
                <small class="text-muted">
                  <i class="bi bi-eye me-1"></i>조회수 {{ hotplace.viewCount || 0 }}
                  <span class="mx-2">|</span>
                  <i class="bi bi-calendar me-1"></i>{{ formatDate(hotplace.createdAt) }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 사이드바 -->
        <div class="col-lg-4">
          <!-- 지도 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-geo-alt me-2"></i>위치 정보
              </h5>

              <div id="map" style="height: 300px; border-radius: 0.375rem;"></div>

              <div class="mt-3">
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">
                    위도: {{ hotplace.latitude }}<br>
                    경도: {{ hotplace.longitude }}
                  </small>
                  <a
                    :href="`https://map.kakao.com/link/map/${hotplace.title},${hotplace.latitude},${hotplace.longitude}`"
                    target="_blank"
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-map me-1"></i>카카오맵
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼들 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title">액션</h5>
              <div class="d-grid gap-2">
                <button class="btn btn-primary" @click="addToTripPlan">
                  <i class="bi bi-plus-circle me-1"></i>여행 계획에 추가
                </button>
                <button class="btn btn-outline-secondary" @click="shareLocation">
                  <i class="bi bi-share me-1"></i>위치 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">핫플레이스 삭제</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>정말로 이 핫플레이스를 삭제하시겠습니까?</p>
            <p class="text-danger small">삭제된 데이터는 복구할 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-danger" @click="deleteHotplace" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2"></span>
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import hotplaceService from '@/services/hotplace'

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const hotplace = ref(null)
const loading = ref(true)
const error = ref(null)
const deleteLoading = ref(false)
const deleteModalRef = ref(null)
let deleteModal = null

// 핫플레이스 상세 정보 조회
const fetchHotplaceDetail = async () => {
  const hotplaceId = Number(props.id)
  if (isNaN(hotplaceId)) {
    error.value = '잘못된 핫플레이스 ID입니다.'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const { data } = await hotplaceService.getHotplaceDetail(hotplaceId)

    if (!data) {
      error.value = '핫플레이스 정보를 찾을 수 없습니다.'
      return
    }

    hotplace.value = data

    // 지도 초기화 (다음 틱에서 실행)
    setTimeout(() => {
      initMap()
    }, 100)
  } catch (err) {
    console.error('핫플레이스 상세 정보 조회 실패:', err)

    if (err.response?.status === 404) {
      error.value = '존재하지 않는 핫플레이스입니다.'
    } else {
      error.value = '핫플레이스 정보를 불러오는데 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// 지도 초기화
const initMap = () => {
  if (!hotplace.value || !hotplace.value.latitude || !hotplace.value.longitude) return

  if (window.kakao && window.kakao.maps) {
    createMap()
  } else {
    const script = document.createElement('script')
    script.onload = () => {
      window.kakao.maps.load(() => createMap())
    }
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=88add3cf720f39380a84327647c428b1&autoload=false`
    document.head.appendChild(script)
  }
}

// 지도 생성
const createMap = () => {
  const container = document.getElementById('map')
  if (!container) return

  const options = {
    center: new window.kakao.maps.LatLng(
      hotplace.value.latitude,
      hotplace.value.longitude
    ),
    level: 3
  }

  const map = new window.kakao.maps.Map(container, options)

  // 마커 생성
  const markerPosition = new window.kakao.maps.LatLng(
    hotplace.value.latitude,
    hotplace.value.longitude
  )

  const marker = new window.kakao.maps.Marker({
    position: markerPosition
  })

  marker.setMap(map)

  // 인포윈도우 생성
  const iwContent = `<div style="padding:5px; text-align:center; font-size:12px;"><b>${hotplace.value.title}</b></div>`
  const infowindow = new window.kakao.maps.InfoWindow({
    content: iwContent
  })

  infowindow.open(map, marker)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// 여행 계획에 추가
const addToTripPlan = () => {
  if (!hotplace.value) return

  // 기존 여행 계획 불러오기
  const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}')

  // 핫플레이스를 관광지 형태로 변환
  const attractionData = {
    no: `hotplace_${hotplace.value.id}`,
    title: hotplace.value.title,
    latitude: hotplace.value.latitude,
    longitude: hotplace.value.longitude,
    sido: '핫플레이스',
    gugun: hotplace.value.contentTypeName,
    addr: '',
    contentTypeName: hotplace.value.contentTypeName,
    firstImage1: hotplace.value.imageUrls?.[0] || '',
    viewCnt: hotplace.value.viewCount || 0
  }

  // 중복 확인
  const exists = tripPlan.attractions.some(item => item.no === attractionData.no)

  if (exists) {
    alert('이미 여행 계획에 추가된 핫플레이스입니다.')
    return
  }

  // 추가
  tripPlan.attractions.push(attractionData)
  localStorage.setItem('tripPlan', JSON.stringify(tripPlan))

  alert('여행 계획에 추가되었습니다!')
}

// 위치 공유
const shareLocation = () => {
  if (!hotplace.value) return

  const shareUrl = `https://map.kakao.com/link/map/${hotplace.value.title},${hotplace.value.latitude},${hotplace.value.longitude}`

  if (navigator.share) {
    navigator.share({
      title: hotplace.value.title,
      text: `${hotplace.value.title} 위치를 공유합니다.`,
      url: shareUrl
    })
  } else {
    // 클립보드에 복사
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('위치 링크가 클립보드에 복사되었습니다!')
    }).catch(() => {
      alert(`위치 링크: ${shareUrl}`)
    })
  }
}

// 삭제 모달 표시
const showDeleteModal = () => {
  deleteModal.show()
}

// 핫플레이스 삭제
const deleteHotplace = async () => {
  try {
    deleteLoading.value = true

    await hotplaceService.deleteHotplace(hotplace.value.id)

    deleteModal.hide()
    alert('핫플레이스가 삭제되었습니다.')
    router.push('/hotplaces')

  } catch (error) {
    console.error('핫플레이스 삭제 실패:', error)

    if (error.response?.status === 403) {
      alert('삭제 권한이 없습니다.')
    } else {
      alert('삭제 중 오류가 발생했습니다.')
    }
  } finally {
    deleteLoading.value = false
  }
}

// 컴포넌트 마운트
onMounted(async () => {
  // Bootstrap 모달 초기화
  const { Modal } = await import('bootstrap')
  deleteModal = new Modal(deleteModalRef.value)

  // 데이터 로드
  fetchHotplaceDetail()
})
</script>

<style scoped>
.image-gallery {
  height: 400px;
  overflow: hidden;
}

.image-gallery img {
  height: 400px;
  object-fit: cover;
}

.no-image {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.rating {
  display: flex;
  align-items: center;
}

.star-icon {
  color: #ffc107;
  font-size: 1rem;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h5 {
  color: #495057;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.info-section p {
  margin-bottom: 0;
  line-height: 1.6;
}

.meta-info {
  color: #6c757d;
}

#map {
  border: 1px solid #dee2e6;
}
</style>