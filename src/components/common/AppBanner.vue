<template>
  <div class="banner-container">
    <div id="bannerCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button v-for="(banner, index) in banners" :key="`indicator-${index}`"
                type="button" data-bs-target="#bannerCarousel"
                :data-bs-slide-to="index"
                :class="{ active: index === 0 }"
                :aria-current="index === 0"
                :aria-label="`Slide ${index + 1}`">
        </button>
      </div>

      <div class="carousel-inner">
        <div v-for="(banner, index) in banners" :key="`banner-${index}`"
             :class="['carousel-item', { active: index === 0 }]">
          <img :src="banner.image" class="d-block w-100" :alt="banner.title">
          <div class="carousel-caption d-none d-md-block">
            <h3>{{ banner.title }}</h3>
            <p>{{ banner.description }}</p>
            <router-link v-if="banner.link" :to="banner.link" class="btn btn-primary">
              자세히 보기
            </router-link>
          </div>
        </div>
      </div>

      <button class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 배너 데이터 (실제로는 API에서 가져올 수 있음)
const banners = ref([
  {
    title: '한국의 아름다운 관광지',
    description: '다양한 지역의 문화와 명소를 탐험해보세요',
    image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58',
    link: '/attractions'
  },
  {
    title: '특별한 여행을 계획하세요',
    description: '여행 계획 도구로 완벽한 여행 일정을 만들어보세요',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592',
    link: '/trip-plan'
  },
  {
    title: '인기 있는 관광지',
    description: '사람들이 가장 많이 방문한 명소를 확인하세요',
    image: 'https://images.unsplash.com/photo-1570654316061-98a06c9894f7',
    link: '/attractions?sort=popular'
  }
]);
</script>

<style scoped>
.banner-container {
  margin-bottom: 2rem;
}

.carousel-item {
  height: 400px;
}

.carousel-item img {
  object-fit: cover;
  height: 100%;
  width: 100%;
  filter: brightness(0.7);
}

.carousel-caption {
  bottom: 5rem;
}

.carousel-caption h3 {
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-caption p {
  font-size: 1.2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  margin-bottom: 1.5rem;
}
</style>
