<template>
  <div class="hotplace-form">
    <form @submit.prevent="onSubmit" enctype="multipart/form-data">
      <!-- 알림 메시지 -->
      <div v-if="message" :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']">
        {{ message }}
      </div>

      <div class="row">
        <!-- 좌측: 기본 정보 -->
        <div class="col-lg-6">
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">기본 정보</h5>

              <!-- 장소명 -->
              <div class="mb-3">
                <label for="title" class="form-label">장소명 *</label>
                <input
                  type="text"
                  id="title"
                  v-model="formData.title"
                  class="form-control"
                  placeholder="핫플레이스 이름을 입력하세요"
                  required
                >
              </div>

              <!-- 카테고리 -->
              <div class="mb-3">
                <label for="contentType" class="form-label">카테고리 *</label>
                <select
                  id="contentType"
                  v-model="formData.contentTypeId"
                  class="form-select"
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option
                    v-for="content in contentTypes"
                    :key="content.id"
                    :value="content.id"
                  >
                    {{ content.name }}
                  </option>
                </select>
              </div>

              <!-- 평점 -->
              <div class="mb-3">
                <label for="rating" class="form-label">평점 *</label>
                <div class="rating-input">
                  <div class="d-flex align-items-center gap-2">
                    <div class="star-rating">
                      <i
                        v-for="star in 5"
                        :key="star"
                        :class="['bi', star <= formData.rating ? 'bi-star-fill' : 'bi-star']"
                        @click="setRating(star)"
                        class="star"
                      ></i>
                    </div>
                    <span class="rating-text">{{ formData.rating }}점</span>
                  </div>
                </div>
              </div>

              <!-- 설명 -->
              <div class="mb-3">
                <label for="description" class="form-label">설명</label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                  placeholder="이 장소에 대한 설명을 입력하세요"
                ></textarea>
              </div>

              <!-- 방문 후기 -->
              <div class="mb-3">
                <label for="review" class="form-label">방문 후기</label>
                <textarea
                  id="review"
                  v-model="formData.review"
                  class="form-control"
                  rows="3"
                  placeholder="직접 방문한 후기를 남겨보세요"
                ></textarea>
              </div>

              <!-- 추천 이유 -->
              <div class="mb-3">
                <label for="recommendationReason" class="form-label">추천 이유</label>
                <textarea
                  id="recommendationReason"
                  v-model="formData.recommendationReason"
                  class="form-control"
                  rows="2"
                  placeholder="이 장소를 추천하는 이유를 알려주세요"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측: 위치 정보 및 이미지 -->
        <div class="col-lg-6">
          <!-- 위치 선택 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">위치 정보 *</h5>

              <!-- 통합 검색 -->
              <div class="mb-3">
                <label for="placeSearch" class="form-label">장소 검색</label>
                <div class="search-container">
                  <div class="input-group">
                    <input
                      type="text"
                      id="placeSearch"
                      v-model="searchQuery"
                      @input="onSearchInput"
                      @focus="showSearchResults = true"
                      class="form-control"
                      placeholder="주소, 지명, 상호명으로 검색하세요"
                      autocomplete="off"
                    >
                    <button type="button" class="btn btn-outline-secondary" @click="clearSearch">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>

                  <!-- 검색 결과 드롭다운 -->
                  <div
                    v-if="showSearchResults && searchResults.length > 0"
                    class="search-results"
                  >
                    <div class="search-results-list">
                      <div
                        v-for="(result, index) in searchResults"
                        :key="index"
                        class="search-result-item"
                        @click="selectPlace(result)"
                      >
                        <div class="result-icon">{{ getCategoryIcon(result.category_group_code) }}</div>
                        <div class="result-info">
                          <div class="result-name">{{ result.place_name }}</div>
                          <div class="result-address">{{ result.address_name }}</div>
                          <div v-if="result.category_name" class="result-category">
                            {{ result.category_name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 검색 중 로딩 -->
                  <div v-if="searchLoading" class="search-loading">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">검색중...</span>
                    </div>
                    <span class="ms-2">검색중...</span>
                  </div>

                  <!-- 검색 결과 없음 -->
                  <div v-if="showSearchResults && searchQuery && !searchLoading && searchResults.length === 0" class="no-results">
                    <i class="bi bi-search"></i>
                    <span>검색 결과가 없습니다</span>
                  </div>
                </div>
              </div>

              <!-- 좌표 정보 -->
              <div class="row mb-3">
                <div class="col-6">
                  <label for="latitude" class="form-label">위도</label>
                  <input
                    type="number"
                    id="latitude"
                    v-model.number="formData.latitude"
                    class="form-control"
                    step="0.000001"
                    readonly
                  >
                </div>
                <div class="col-6">
                  <label for="longitude" class="form-label">경도</label>
                  <input
                    type="number"
                    id="longitude"
                    v-model.number="formData.longitude"
                    class="form-control"
                    step="0.000001"
                    readonly
                  >
                </div>
              </div>

              <!-- 지도 -->
              <div id="map" style="height: 300px; border-radius: 0.375rem;"></div>
              <small class="text-muted mt-2 d-block">
                지도를 클릭하여 정확한 위치를 선택하거나 위의 검색을 이용하세요
              </small>
            </div>
          </div>

          <!-- 이미지 업로드 -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">이미지 (최대 5개)</h5>

              <!-- 파일 선택 -->
              <div class="mb-3">
                <input
                  type="file"
                  id="images"
                  ref="fileInput"
                  @change="handleFileUpload"
                  class="form-control"
                  multiple
                  accept="image/*"
                >
                <div class="form-text">
                  JPG, PNG, GIF 파일만 업로드 가능합니다. (각 파일 최대 5MB)
                </div>
              </div>

              <!-- 이미지 미리보기 -->
              <div v-if="imagePreview.length > 0" class="image-preview">
                <div class="row g-2">
                  <div
                    v-for="(image, index) in imagePreview"
                    :key="index"
                    class="col-4"
                  >
                    <div class="preview-item">
                      <img :src="image.url" :alt="`Preview ${index + 1}`" class="img-fluid rounded">
                      <button
                        type="button"
                        class="btn btn-sm btn-danger preview-remove"
                        @click="removeImage(index)"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 기존 이미지 (수정 모드) -->
              <div v-if="isEdit && existingImages.length > 0" class="existing-images">
                <h6 class="mb-2">기존 이미지</h6>
                <div class="row g-2">
                  <div
                    v-for="(image, index) in existingImages"
                    :key="`existing-${index}`"
                    class="col-4"
                  >
                    <div class="preview-item">
                      <img :src="image" :alt="`Existing ${index + 1}`" class="img-fluid rounded">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼 영역 -->
      <div class="d-flex justify-content-between">
        <router-link to="/hotplaces" class="btn btn-secondary">
          <i class="bi bi-x-circle me-1"></i> 취소
        </router-link>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="bi bi-check-circle me-1"></i>
          {{ isEdit ? '수정하기' : '등록하기' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import hotplaceService from '@/services/hotplace';

export default {
  name: 'HotplaceForm',
  props: {
    hotplace: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const loading = ref(false);
    const message = ref('');
    const messageType = ref('');
    const fileInput = ref(null);
    const map = ref(null);
    const marker = ref(null);

    // 검색 관련 상태
    const searchQuery = ref('');
    const searchResults = ref([]);
    const showSearchResults = ref(false);
    const searchLoading = ref(false);
    const searchTimeout = ref(null);

    // 폼 데이터
    const formData = reactive({
      title: '',
      latitude: 37.5665,
      longitude: 126.9780,
      rating: 5,
      contentTypeId: '',
      description: '',
      review: '',
      recommendationReason: ''
    });

    // 카테고리 데이터
    const contentTypes = ref([]);
    const imagePreview = ref([]);
    const selectedFiles = ref([]);
    const existingImages = ref([]);

    // 폼 유효성 검사
    const isFormValid = computed(() => {
      return formData.title &&
             formData.contentTypeId &&
             formData.latitude &&
             formData.longitude &&
             formData.rating >= 1 &&
             formData.rating <= 5;
    });

    // 카테고리별 아이콘 매핑
    const getCategoryIcon = (categoryCode) => {
      const iconMap = {
        'AT4': '🏛️', // 관광명소
        'AD5': '🏨', // 숙박
        'FD6': '🍽️', // 음식점
        'CE7': '☕', // 카페
        'MT1': '🏪', // 대형마트
        'CS2': '🏪', // 편의점
        'PK6': '🚗', // 주차장
        'OL7': '⛽', // 주유소, 충전소
        'SW8': '🚇', // 지하철역
        'BK9': '🏦', // 은행
        'CT1': '🏛️', // 문화시설
        'AG2': '🏢', // 중개업소
        'PO3': '🏛️', // 공공기관
        'AC5': '📚', // 학교
        'PS3': '🏥', // 병원
        'PM9': '💊', // 약국
        'HP8': '🏥'  // 병원
      };
      return iconMap[categoryCode] || '📍';
    };

    // 카테고리 목록 조회
    const fetchContentTypes = async () => {
      try {
        const { data } = await hotplaceService.getContentTypes();
        contentTypes.value = data.contentList || [];
      } catch (error) {
        console.error('카테고리 목록 조회 실패:', error);
      }
    };

    // 평점 설정
    const setRating = (rating) => {
      formData.rating = rating;
    };

    // 검색 입력 처리
    const onSearchInput = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      if (!searchQuery.value.trim()) {
        searchResults.value = [];
        showSearchResults.value = false;
        return;
      }

      // 디바운스: 300ms 후에 검색 실행
      searchTimeout.value = setTimeout(() => {
        performSearch();
      }, 300);
    };

    // 검색 실행
    const performSearch = async () => {
      if (!searchQuery.value.trim()) return;

      try {
        searchLoading.value = true;

        if (!window.kakao || !window.kakao.maps) {
          alert('지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
          return;
        }

        const places = new window.kakao.maps.services.Places();

        places.keywordSearch(searchQuery.value, (result, status) => {
          searchLoading.value = false;

          if (status === window.kakao.maps.services.Status.OK) {
            // 최대 5개 결과만 표시
            searchResults.value = result.slice(0, 5);
            showSearchResults.value = true;
          } else {
            searchResults.value = [];
            showSearchResults.value = true;
          }
        });

      } catch (error) {
        console.error('검색 실패:', error);
        searchLoading.value = false;
        searchResults.value = [];
      }
    };

    // 장소 선택
    const selectPlace = (place) => {
      // 선택된 장소 정보로 폼 업데이트
      formData.latitude = parseFloat(place.y);
      formData.longitude = parseFloat(place.x);

      // 장소명이 비어있으면 자동으로 설정
      if (!formData.title.trim()) {
        formData.title = place.place_name;
      }

      // 검색창에 선택된 장소명 표시
      searchQuery.value = place.place_name;

      // 검색 결과 숨기기
      showSearchResults.value = false;
      searchResults.value = [];

      // 지도 업데이트
      if (map.value) {
        const coords = new window.kakao.maps.LatLng(place.y, place.x);
        map.value.setCenter(coords);
        updateMarker(coords);
      }
    };

    // 검색 초기화
    const clearSearch = () => {
      searchQuery.value = '';
      searchResults.value = [];
      showSearchResults.value = false;
    };

    // 파일 업로드 처리
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files);

      if (files.length > 5) {
        alert('최대 5개의 이미지만 업로드할 수 있습니다.');
        return;
      }

      selectedFiles.value = files;
      imagePreview.value = [];

      files.forEach((file, index) => {
        if (file.size > 5 * 1024 * 1024) { // 5MB
          alert(`${file.name}의 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.value.push({
            url: e.target.result,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    };

    // 이미지 삭제
    const removeImage = (index) => {
      imagePreview.value.splice(index, 1);
      selectedFiles.value.splice(index, 1);

      // 파일 입력 필드 초기화
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    // 지도 초기화
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initMap, 100);
        return;
      }

      const container = document.getElementById('map');
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(formData.latitude, formData.longitude),
        level: 3
      };

      map.value = new window.kakao.maps.Map(container, options);

      // 초기 마커 생성
      const initialCoords = new window.kakao.maps.LatLng(formData.latitude, formData.longitude);
      updateMarker(initialCoords);

      // 지도 클릭 이벤트
      window.kakao.maps.event.addListener(map.value, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng;

        formData.latitude = latlng.getLat();
        formData.longitude = latlng.getLng();

        updateMarker(latlng);
      });
    };

    // 마커 업데이트
    const updateMarker = (position) => {
      if (marker.value) {
        marker.value.setMap(null);
      }

      marker.value = new window.kakao.maps.Marker({
        position: position,
        map: map.value
      });
    };

    // 폼 제출
    const onSubmit = async () => {
      try {
        loading.value = true;
        message.value = '';

        // FormData 생성
        const submitData = new FormData();

        // 기본 데이터 추가
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, formData[key]);
          }
        });

        // 이미지 파일 추가
        selectedFiles.value.forEach((file) => {
          submitData.append('images', file);
        });

        emit('submit', submitData);

      } catch (error) {
        console.error('폼 제출 실패:', error);
        message.value = '등록 중 오류가 발생했습니다.';
        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    // 초기 데이터 로드
    const loadInitialData = () => {
      if (props.isEdit && props.hotplace) {
        Object.assign(formData, {
          title: props.hotplace.title,
          latitude: props.hotplace.latitude,
          longitude: props.hotplace.longitude,
          rating: props.hotplace.rating,
          contentTypeId: props.hotplace.contentTypeId,
          description: props.hotplace.description || '',
          review: props.hotplace.review || '',
          recommendationReason: props.hotplace.recommendationReason || ''
        });

        existingImages.value = props.hotplace.imageUrls || [];
      }
    };

    // 지도 API 로드
    const loadKakaoMapScript = () => {
      if (window.kakao && window.kakao.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.onload = () => {
        window.kakao.maps.load(() => {
          initMap();
        });
      };
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=88add3cf720f39380a84327647c428b1&libraries=services&autoload=false`;
      document.head.appendChild(script);
    };

    // 검색 결과 외부 클릭 시 숨기기
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        showSearchResults.value = false;
      }
    };

    // 좌표 변경 감지하여 지도 업데이트
    watch(() => [formData.latitude, formData.longitude], ([newLat, newLng]) => {
      if (map.value && newLat && newLng) {
        const newPosition = new window.kakao.maps.LatLng(newLat, newLng);
        map.value.setCenter(newPosition);
        updateMarker(newPosition);
      }
    });

    // 컴포넌트 마운트
    onMounted(() => {
      fetchContentTypes();
      loadInitialData();
      setTimeout(loadKakaoMapScript, 100);

      // 외부 클릭 이벤트 리스너 추가
      document.addEventListener('click', handleClickOutside);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
    });

    return {
      loading,
      message,
      messageType,
      fileInput,
      searchQuery,
      searchResults,
      showSearchResults,
      searchLoading,
      formData,
      contentTypes,
      imagePreview,
      existingImages,
      isFormValid,
      getCategoryIcon,
      setRating,
      onSearchInput,
      selectPlace,
      clearSearch,
      handleFileUpload,
      removeImage,
      onSubmit
    };
  }
};
</script>

<style scoped>
.star-rating {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: #ffc107;
  cursor: pointer;
  font-size: 1.25rem;
  transition: color 0.2s;
}

.star:hover {
  color: #ffb300;
}

.rating-text {
  font-weight: 500;
  color: #495057;
}

.image-preview, .existing-images {
  margin-top: 1rem;
}

.preview-item {
  position: relative;
}

.preview-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0.25rem;
  line-height: 1;
}

#map {
  border: 1px solid #dee2e6;
}

/* 검색 관련 스타일 */
.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-results-list {
  padding: 0;
  margin: 0;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.result-info {
  flex-grow: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.result-address {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.125rem;
  word-break: break-word;
}

.result-category {
  font-size: 0.75rem;
  color: #adb5bd;
  word-break: break-word;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #adb5bd;
  font-size: 0.875rem;
  gap: 0.5rem;
}
</style>
