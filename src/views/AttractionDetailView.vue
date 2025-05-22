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
            <div class="attraction-image">
              <img
                v-if="attraction.firstImage1"
                :src="attraction.firstImage1"
                :alt="attraction.title"
                class="img-fluid w-100"
              >
              <div v-else class="no-image">
                <i class="bi bi-image"></i>
                <span>이미지 없음</span>
              </div>

              <!-- 뱃지 -->
              <div class="badge-container">
                <span class="badge bg-primary me-2">{{ attraction.contentTypeName }}</span>
                <span class="badge bg-info">
                  <i class="bi bi-eye me-1"></i> {{ attraction.viewCnt }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <h2 class="card-title">{{ attraction.title }}</h2>
              <p class="address">
                <i class="bi bi-geo-alt-fill"></i>
                {{ attraction.sido }} {{ attraction.gugun }} {{ attraction.addr }}
              </p>

              <hr>

              <div class="description" v-if="attraction.overview">
                <div v-html="sanitizeHTML(attraction.overview)"></div>
              </div>
              <p v-else class="text-muted">상세 설명이 없습니다.</p>
            </div>
          </div>

          <!-- 연락처 및 추가 정보 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h4>연락처 및 추가 정보</h4>

              <div class="row mt-3">
                <div class="col-md-6">
                  <div class="info-item">
                    <div class="info-label">
                      <i class="bi bi-telephone"></i> 연락처
                    </div>
                    <div class="info-value">
                      {{ attraction.tel || '정보 없음' }}
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="info-item">
                    <div class="info-label">
                      <i class="bi bi-globe"></i> 웹사이트
                    </div>
                    <div class="info-value">
                      <a v-if="attraction.homepage" :href="attraction.homepage" target="_blank" rel="noopener">
                        홈페이지 방문
                      </a>
                      <span v-else>정보 없음</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 지도 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h4>위치 정보</h4>

              <div id="map" class="mt-3" style="height: 400px;"></div>
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

          <!-- Toast Container -->
          <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div ref="toastElement" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
              <div class="toast-header">
                <i class="bi bi-info-circle text-primary me-2"></i>
                <strong class="me-auto">여행 계획</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
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

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import attractionService from '@/services/attraction';

export default {
  name: 'AttractionDetailView',
  props: {
    no: {
      type: [Number, String],
      required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const attraction = ref(null);
    const nearbyAttractions = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const map = ref(null);
    const isAddedToPlan = ref(false);
    const toastElement = ref(null);
    const toastMessage = ref('');

    // HTML 태그 필터링 (악의적인 스크립트 방지)
    const sanitizeHTML = (html) => {
      // 실제 프로덕션에서는 DOMPurify 등의 라이브러리 사용 권장
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    };

    // 관광지 상세 정보 조회
    const fetchAttractionDetail = async () => {
      const attractionId = Number(props.no);
      if (isNaN(attractionId)) {
        error.value = '잘못된 관광지 ID 입니다.';
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        const { data } = await attractionService.getAttractionDetail(attractionId);

        if (!data) {
          error.value = '관광지 정보를 찾을 수 없습니다.';
          return;
        }

        attraction.value = data.attraction;
        nearbyAttractions.value = data.nearbyAttractions || [];

        // 지도 초기화 (다음 틱에서 실행)
        setTimeout(() => {
          initMap();
        }, 100);
      } catch (err) {
        console.error('관광지 상세 정보 조회 실패:', err);
        error.value = '관광지 정보를 불러오는데 실패했습니다.';
      } finally {
        loading.value = false;
      }
    };

    // 지도 초기화
    const initMap = () => {
      if (!attraction.value || !attraction.value.latitude || !attraction.value.longitude) return;

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
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&autoload=false`;
        document.head.appendChild(script);
      }
    };

    // 지도 생성
    const createMap = () => {
      const container = document.getElementById('map');
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(
          attraction.value.latitude,
          attraction.value.longitude
        ),
        level: attraction.value.mapLevel || 3
      };

      map.value = new window.kakao.maps.Map(container, options);

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(
        attraction.value.latitude,
        attraction.value.longitude
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      });

      // 마커 지도에 표시
      marker.setMap(map.value);

      // 인포윈도우 생성
      const iwContent = `<div style="padding:5px;">${attraction.value.title}</div>`;
      const infowindow = new window.kakao.maps.InfoWindow({
        content: iwContent
      });

      // 마커에 인포윈도우 표시
      infowindow.open(map.value, marker);
    };

    // 토스트 메시지 생성
    const generateToastMessage = () => {
      const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}');
      const attractionNames = tripPlan.attractions.map(attr => attr.title).join(', ');
      return `등록된 일정 : ${attractionNames || '없음'}`;
    };

    // 토스트 보여주기
    const showToast = () => {
      toastMessage.value = generateToastMessage();
      
      if (toastElement.value) {
        // Bootstrap Toast 인스턴스 생성 및 보여주기
        const toast = new window.bootstrap.Toast(toastElement.value, {
          delay: 2000 // 2초
        });
        toast.show();
      }
    };

    // 여행 계획 추가/삭제 토글
    const toggleTripPlan = () => {
      if (!attraction.value) return;

      const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}');
      const existingIndex = tripPlan.attractions.findIndex(item => item.no === attraction.value.no);

      if (existingIndex !== -1) {
        // 이미 추가된 경우 - 삭제
        tripPlan.attractions.splice(existingIndex, 1);
        localStorage.setItem('tripPlan', JSON.stringify(tripPlan));
        isAddedToPlan.value = false;
      } else {
        // 추가되지 않은 경우 - 추가
        tripPlan.attractions.push(attraction.value);
        localStorage.setItem('tripPlan', JSON.stringify(tripPlan));
        isAddedToPlan.value = true;
      }

      // 토스트 메시지 보여주기
      showToast();
    };

    // 여행 계획 추가 상태 확인
    const checkTripPlanStatus = () => {
      if (!attraction.value) return;

      const tripPlan = JSON.parse(localStorage.getItem('tripPlan') || '{"attractions":[]}');
      const exists = tripPlan.attractions.some(item => item.no === attraction.value.no);
      isAddedToPlan.value = exists;
    };

    // attraction 값이 변경될 때 여행 계획 상태 확인
    watch(attraction, (newAttraction) => {
      if (newAttraction) {
        checkTripPlanStatus();
      }
    });

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(fetchAttractionDetail);

    return {
      attraction,
      nearbyAttractions,
      loading,
      error,
      isAddedToPlan,
      toastElement,
      toastMessage,
      sanitizeHTML,
      toggleTripPlan
    };
  }
};
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
</style>
