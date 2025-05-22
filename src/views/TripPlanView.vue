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
                    <div class="item-title">{{ element.title || '제목 없음' }}</div>
                    <div class="item-location">
                      {{ element.sido }} {{ element.gugun }}
                    </div>
                    <!-- 디버깅용 -->
                    <!-- <pre>{{ JSON.stringify(element, null, 2) }}</pre> -->
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';

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
      try {
        const savedData = localStorage.getItem('tripPlan');

        if (!savedData) {
          console.warn('No tripPlan data found in localStorage');
          selectedAttractions.value = [];
          return;
        }

        const saved = JSON.parse(savedData);

        if (saved && Array.isArray(saved.attractions)) {
          selectedAttractions.value = saved.attractions;
        } else {
          console.error('Invalid format: saved.attractions is not an array');
          selectedAttractions.value = [];
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        selectedAttractions.value = [];
      }
    };

    // 관광지 삭제
    const removeAttraction = (index) => {
      selectedAttractions.value.splice(index, 1);
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
      const data = { attractions: selectedAttractions.value };
      localStorage.setItem('tripPlan', JSON.stringify(data));
    };

    // 여행 계획 저장 (서버에 저장 또는 다운로드)
    const saveTripPlan = () => {
      const plan = {
        ...tripPlan,
        attractions: selectedAttractions.value,
        totalDistance: totalDistance.value,
        totalDuration: totalDuration.value
      };
      // 나중에 DB에 저장하는 로직 추가
      localStorage.setItem('savedTripPlan', JSON.stringify(plan));

      selectedAttractions.value = [];

      clearMarkers();

      totalDistance.value = 0;
      totalDuration.value = 0;

      tripPlan.name = '나의 여행 계획';
      tripPlan.date = new Date().toISOString().split('T')[0];
      tripPlan.memo = '';
      tripPlan.attractions = [];
      
      localStorage.removeItem('tripPlan');
      
      alert('여행 계획이 저장되었습니다.');
    };

    // 지도 초기화
    const initMap = () => {
      console.log('Initializing map...'); // 디버깅
      const container = document.getElementById('map');
      if (!container) {
        console.error('Map container not found');
        return;
      }

      if (window.kakao && window.kakao.maps) {
        console.log('Kakao Maps API loaded, creating map');
        createMap();
      } else {
        console.log('Loading Kakao Maps API');
        const script = document.createElement('script');
        script.onload = () => {
          window.kakao.maps.load(() => {
            console.log('Kakao Maps API loaded successfully');
            createMap();
          });
        };
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=88add3cf720f39380a84327647c428b1&libraries=services&autoload=false`;
        document.head.appendChild(script);
      }
    };

    // 지도 생성
    const createMap = () => {
      const container = document.getElementById('map');
      if (!container) {
        console.error('Map container not found in createMap');
        return;
      }

      const options = {
        center: new window.kakao.maps.LatLng(36.2, 127.9),
        level: 13
      };

      map.value = new window.kakao.maps.Map(container, options);
      console.log('Map created:', map.value); // 디버깅

      if (selectedAttractions.value.length > 0) {
        console.log('Displaying markers for attractions:', selectedAttractions.value);
        displayMarkers();
        calculateRoute();
      }
    };

    // 마커 표시
    const displayMarkers = () => {
      console.log('Displaying markers...'); // 디버깅
      clearMarkers();

      const bounds = new window.kakao.maps.LatLngBounds();

      selectedAttractions.value.forEach((attraction, index) => {
        const position = new window.kakao.maps.LatLng(
          attraction.latitude,
          attraction.longitude
        );

        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map.value
        });

        const iwContent = `
          <div style="padding:5px;font-size:12px;width:150px;text-align:center;">
            <b>${index + 1}. ${attraction.title}</b>
          </div>
        `;

        const infowindow = new window.kakao.maps.InfoWindow({
          content: iwContent
        });

        infowindow.open(map.value, marker);
        markers.value.push(marker);
        bounds.extend(position);
      });

      if (selectedAttractions.value.length > 0) {
        map.value.setBounds(bounds);
        console.log('Map bounds set'); // 디버깅
      }
    };

    // 마커 제거
    const clearMarkers = () => {
      console.log('Clearing markers...'); // 디버깅
      markers.value.forEach(marker => {
        marker.setMap(null);
      });
      markers.value = [];

      if (polyline.value) {
        polyline.value.setMap(null);
        polyline.value = null;
      }
    };

    // 경로 계산
    const calculateRoute = () => {
      console.log('Calculating route with attractions:', selectedAttractions.value); // 디버깅
      if (selectedAttractions.value.length < 2 || !map.value) {
        console.log('Not enough attractions or map not initialized');
        totalDistance.value = 0;
        totalDuration.value = 0;
        return;
      }

      displayMarkers();

      const linePath = selectedAttractions.value.map(attraction =>
        new window.kakao.maps.LatLng(attraction.latitude, attraction.longitude)
      );
      console.log('Line path:', linePath); // 디버깅

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
      calculateDistanceAndDuration();
    };

    // 거리와 시간 계산
    const calculateDistanceAndDuration = () => {
      console.log('Calculating distance and duration...'); // 디버깅
      let distance = 0;

      for (let i = 0; i < selectedAttractions.value.length - 1; i++) {
        const start = selectedAttractions.value[i];
        const end = selectedAttractions.value[i + 1];

        const d = getDistanceFromLatLon(
          start.latitude, start.longitude,
          end.latitude, end.longitude
        );

        distance += d;
      }

      totalDistance.value = distance;
      totalDuration.value = (distance / 60) * 60;
      console.log('Total distance:', totalDistance.value, 'Total duration:', totalDuration.value); // 디버깅
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
      const distance = R * c;
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

      return `https://map.kakao.com/link/to/${goal.title},${goal.latitude},${goal.longitude}/from/${start.title},${start.latitude},${start.longitude}`;
    };

    // 선택된 관광지 변경 감지
    watch(selectedAttractions, () => {
      console.log('selectedAttractions updated:', selectedAttractions.value); // 디버깅
      tripPlan.attractions = selectedAttractions.value;
      saveTripPlanToLocal(); // 순서 변경 시 로컬 스토리지 갱신
    }, { deep: true });

    // 컴포넌트 마운트 시 데이터 로드 및 지도 초기화
    onMounted(async () => {
      loadSelectedAttractions();
      console.log('Immediately after loading:', selectedAttractions.value); // 디버깅

      // 데이터 로드 후 DOM 갱신 대기
      await nextTick();
      console.log('After nextTick:', selectedAttractions.value); // 디버깅

      setTimeout(() => {
        console.log('Before initMap:', selectedAttractions.value); // 디버깅
        initMap();
        if (selectedAttractions.value.length > 0) {
          console.log('Calculating route with:', selectedAttractions.value);
          calculateRoute();
        }
      }, 100);
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
  /* overflow-y: auto; */
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
  justify-content : center;
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
