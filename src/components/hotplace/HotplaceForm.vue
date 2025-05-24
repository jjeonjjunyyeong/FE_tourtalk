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

              <!-- 주소 검색 -->
              <div class="mb-3">
                <label for="addressSearch" class="form-label">주소 검색</label>
                <div class="input-group">
                  <input
                    type="text"
                    id="addressSearch"
                    v-model="addressSearch"
                    class="form-control"
                    placeholder="주소를 입력하고 검색하세요"
                  >
                  <button type="button" class="btn btn-outline-secondary" @click="searchAddress">
                    <i class="bi bi-search"></i>
                  </button>
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
                지도를 클릭하여 정확한 위치를 선택하세요
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
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
    const addressSearch = ref('');
    const map = ref(null);
    const marker = ref(null);

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

    // 주소 검색
    const searchAddress = () => {
      if (!addressSearch.value.trim()) {
        alert('주소를 입력해주세요.');
        return;
      }

      if (!window.kakao || !window.kakao.maps) {
        alert('지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(addressSearch.value, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          formData.latitude = parseFloat(result[0].y);
          formData.longitude = parseFloat(result[0].x);

          // 지도 중심 이동 및 마커 표시
          map.value.setCenter(coords);
          updateMarker(coords);
        } else {
          alert('주소를 찾을 수 없습니다. 다른 주소로 시도해보세요.');
        }
      });
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
    });

    return {
      loading,
      message,
      messageType,
      fileInput,
      addressSearch,
      formData,
      contentTypes,
      imagePreview,
      existingImages,
      isFormValid,
      setRating,
      handleFileUpload,
      removeImage,
      searchAddress,
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
</style>
