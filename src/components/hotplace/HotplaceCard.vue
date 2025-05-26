<template>
  <div class="hotplace-card" @click="navigateToDetail">
    <div class="card h-100 shadow-sm hover-effect">
      <div class="image-container">
        <img
          v-if="hotplace.imageUrls && hotplace.imageUrls.length > 0"
          :src="hotplace.imageUrls[0]"
          class="card-img-top"
          :alt="hotplace.title"
        >
        <div v-else class="no-image">
          <i class="bi bi-image"></i>
          <span>이미지 없음</span>
        </div>

        <!-- 카테고리 뱃지 -->
        <div class="category-badge">
          {{ hotplace.contentTypeName }}
        </div>

        <!-- 평점 뱃지 -->
        <div class="rating-badge">
          <i class="bi bi-star-fill"></i>
          {{ hotplace.rating }}
        </div>
      </div>

      <div class="card-body">
        <h5 class="card-title text-truncate" :title="hotplace.title">
          {{ hotplace.title }}
        </h5>

        <p class="card-text description" v-if="hotplace.description">
          {{ hotplace.description }}
        </p>
        <p class="card-text text-muted" v-else>
          설명이 없습니다.
        </p>

        <div class="d-flex justify-content-between align-items-center mt-auto">
          <span class="view-count">
            <i class="bi bi-eye"></i> {{ hotplace.viewCount || 0 }}
          </span>
          <router-link :to="`/hotplaces/${hotplace.id}`" class="btn btn-sm btn-outline-primary">
            상세보기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {defineProps} from 'vue'

const props = defineProps({
  hotplace: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const navigateToDetail = () => {
  router.push(`/hotplaces/${props.hotplace.id}`)
}
</script>

<style scoped>
.hotplace-card {
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

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(67, 97, 238, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.rating-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 193, 7, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-title {
  height: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
  color: #6c757d;
  height: 2.8rem;
}

.view-count {
  font-size: 0.85rem;
  color: #6c757d;
}
</style>