<template>
  <div class="attraction-card" @click="navigateToDetail">
    <div class="card h-100 shadow-sm hover-effect">
      <div class="image-container">
        <img
          v-if="attraction.firstImage1"
          :src="attraction.firstImage1"
          class="card-img-top"
          :alt="attraction.title"
        >
        <div v-else class="no-image">
          <i class="bi bi-image"></i>
          <span>이미지 없음</span>
        </div>

        <!-- 관광지 유형 뱃지 -->
        <div class="attraction-type">
          {{ attraction.contentTypeName }}
        </div>
      </div>

      <div class="card-body">
        <h5 class="card-title text-truncate" :title="attraction.title">
          {{ attraction.title }}
        </h5>

        <div class="location mb-2">
          <i class="bi bi-geo-alt-fill"></i>
          {{ attraction.sido }} {{ attraction.gugun }}
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <span class="view-count">
            <i class="bi bi-eye"></i> {{ attraction.viewCnt }}
          </span>
          <router-link :to="`/attractions/${attraction.no}`" class="btn btn-sm btn-outline-primary">
            상세보기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'AttractionCard',
  props: {
    attraction: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    const navigateToDetail = () => {
      router.push(`/attractions/${props.attraction.no}`);
    };

    return {
      navigateToDetail
    };
  }
};
</script>

<style scoped>
.attraction-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.hover-effect:hover {
  transform: translateY(-5px);
}

.image-container {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.card-img-top {
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.no-image i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.attraction-type {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 123, 255, 0.8);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.card-title {
  height: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.location {
  color: #6c757d;
  font-size: 0.9rem;
}

.view-count {
  font-size: 0.85rem;
  color: #6c757d;
}
</style>
