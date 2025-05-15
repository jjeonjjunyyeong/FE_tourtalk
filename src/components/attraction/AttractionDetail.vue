<template>
  <div class="attraction-detail">
    <!-- 기본 정보 카드 -->
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

              <div class="info-item" v-if="attraction.homepage">
                <div class="info-label">
                  <i class="bi bi-globe me-1"></i> 웹사이트
                </div>
                <div class="info-value">
                  <a :href="attraction.homepage" target="_blank" rel="noopener">
                    홈페이지 방문
                  </a>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-outline-primary" @click="$emit('view-map')">
                <i class="bi bi-map me-1"></i> 지도보기
              </button>
              <button class="btn btn-primary" @click="$emit('add-to-plan')">
                <i class="bi bi-plus-circle me-1"></i> 여행 계획에 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 설명 -->
    <div class="card shadow-sm mb-4" v-if="attraction.overview">
      <div class="card-body">
        <h4 class="mb-3">상세 설명</h4>
        <div class="description" v-html="sanitizeHTML(attraction.overview)"></div>
      </div>
    </div>

    <!-- 주변 관광지 -->
    <div class="card shadow-sm mb-4" v-if="nearbyAttractions && nearbyAttractions.length > 0">
      <div class="card-header bg-light">
        <h5 class="mb-0">주변 관광지</h5>
      </div>
      <div class="card-body">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div
            v-for="nearby in nearbyAttractions"
            :key="nearby.no"
            class="col"
          >
            <div class="card h-100 nearby-card" @click="$emit('select-nearby', nearby.no)">
              <div class="image-container">
                <img
                  v-if="nearby.firstImage1"
                  :src="nearby.firstImage1"
                  :alt="nearby.title"
                  class="card-img-top"
                >
                <div v-else class="no-image">
                  <i class="bi bi-image"></i>
                </div>
              </div>
              <div class="card-body">
                <h6 class="card-title text-truncate" :title="nearby.title">
                  {{ nearby.title }}
                </h6>
                <p class="card-text small text-muted">
                  {{ nearby.contentTypeName }} | {{ nearby.gugun }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttractionDetail',
  props: {
    attraction: {
      type: Object,
      required: true
    },
    nearbyAttractions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-map', 'add-to-plan', 'select-nearby'],
  setup() {
    // HTML 태그 필터링 (악의적인 스크립트 방지)
    const sanitizeHTML = (html) => {
      if (!html) return '';

      // 실제 프로덕션에서는 DOMPurify 등의 라이브러리 사용 권장
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    };

    return {
      sanitizeHTML
    };
  }
};
</script>

<style scoped>
.image-container {
  height: 100%;
  min-height: 250px;
  background-color: #f8f9fa;
  position: relative;
}

.no-image {
  height: 100%;
  min-height: 250px;
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

.address {
  color: #6c757d;
  font-size: 1.1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-label {
  font-weight: bold;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.description {
  line-height: 1.7;
}

.nearby-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.nearby-card:hover {
  transform: translateY(-5px);
}

.nearby-card .image-container {
  height: 150px;
  min-height: auto;
}

.nearby-card .no-image {
  height: 150px;
  min-height: auto;
}

.nearby-card .card-title {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
