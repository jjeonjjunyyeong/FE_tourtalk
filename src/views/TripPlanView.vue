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
  displayMarkers()

  if (routeCoordinates.value.length > 0) {
    // 기존 폴리라인 제거
    if (polyline.value) {
      polyline.value.setMap(null)
    }

    // 실제 경로 좌표로 폴리라인 생성
    const routePath = routeCoordinates.value.map(coord =>
      new window.kakao.maps.LatLng(parseFloat(coord.latitude), parseFloat(coord.longitude))
    )

    polyline.value = new window.kakao.maps.Polyline({
      path: routePath,
      strokeWeight: 4,
      strokeColor: '#4361ee',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    })

    polyline.value.setMap(map.value)
    console.log('Route displayed on map with', routeCoordinates.value.length, 'coordinates')
  }
}

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

// 지도 초기화
const initMap = () => {
  console.log('Initializing map...')
  const container = document.getElementById('map')
  if (!container) {
    console.error('Map container not found')
    return
  }

  if (window.kakao && window.kakao.maps) {
    console.log('Kakao Maps API loaded, creating map')
    createMap()
  } else {
    console.log('Loading Kakao Maps API')
    const script = document.createElement('script')
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('Kakao Maps API loaded successfully')
        createMap()
      })
    }
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`
    document.head.appendChild(script)
  }
}

// 지도 생성
const createMap = () => {
  const container = document.getElementById('map')
  if (!container) {
    console.error('Map container not found in createMap')
    return
  }

  const options = {
    center: new window.kakao.maps.LatLng(36.2, 127.9),
    level: 13
  }

  map.value = new window.kakao.maps.Map(container, options)
  console.log('Map created:', map.value)

  if (selectedAttractions.value.length > 0) {
    console.log('Displaying markers for attractions:', selectedAttractions.value)
    displayMarkers()
    if (selectedAttractions.value.length > 1) {
      calculateRouteWithAPI()
    }
  }
}

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
  // Bootstrap 모달 초기화
  const { Modal } = await import('bootstrap')
  savedPlansModal = new Modal(savedPlansModalRef.value)

  loadSelectedAttractions()
  console.log('Immediately after loading:', selectedAttractions.value)

  await nextTick()
  console.log('After nextTick:', selectedAttractions.value)

  setTimeout(() => {
    console.log('Before initMap:', selectedAttractions.value)
    initMap()
  }, 100)
})
</script>