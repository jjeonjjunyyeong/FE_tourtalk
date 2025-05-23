<template>
  <section class="popular-attractions">
    <div class="section-title d-flex justify-content-between align-items-center mb-4">
      <h3>인기 관광지</h3>
      <router-link to="/attractions?orderBy=viewCount" class="btn btn-outline-primary btn-sm">
        더보기 <i class="bi bi-arrow-right"></i>
      </router-link>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩중...</span>
      </div>
      <p class="mt-2">인기 관광지를 불러오는 중입니다...</p>
    </div>

    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
      <div v-for="attraction in popularAttractions" :key="attraction.no" class="col">
        <div class="card h-100 shadow-sm popular-card">
          <div class="rank-badge">{{ getOrdinalNumber(attraction.rank) }}</div>
          <div class="d-flex">
            <div class="image-wrapper">
              <img
                v-if="attraction.firstImage1"
                :src="attraction.firstImage1"
                class="rounded"
                :alt="attraction.title"
              />
              <div v-else class="no-image rounded">
                <i class="bi bi-image"></i>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <h6 class="card-title text-truncate mb-1" :title="attraction.title">
                {{ attraction.title }}
              </h6>
              <small class="text-muted mb-1">
                <i class="bi bi-geo-alt-fill"></i> {{ attraction.sido_name }}
              </small>
              <div class="view-count mt-auto">
                <i class="bi bi-eye"></i> {{ attraction.view_cnt }}
              </div>
              <router-link :to="`/attractions/${attraction.no}`" class="stretched-link">
                <span class="visually-hidden">상세보기</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import attractionService from '@/services/attraction'

export default {
  name: 'PopularAttractions',
  props: {
    limit: {
      type: Number,
      default: 4,
    },
  },
  setup(props) {
    const popularAttractions = ref([])
    const loading = ref(false)

    // 순위 표시 헬퍼 함수
    const getOrdinalNumber = (num) => {
      // 순위를 1부터 시작하도록 조정
      const index = num - 1
      return `${index + 1}${getOrdinalSuffix(index + 1)}`
    }

    const getOrdinalSuffix = (num) => {
      if (num === 1) return 'st'
      if (num === 2) return 'nd'
      if (num === 3) return 'rd'
      return 'th'
    }

    // 인기 관광지 조회
    const fetchPopularAttractions = async () => {
      try {
        loading.value = true
        const { data } = await attractionService.getPopularAttractions(props.limit)

        console.log('🔥 API 응답 데이터:', data)

        // 순위 추가
        popularAttractions.value = data.map((item, index) => ({
          ...item,
          rank: index + 1,
          firstImage1: item.first_image1,
        }))
      } catch (error) {
        console.error('인기 관광지 조회 실패:', error)
      } finally {
        loading.value = false
      }
    }

    // 컴포넌트 마운트 시 인기 관광지 조회
    onMounted(fetchPopularAttractions)

    return {
      popularAttractions,
      loading,
      getOrdinalNumber,
    }
  },
}
</script>

<style scoped>
.popular-card {
  position: relative;
  transition: transform 0.2s;
  cursor: pointer;
}

.popular-card:hover {
  transform: translateY(-5px);
}

.rank-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  background-color: #4361ee;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 0.8rem;
  z-index: 1;
}

.image-wrapper {
  width: 100px;
  height: 100px;
  padding: 8px;
}

.image-wrapper img,
.no-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #adb5bd;
}

.view-count {
  font-size: 0.8rem;
  color: #6c757d;
}
</style>
