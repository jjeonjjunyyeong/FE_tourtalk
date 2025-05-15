<template>
  <div class="trip-plan-view">
    <h2 class="mb-4">여행 계획</h2>

    <div class="row">
      <!-- 좌측: 선택된 관광지 목록 -->
      <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">선택한 관광지</h5>
            <button class="btn btn-sm btn-outline-danger" @click="clearAllAttractions" :disabled="selectedAttractions.length === 0">
              전체 삭제
            </button>
          </div>

          <div class="card-body p-0">
            <div v-if="selectedAttractions.length === 0" class="text-center py-5">
              <i class="bi bi-map display-4 text-muted"></i>
              <p class="mt-2">선택된 관광지가 없습니다.</p>
              <router-link to="/attractions" class="btn btn-primary mt-2">
                관광지 검색하기
              </router-link>
            </div>

            <draggable
              v-else
              v-model="selectedAttractions"
              group="attractions"
              item-key="no"
              class="selected-list"
              handle=".drag-handle"
              @change="calculateRoute"
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
                    <div class="item-title">{{ element.title }}</div>
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
            <div class="d-flex justify-content-end">
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

            <div id="map" style="height: 500px;"></div>

            <div v-if="selectedAttractions.length > 1" class="route-info mt-3">
              <div class="alert alert-info">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>총 이동 거리:</strong> {{ formatDistance(totalDistance) }}
                    <span class="mx-2">|</span>
                    <strong>예상 소요 시간:</strong> {{ formatDuration(totalDuration) }}
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

        <!-- 날짜 및 메모 -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="mb-3">여행 정보</h5>

            <div class="row g-3">
              <div class="col-md-6">
                <label for="tripName" class="form-label">여행 이름</label>
                <input type="text" id="tripName" v-model="tripPlan.name" class="form-control" placeholder="여행 이름을 입력하세요">
              </div>

              <div class="col-md-6">
                <label for="tripDate" class="form-label">여행 날짜</label>
                <input type="date" id="tripDate" v-model="tripPlan.date" class="form-control">
              </div>

              <div class="col-12">
                <label for="tripMemo" class="form-label">메모</label>
                <textarea
                  id="tripMemo"
                  v-model="tripPlan.memo"
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
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { VueDraggableNext as draggable } from 'vue-draggable-next';

export default {
  name: 'TripPlanView',
  components: {
    draggable
  },
  setup() {
    const route = useRoute();
    const selectedAttractions = ref([]);
    const map = ref(null);
    const markers = ref([]);
    const polyline = ref(null);

    // 경로 계산 결과
    const totalDistance = ref(0);
    const totalDuration = ref(0);

    // 여행 계획 정보
    const tripPlan = reactive({
      name: '나의 여행 계획',
      date: new Date().toISOString().split('T')[0],
      memo: '',
      attractions: []
    });

    // 로컬 스토리지에서 선택된 관광지 불러오기
    const loadSelectedAttractions = () => {
      const saved = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}');
      selectedAttractions.value = saved.attractions || [];
    };

    // 관광지 삭제
    const removeAttraction = (index) => {
      selectedAttractions.value.splice(index, 1);
      // 경로 재계산
      calculateRoute();
      saveTripPlanToLocal();
    };

    // 전체 관광지 삭제
    const clearAllAttractions = () => {
      if (confirm('정말 모든 관광지를 삭제하시겠습니까?')) {
        selectedAttractions.value = [];
        calculateRoute();
        saveTripPlanToLocal();
      }
    };

    // 로컬 스토리지에 저장
    const saveTripPlanToLocal = () => {
      localStorage.setItem('tripPlan', JSON.stringify({
        attractions: selectedAttractions.value
      }));
    };

    // 여행 계획 저장 (서버에 저장 또는 다운로드)
    const saveTripPlan = () => {
      // 여기서는 간단하게 로컬 스토리지에 저장
      const plan = {
        ...tripPlan,
        attractions: selectedAttractions.value,
        totalDistance: totalDistance.value,
        totalDuration: totalDuration.value
      };

      localStorage.setItem('savedTripPlan', JSON.stringify(plan));
      alert('여행 계획이 저장되었습니다.');
    };

    // 지도 초기화
    const initMap = () => {
      // 카카오맵 API가 로드되었는지 확인
      if (window.kakao && window.kakao.maps) {
        createMap();
      } else {
        // 카카오맵 API 동적 로드
        const script = document.createElement('script');
        script.onload = () => {
          // API 로드 후 지도 생성
          const callback = () => createMap();
          window.kakao.maps.load(callback);
        };
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&libraries=services&autoload=false`;
        document.head.appendChild(script);
      }
    };

    // 지도 생성
    const createMap = () => {
      const container = document.getElementById('map');
      if (!container) return;

      // 초기 중심점 (한국 중심)
      const options = {
        center: new window.kakao.maps.LatLng(36.2, 127.9),
        level: 13
      };

      map.value = new window.kakao.maps.Map(container, options);

      // 이미 선택된 관광지가 있는 경우 마커 표시
      if (selectedAttractions.value.length > 0) {
        displayMarkers();
        calculateRoute();
      }
    };

    // 마커 표시
    const displayMarkers = () => {
      // 기존 마커 제거
      clearMarkers();

      // 경계 계산을 위한 LatLngBounds 객체 생성
      const bounds = new window.kakao.maps.LatLngBounds();

      // 선택된 관광지에 마커 표시
      selectedAttractions.value.forEach((attraction, index) => {
        const position = new window.kakao.maps.LatLng(
          attraction.latitude,
          attraction.longitude
        );

        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map.value
        });

        // 인포윈도우 생성
        const iwContent = `
          <div style="padding:5px;font-size:12px;width:150px;text-align:center;">
            <b>${index + 1}. ${attraction.title}</b>
          </div>
        `;

        const infowindow = new window.kakao.maps.InfoWindow({
          content: iwContent
        });

        // 마커에 인포윈도우 표시
        infowindow.open(map.value, marker);

        // 마커 저장
        markers.value.push(marker);

        // 경계에 위치 추가
        bounds.extend(position);
      });

      // 모든 마커가 보이도록 지도 범위 조정
      if (selectedAttractions.value.length > 0) {
        map.value.setBounds(bounds);
      }
    };

    // 마커 제거
    const clearMarkers = () => {
      markers.value.forEach(marker => {
        marker.setMap(null);
      });
      markers.value = [];

      // 경로선 제거
      if (polyline.value) {
        polyline.value.setMap(null);
        polyline.value = null;
      }
    };

    // 경로 계산
    const calculateRoute = () => {
      if (selectedAttractions.value.length < 2 || !map.value) {
        totalDistance.value = 0;
        totalDuration.value = 0;
        return;
      }

      // 마커 업데이트
      displayMarkers();

      // 경로선 좌표 생성
      const linePath = selectedAttractions.value.map(attraction =>
        new window.kakao.maps.LatLng(attraction.latitude, attraction.longitude)
      );

      // 경로선 생성
      if (polyline.value) {
        polyline.value.setMap(null);
      }

      polyline.value = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3,
        strokeColor: '#4361ee',
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
      });

      polyline.value.setMap(map.value);

      // 가상의 거리와 시간 계산 (실제로는 카카오 모빌리티 API 등을 사용해야 함)
      calculateDistanceAndDuration();
    };

    // 거리와 시간 계산 (단순 직선 거리 기준, 실제 서비스에서는 API 사용 필요)
    const calculateDistanceAndDuration = () => {
      let distance = 0;

      for (let i = 0; i < selectedAttractions.value.length - 1; i++) {
        const start = selectedAttractions.value[i];
        const end = selectedAttractions.value[i + 1];

        // 하버사인 공식으로 두 지점 간 거리 계산 (km)
        const d = getDistanceFromLatLon(
          start.latitude, start.longitude,
          end.latitude, end.longitude
        );

        distance += d;
      }

      totalDistance.value = distance; // km

      // 평균 속도 60km/h 가정, 시간 계산 (분)
      totalDuration.value = (distance / 60) * 60;
    };

    // 두 지점 간 거리 계산 (하버사인 공식)
    const getDistanceFromLatLon = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // 지구 반경 (km)
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // 킬로미터
      return distance;
    };

    const deg2rad = (deg) => {
      return deg * (Math.PI/180);
    };

    // 거리 포맷
    const formatDistance = (distance) => {
      return `${distance.toFixed(1)} km`;
    };

    // 소요 시간 포맷
    const formatDuration = (duration) => {
      const hours = Math.floor(duration / 60);
      const minutes = Math.floor(duration % 60);

      if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
      } else {
        return `${minutes}분`;
      }
    };

    // 카카오 네비게이션 URL 생성
    const getNaviUrl = () => {
      if (selectedAttractions.value.length < 2) return '#';

      const start = selectedAttractions.value[0];
      const goal = selectedAttractions.value[selectedAttractions.value.length - 1];

      // 출발지와 도착지만 설정 (실제로는 경유지도 포함 가능)
      return `https://map.kakao.com/link/to/${goal.title},${goal.latitude},${goal.longitude}/from/${start.title},${start.latitude},${start.longitude}`;
    };

    // 선택된 관광지 변경 감지
    watch(selectedAttractions, () => {
      tripPlan.attractions = selectedAttractions.value;
    });

    // 컴포넌트 마운트 시 데이터 로드 및 지도 초기화
    onMounted(() => {
      loadSelectedAttractions();
      initMap();
    });

    return {
      selectedAttractions,
      tripPlan,
      totalDistance,
      totalDuration,
      removeAttraction,
      clearAllAttractions,
      saveTripPlan,
      formatDistance,
      formatDuration,
      getNaviUrl
    };
  }
};
</script>

<style scoped>
.selected-list {
  max-height: 500px;
  overflow-y: auto;
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
</style>
