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

    <!-- AttractionCard 컴포넌트 재사용 -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
      <div v-for="attraction in popularAttractions" :key="attraction.no" class="col d-flex">
        <attraction-card :attraction="attraction" class="w-100" />
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, onMounted, defineProps } from 'vue'
import attractionService from '@/services/attraction'
import AttractionCard from '@/components/attraction/AttractionCard.vue'

const props = defineProps({
  limit: {
    type: Number,
    default: 4,

  },
})

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
</script>

<style scoped>
.popular-attractions {
  margin-top: 2rem;
}
</style>