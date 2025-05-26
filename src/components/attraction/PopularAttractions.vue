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

<script>
import { ref, onMounted } from 'vue'
import attractionService from '@/services/attraction'
import AttractionCard from '@/components/attraction/AttractionCard.vue'

export default {
  name: 'PopularAttractions',
  components: {
    AttractionCard,
  },
  props: {
    limit: {
      type: Number,
      default: 4,
    },
  },
  setup(props) {
    const popularAttractions = ref([])
    const loading = ref(false)

    const fetchPopularAttractions = async () => {
      try {
        loading.value = true
        const { data } = await attractionService.getPopularAttractions(props.limit)

        // 백엔드 응답 필드명 통일
        popularAttractions.value = data.map((item, index) => ({
          ...item,
          no: item.no,
          title: item.title,
          firstImage1: item.first_image1, // 이미지 필드 통일
          sido: item.sido_name,
          gugun: item.gugun_name,
          viewCnt: item.view_cnt,
          contentTypeName: item.content_type_name,
        }))
      } catch (error) {
        console.error('인기 관광지 조회 실패:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchPopularAttractions)

    return {
      popularAttractions,
      loading,
    }
  },
}
</script>

<style scoped>
.popular-attractions {
  margin-top: 2rem;
}
</style>
