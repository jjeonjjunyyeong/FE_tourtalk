<template>
  <div class="trip-plan-view">
    <h2 class="mb-4">여행 계획</h2>

    <div class="row">
      <!-- 좌측: 선택된 관광지 목록 -->
      <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">선택한 관광지</h5>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-danger" @click="clearAllAttractions" :disabled="selectedAttractions.length === 0">
                전체 삭제
              </button>
            </div>
          </div>
          <div class="card-body p-0">

            <div v-if="selectedAttractions.length === 0" class="text-center py-5">
              <i class="bi bi-map display-4 text-muted"></i>
              <p class="mt-2">선택된 관광지가 없습니다.</p>
              <div class="d-flex flex-column gap-2">
                <router-link to="/attractions" class="btn btn-primary">
                  <i class="bi bi-search me-1"></i>
                  관광지 검색하기
                </router-link>
                <button class="btn btn-outline-primary" @click="showSavedPlansModal">
                  <i class="bi bi-folder me-1"></i>
                  저장된 일정 불러오기
                </button>
              </div>
            </div>

            <draggable
              v-else
              v-model="selectedAttractions"
              group="attractions"
              item-key="no"
              class="selected-list"
              @change="calculateRouteWithAPI"
            >
              <template #item="{ element, index }">
                <div class="selected-item">
                  <div class="drag-handle">
                    <i class="bi bi-grip-vertical"></i>
                  </div>

                  <div class="item-number">{{ index + 1 }}</div>

                  <div class="item-image">
                    <img
                      v-if="element.firstImage1"
                      :src="element.firstImage1"
                      :alt="element.title"
                      class="rounded"
                    >
                    <div v-else class="no-image rounded">
                      <i class="bi bi-image"></i>
                    </div>
                  </div>

                  <div class="item-info">
                    <div class="item-title">{{ element.title || '제목 없음' }}</div>
                    <div class="item-location">
                      {{ element.sido }} {{ element.gugun }}
                    </div>
                  </div>

                  <button class="btn btn-sm btn-link text-danger delete-btn" @click="removeAttraction(index)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </template>
            </draggable>
          </div>

          <div v-if="selectedAttractions.length > 0" class="card-footer">
            <div class="d-flex justify-content-between">
              <button class="btn btn-outline-primary btn-sm" @click="showSavedPlansModal">
                <i class="bi bi-folder me-1"></i>
                저장된 일정
              </button>
              <button class="btn btn-primary" @click="saveTripPlan">
                <i class="bi bi-save me-1"></i>
                여행 계획 저장
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 우측: 지도와 경로 -->
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="mb-3">여행 경로</h5>

            <!-- 경로 계산 로딩 상태 -->
            <div v-if="routeLoading" class="route-loading-container">
              <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">경로 계산 중...</span>
                </div>
                <h5>경로를 계산하는 중입니다...</h5>
                <p class="text-muted">잠시만 기다려주세요.</p>
              </div>
            </div>

            <!-- 경로 계산 실패 상태 -->
            <div v-else-if="routeError" class="route-error-container">
              <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
                <h5>경로를 찾을 수 없습니다</h5>
                <p class="text-muted mb-3">{{ routeErrorMessage }}</p>
                <div class="d-flex gap-2 justify-content-center">
                  <button class="btn btn-primary" @click="retryRouteCalculation">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    다시 시도
                  </button>
                  <button class="btn btn-outline-secondary" @click="showBasicMap">
                    <i class="bi bi-map me-1"></i>
                    기본 지도 보기
                  </button>
                </div>
              </div>
            </div>

            <!-- 정상 지도 표시 -->
            <div v-else>
              <div id="map" style="width: 90%; height: 500px;"></div>

              <div v-if="selectedAttractions.length > 1 && routeInfo" class="route-info mt-3">
                <div class="alert alert-info">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>총 이동 거리:</strong> {{ formatDistance(routeInfo.totalDistance) }}
                      <span class="mx-2">|</span>
                      <strong>예상 소요 시간:</strong> {{ formatDuration(routeInfo.totalTime) }}
                      <span v-if="routeInfo.tollFare > 0" class="mx-2">|</span>
                      <span v-if="routeInfo.tollFare > 0">
                        <strong>통행료:</strong> {{ formatCurrency(routeInfo.tollFare) }}
                      </span>
                    </div>

                    <a :href="getNaviUrl()" target="_blank" class="btn btn-sm btn-primary">
                      <i class="bi bi-signpost-2 me-1"></i>
                      길찾기
                    </a>
                  </div>
                </div>
              </div>

              <div v-else-if="selectedAttractions.length === 1" class="route-info mt-3">
                <div class="alert alert-warning">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-info-circle me-2"></i>
                    <span>경로를 계산하려면 2개 이상의 관광지를 선택하세요.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 날짜 및 메모 -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="mb-3">여행 정보</h5>

            <div class="row g-3">
              <div class="col-md-6">
                <label for="tripName" class="form-label">여행 이름</label>
                <input type="text" id="tripName" v-model="tripPlan.name" class="form-control" placeholder="여행 이름을 입력하세요">
              </div>

              <div class="col-md-3">
                <label for="startDate" class="form-label">시작 날짜</label>
                <input type="date" id="startDate" v-model="tripPlan.startDate" class="form-control">
              </div>

              <div class="col-md-3">
                <label for="endDate" class="form-label">종료 날짜</label>
                <input type="date" id="endDate" v-model="tripPlan.endDate" class="form-control">
              </div>

              <div class="col-12">
                <label for="tripMemo" class="form-label">메모</label>
                <textarea
                  id="tripMemo"
                  v-model="tripPlan.description"
                  class="form-control"
                  rows="4"
                  placeholder="여행에 대한 메모를 남겨보세요"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 저장된 일정 목록 모달 -->
    <div class="modal fade" id="savedPlansModal" tabindex="-1" aria-hidden="true" ref="savedPlansModalRef">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">저장된 여행 계획</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- SavedTripPlanList 컴포넌트 사용 -->
            <SavedTripPlanList
              v-model="selectedPlanIds"
              @load-plan="loadTripPlan"
              @plans-updated="onPlansUpdated"
              ref="savedTripPlanListRef"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import tripPlanService from '@/services/tripPlan'
import routeService from '@/services/route'
import SavedTripPlanList from '@/components/trip/SavedTripPlanList.vue'

const route = useRoute()
const selectedAttractions = ref([])
const map = ref(null)
const markers = ref([])
const polyline = ref(null)
const savedPlansModalRef = ref(null)
const savedTripPlanListRef = ref(null)
const selectedPlanIds = ref([])
let savedPlansModal = null

// 경로 관련 상태
const routeLoading = ref(false)
const routeError = ref(false)
const routeErrorMessage = ref('')
const routeInfo = ref(null)
const routeCoordinates = ref([])

// 여행 계획 정보
const tripPlan = reactive({
  name: '나의 여행 계획',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  description: '',
  attractions: []
})

// 로컬 스토리지에서 선택된 관광지 불러오기
const loadSelectedAttractions = () => {
  try {
    const savedData = localStorage.getItem('tripPlan')

    if (!savedData) {
      console.warn('No tripPlan data found in localStorage')
      selectedAttractions.value = []
      return
    }

    const saved = JSON.parse(savedData)

    if (saved && Array.isArray(saved.attractions)) {
      selectedAttractions.value = saved.attractions
    } else {
      console.error('Invalid format: saved.attractions is not an array')
      selectedAttractions.value = []
    }
  } catch (error) {
    console.error('Error parsing localStorage data:', error)
    selectedAttractions.value = []
  }
}

// 저장된 일정 모달 표시
const showSavedPlansModal = () => {
  savedPlansModal.show()
}

// 특정 여행 계획 불러오기
const loadTripPlan = async (tripPlanId) => {
  try {
    console.log('Loading trip plan with ID:', tripPlanId)
    const { data } = await tripPlanService.getTripPlanDetail(tripPlanId)

    // 여행 계획 기본 정보 설정
    tripPlan.name = data.name
    tripPlan.description = data.description
    tripPlan.startDate = data.startDate
    tripPlan.endDate = data.endDate

    // 관광지 데이터를 프론트엔드 형태로 변환
    selectedAttractions.value = data.attractions
      .sort((a, b) => a.visitOrder - b.visitOrder)
      .map(item => ({
        no: item.attractionId,
        title: item.attractionTitle,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        sido: item.sido,
        gugun: item.gugun,
        addr: item.addr,
        contentTypeName: '관광지',
        firstImage1: '',
        viewCnt: 0
      }))

    // 기존 경로 정보 설정
    routeInfo.value = {
      totalDistance: parseInt(data.totalDistance) || 0,
      totalTime: data.totalDuration || 0,
      tollFare: 0,
      taxiFare: 0
    }

    // localStorage 업데이트
    saveTripPlanToLocal()

    // 지도 업데이트
    setTimeout(() => {
      if (selectedAttractions.value.length > 0) {
        displayMarkers()
        if (selectedAttractions.value.length > 1) {
          calculateRouteWithAPI()
        }
      }
    }, 100)

    // 모달 닫기
    savedPlansModal.hide()
    alert('여행 계획을 불러왔습니다.')

  } catch (error) {
    console.error('여행 계획 로드 실패:', error)

    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.')
    } else if (error.response?.status === 404) {
      alert('해당 여행 계획을 찾을 수 없습니다.')
    } else {
      alert('여행 계획을 불러오는데 실패했습니다.')
    }
  }
}

// 저장된 계획 목록 업데이트 이벤트 처리
const onPlansUpdated = (plans) => {
  console.log('Plans updated:', plans.length, '개')
}

// 관광지 삭제
const removeAttraction = (index) => {
  selectedAttractions.value.splice(index, 1)
  if (selectedAttractions.value.length > 1) {
    calculateRouteWithAPI()
  } else {
    // 관광지가 1개 이하면 경로 정보 초기화
    routeInfo.value = null
    routeCoordinates.value = []
    displayMarkers()
  }
  saveTripPlanToLocal()
}

// 전체 관광지 삭제
const clearAllAttractions = () => {
  if (confirm('정말 모든 관광지를 삭제하시겠습니까?')) {
    selectedAttractions.value = []
    routeInfo.value = null
    routeCoordinates.value = []
    clearMarkers()
    saveTripPlanToLocal()
  }
}

// 로컬 스토리지에 저장
const saveTripPlanToLocal = () => {
  const data = { attractions: selectedAttractions.value }
  localStorage.setItem('tripPlan', JSON.stringify(data))
}

// Kakao Mobility API를 사용한 경로 계산
const calculateRouteWithAPI = async () => {
  if (selectedAttractions.value.length < 2 || !map.value) {
    console.log('Not enough attractions or map not initialized')
    return
  }

  routeLoading.value = true
  routeError.value = false

  try {
    // 관광지 배열을 RouteRequestDto로 변환
    const routeRequest = routeService.convertAttractionsToRouteRequest(selectedAttractions.value);

    console.log('Requesting route with:', routeRequest)

    const { data } = await routeService.searchRoute(routeRequest)

    // 경로 정보 저장
    routeInfo.value = data.routeInfo
    routeCoordinates.value = data.coordinates || []

    console.log('Route calculation success:', data)

    // 지도에 경로 표시
    displayRouteOnMap()

  } catch (error) {
    console.error('Route calculation failed:', error)
    routeError.value = true
    routeErrorMessage.value = routeService.getErrorMessage(error)

    // 실패시 기본 마커만 표시
    displayMarkers()

  } finally {
    routeLoading.value = false
  }
}

// 경로 계산 재시도
const retryRouteCalculation = () => {
  routeError.value = false
  calculateRouteWithAPI()
}

// 기본 지도 표시 (직선 연결)
const showBasicMap = () => {
  routeError.value = false
  displayMarkers()

  // 직선으로 연결
  if (selectedAttractions.value.length > 1) {
    const linePath = selectedAttractions.value.map(attraction =>
      new window.kakao.maps.LatLng(attraction.latitude, attraction.longitude)
    )

    if (polyline.value) {
      polyline.value.setMap(null)
    }

    polyline.value = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 2,
      strokeColor: '#ff6b6b',
      strokeOpacity: 0.6,
      strokeStyle: 'dashed'
    })

    polyline.value.setMap(map.value)
  }
}

// 지도에 실제 경로 표시
const displayRouteOnMap = () => {
  console.log('지도에 경로 표시 중...');

  // 맵 초기화 확인
  if (!map.value) {
    console.error('맵이 초기화되지 않았습니다.');
    return;
  }

  // 맵 컨테이너 확인
  const container = document.getElementById('map');
  if (!container) {
    console.error('맵 컨테이너를 찾을 수 없습니다.');
    return;
  }
  console.log('맵 컨테이너:', container, '스타일:', container.style);

  // 마커 표시
  displayMarkers();

  // 경로 좌표 유효성 확인
  if (!routeCoordinates.value || routeCoordinates.value.length < 901) {
    console.warn('경로 좌표가 충분하지 않거나 존재하지 않습니다. 최소 901개의 좌표가 필요합니다.');
    return;
  }

  // 기존 폴리라인 제거
  if (polyline.value) {
    polyline.value.setMap(null);
    polyline.value = null;
  }

  // 0, 100, 200, ..., 900번 인덱스 선택
  const selectedIndices = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const routePath = selectedIndices
    .map(index => {
      const coord = routeCoordinates.value[index];
      if (!coord || coord.latitude == null || coord.longitude == null) {
        console.warn(`인덱스 ${index}의 좌표가 유효하지 않습니다:`, coord);
        return null;
      }
      const lat = parseFloat(coord.latitude);
      const lng = parseFloat(coord.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`인덱스 ${index}의 좌표 값이 유효하지 않습니다:`, coord);
        return null;
      }
      return new window.kakao.maps.LatLng(lat, lng);
    })
    .filter(coord => coord !== null);

  console.log('폴리라인에 사용할 경로 좌표:', routePath);

  // 유효한 좌표가 있는지 확인
  if (routePath.length === 0) {
    console.error('폴리라인을 표시할 유효한 좌표가 없습니다.');
    return;
  }

  // 폴리라인 렌더링 지연
  setTimeout(() => {
    try {
      polyline.value = new window.kakao.maps.Polyline({
        path: routePath,
        strokeWeight: 4,
        strokeColor: '#4361ee',
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
      });
      console.log('폴리라인 생성됨:', polyline.value);
      polyline.value.setMap(map.value);
      console.log('폴리라인이 지도에 표시됨, 좌표 수:', routePath.length);

      // 지도 범위를 경로에 맞게 조정
      const bounds = new window.kakao.maps.LatLngBounds();
      routePath.forEach(point => bounds.extend(point));
      map.value.setBounds(bounds);
    } catch (error) {
      console.error('폴리라인 렌더링 오류:', error);
    }
  }, 100);
};

// 여행 계획 저장 (서버에 저장)
const saveTripPlan = async () => {
  try {
    if (selectedAttractions.value.length === 0) {
      alert('저장할 관광지가 없습니다.')
      return
    }

    // 날짜 유효성 검사
    if (new Date(tripPlan.startDate) > new Date(tripPlan.endDate)) {
      alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.')
      return
    }

    // Backend로 전달할 데이터 형태로 변환
    const backendData = {
      name: tripPlan.name || '나의 여행 계획',
      description: tripPlan.description || '',
      startDate: tripPlan.startDate,
      endDate: tripPlan.endDate,
      totalDistance: routeInfo.value?.totalDistance || 0,
      totalDuration: routeInfo.value?.totalTime || 0,
      status: 'COMPLETED',
      attractions: selectedAttractions.value.map((attraction, index) => ({
        attractionId: attraction.no,
        attractionTitle: attraction.title,
        visitOrder: index + 1,
        latitude: attraction.latitude,
        longitude: attraction.longitude,
        sido: attraction.sido,
        gugun: attraction.gugun,
        addr: attraction.addr
      }))
    }

    const response = await tripPlanService.saveTripPlan(backendData)
    console.log('여행 계획 저장 성공:', response.data)

    // 성공 후 화면 및 localStorage 초기화
    selectedAttractions.value = []
    clearMarkers()
    routeInfo.value = null
    routeCoordinates.value = []

    tripPlan.name = '나의 여행 계획'
    tripPlan.startDate = new Date().toISOString().split('T')[0]
    tripPlan.endDate = new Date().toISOString().split('T')[0]
    tripPlan.description = ''
    tripPlan.attractions = []

    localStorage.removeItem('tripPlan')

    alert('여행 계획이 성공적으로 저장되었습니다.')

    // 저장된 일정 목록 새로고침
    if (savedTripPlanListRef.value) {
      savedTripPlanListRef.value.refresh()
    }

  } catch (error) {
    console.error('여행 계획 저장 실패:', error)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data || '알 수 없는 오류가 발생했습니다.'

      switch (status) {
        case 400:
          alert(`잘못된 요청입니다: ${message}`)
          break
        case 401:
          alert('로그인이 필요합니다.')
          break
        case 403:
          alert('권한이 없습니다.')
          break
        case 500:
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          break
        default:
          alert(`오류가 발생했습니다 (${status}): ${message}`)
      }
    } else if (error.request) {
      alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.')
    } else {
      alert('요청 처리 중 오류가 발생했습니다.')
    }
  }
}

const initMap = () => {
  console.log('지도 초기화 중...');
  let container = document.getElementById('map');
  console.log('일반 DOM에서 #map:', container);

  if (!container) {
    const shadowRoot = document.querySelector('trip-plan-view')?.shadowRoot;
    console.log('Shadow Root:', shadowRoot);
    if (shadowRoot) {
      container = shadowRoot.getElementById('map');
      console.log('Shadow DOM에서 #map:', container);
    }
  }

  if (!container) {
    console.error('맵 컨테이너를 찾을 수 없습니다.');
    return;
  }

  container.style.width = '90%';
  container.style.height = '500px';
  container.style.display = 'block';
  console.log('맵 컨테이너 스타일:', container.style);

  if (window.kakao && window.kakao.maps) {
    console.log('Kakao Maps API 로드됨, 맵 생성 중');
    createMap(container);
  } else {
    console.log('Kakao Maps API 로드 중');
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('Kakao Maps API 로드 성공');
        createMap(container);
      });
    };
    script.onerror = () => {
      console.error('Kakao Maps SDK 로드 실패');
    };
    document.head.appendChild(script);
  }
};

const createMap = (container) => {
  const options = {
    center: new window.kakao.maps.LatLng(36.2, 127.9),
    level: 13
  };

  map.value = new window.kakao.maps.Map(container, options);
  console.log('Map created:', map.value);

  if (selectedAttractions.value.length > 0) {
    console.log('Displaying markers for attractions:', selectedAttractions.value);
    displayMarkers();
    if (selectedAttractions.value.length > 1) {
      calculateRouteWithAPI();
    }
  }
};

// 마커 표시
const displayMarkers = () => {
  console.log('Displaying markers...')
  clearMarkers()

  const bounds = new window.kakao.maps.LatLngBounds()

  selectedAttractions.value.forEach((attraction, index) => {
    const position = new window.kakao.maps.LatLng(
      attraction.latitude,
      attraction.longitude
    )

    const marker = new window.kakao.maps.Marker({
      position: position,
      map: map.value
    })

    const iwContent = `
      <div style="padding:5px;font-size:12px;width:150px;text-align:center;">
        <b>${index + 1}. ${attraction.title}</b>
      </div>
    `

    const infowindow = new window.kakao.maps.InfoWindow({
      content: iwContent
    })

    infowindow.open(map.value, marker)
    markers.value.push(marker)
    bounds.extend(position)
  })

  if (selectedAttractions.value.length > 0) {
    map.value.setBounds(bounds)
    console.log('Map bounds set')
  }
}

// 마커 제거
const clearMarkers = () => {
  console.log('Clearing markers...')
  markers.value.forEach(marker => {
    marker.setMap(null)
  })
  markers.value = []

  if (polyline.value) {
    polyline.value.setMap(null)
    polyline.value = null
  }
}

// 거리 포맷 (미터 -> km)
const formatDistance = (distanceInMeters) => {
  if (!distanceInMeters) return '0km'
  const km = distanceInMeters / 1000
  return `${km.toFixed(1)}km`
}

// 소요 시간 포맷 (초 -> 시간/분)
const formatDuration = (durationInSeconds) => {
  if (!durationInSeconds) return '0분'

  const hours = Math.floor(durationInSeconds / 3600)
  const minutes = Math.floor((durationInSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  } else {
    return `${minutes}분`
  }
}

// 통행료 포맷
const formatCurrency = (amount) => {
  if (!amount) return '0원'
  return `${amount.toLocaleString()}원`
}

// 카카오 네비게이션 URL 생성
const getNaviUrl = () => {
  if (selectedAttractions.value.length < 2) return '#'

  const start = selectedAttractions.value[0]
  const goal = selectedAttractions.value[selectedAttractions.value.length - 1]

  return `https://map.kakao.com/link/to/${goal.title},${goal.latitude},${goal.longitude}/from/${start.title},${start.latitude},${start.longitude}`
}

// 선택된 관광지 변경 감지
watch(selectedAttractions, () => {
  console.log('selectedAttractions updated:', selectedAttractions.value)
  tripPlan.attractions = selectedAttractions.value
  saveTripPlanToLocal()
}, { deep: true })

// 컴포넌트 마운트 시 데이터 로드 및 지도 초기화
onMounted(async () => {
  console.log('초기 상태 확인 - routeLoading:', routeLoading.value, 'routeError:', routeError.value);
  routeLoading.value = false;
  routeError.value = false;
  const { Modal } = await import('bootstrap');
  savedPlansModal = new Modal(savedPlansModalRef.value);
  loadSelectedAttractions();
  await nextTick();
  initMap();
});
</script>

<style scoped>
.selected-list {
  max-height: 500px;
}

.selected-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.selected-item:last-child {
  border-bottom: none;
}

.drag-handle {
  cursor: move;
  margin-right: 0.5rem;
  color: #adb5bd;
}

.item-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-color: #4361ee;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 0.5rem;
}

.item-image {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  margin-right: 0.75rem;
}

.item-image img, .item-image .no-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-image .no-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.item-info {
  flex-grow: 1;
}

.item-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-location {
  font-size: 0.8rem;
  color: #6c757d;
}

.delete-btn {
  padding: 0;
  margin-left: 0.5rem;
}

.modal-dialog {
  max-width: 1200px;
}

/* 경로 계산 관련 스타일 */
.route-loading-container,
.route-error-container {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

.route-loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
}

.route-error-container i {
  color: #f39c12;
}

/* 경로 정보 박스 스타일 개선 */
.route-info .alert {
  border-left: 4px solid #4361ee;
  background-color: #f8f9ff;
  border-color: #e3f2fd;
}

.route-info .alert-warning {
  border-left-color: #f39c12;
  background-color: #fffbf0;
}

/* 지도 컨테이너 스타일 */
#map {
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .selected-list {
    max-height: 300px;
  }

  .route-loading-container,
  .route-error-container {
    min-height: 300px;
  }

  #map {
    height: 300px !important;
  }

  .route-info .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .route-info .d-flex > div {
    text-align: center;
  }
}
</style>
