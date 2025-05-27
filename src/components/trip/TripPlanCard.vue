<template>
  <div class="trip-plan-card">
    <div class="card shadow-sm h-100">
      <div class="card-img-top image-container">
        <!-- 대표 이미지 표시 -->
        <img
          v-if="tripPlan.coverImage || firstAttractionImage"
          :src="tripPlan.coverImage || firstAttractionImage"
          class="card-img-top"
          alt="여행 계획 이미지"
        >
        <div v-else class="no-image">
          <i class="bi bi-images"></i>
          <span>이미지 없음</span>
        </div>

        <!-- 기간 표시 배지 -->
        <div class="date-badge" v-if="tripPlan.startDate && tripPlan.endDate">
          <i class="bi bi-calendar-range"></i>
          {{ formatDateRange(tripPlan.startDate, tripPlan.endDate) }}
        </div>

        <!-- 관광지 개수 배지 -->
        <div class="attraction-count-badge">
          <i class="bi bi-geo-alt"></i>
          {{ attractionCount }}
        </div>
      </div>

      <div class="card-body">
        <h5 class="card-title">{{ tripPlan.name }}</h5>

        <div class="plan-meta mb-2">
          <span class="text-muted small">
            <i class="bi bi-person"></i> {{ tripPlan.createdBy || '사용자' }}
          </span>
          <span class="text-muted small ms-2">
            <i class="bi bi-clock"></i> {{ formatDate(tripPlan.createdAt) }}
          </span>
        </div>

        <p class="card-text description">{{ tripPlan.description || '여행 계획에 대한 설명이 없습니다.' }}</p>

        <!-- 관광지 태그 목록 -->
        <div class="plan-tags mb-2" v-if="showAttractionList && tripPlan.attractions && tripPlan.attractions.length > 0">
          <div class="attraction-tag" v-for="(attraction, index) in limitedAttractions" :key="index">
            {{ attraction.title }}
          </div>
          <div class="attraction-tag more" v-if="tripPlan.attractions.length > 3">
            +{{ tripPlan.attractions.length - 3 }}개
          </div>
        </div>
      </div>

      <!-- 카드 하단 버튼 영역 -->
      <div class="card-footer bg-white border-top-0">
        <div class="d-flex justify-content-between">
          <button
            v-if="editable"
            class="btn btn-sm btn-outline-primary"
            @click="$emit('edit', tripPlan.id)"
          >
            <i class="bi bi-pencil"></i> 수정
          </button>
          <button
            v-else
            class="btn btn-sm btn-outline-secondary"
            @click="$emit('view', tripPlan.id)"
          >
            <i class="bi bi-eye"></i> 상세 보기
          </button>

          <button
            class="btn btn-sm btn-primary"
            @click="$emit('start', tripPlan.id)"
          >
            <i class="bi bi-play-fill"></i> 여행 시작
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue'

const props = defineProps({
  tripPlan: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  showAttractionList: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['view', 'edit', 'start'])

// 관광지 개수 계산
const attractionCount = computed(() => {
  return props.tripPlan.attractions?.length || 0
})

// 첫 번째 관광지 이미지 (대표 이미지가 없을 경우 사용)
const firstAttractionImage = computed(() => {
  if (props.tripPlan.attractions && props.tripPlan.attractions.length > 0) {
    return props.tripPlan.attractions[0].firstImage1
  }
  return null
})

// 표시할 관광지 목록 (최대 3개)
const limitedAttractions = computed(() => {
  if (!props.tripPlan.attractions) return []
  return props.tripPlan.attractions.slice(0, 3)
})

// 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음'

  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

// 날짜 범위 포맷팅
const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start === end) {
    return start
  }

  return `${start} - ${end}`
}
</script>

<style scoped>
.trip-plan-card {
  transition: transform 0.2s;
}

.trip-plan-card:hover {
  transform: translateY(-5px);
}

.image-container {
  height: 180px;
  position: relative;
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

.date-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.attraction-count-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.card-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
}

.description {
  display: -webkit-box;
  line-clamp: 2;
  box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
  color: #6c757d;
  height: 2.8rem;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.attraction-tag {
  background-color: #f1f3f5;
  color: #495057;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.attraction-tag.more {
  background-color: #e9ecef;
  color: #6c757d;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>