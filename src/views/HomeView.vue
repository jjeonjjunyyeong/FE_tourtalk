<template>
  <div class="home-view">
    <!-- 인기 관광지 섹션 -->
    <popular-attractions :limit="4" />
    
    <!-- 테마별 추천 여행지 -->
    <section class="theme-recommendations mt-5">
      <div class="section-title d-flex justify-content-between align-items-center mb-4">
        <h3>테마별 추천 여행지</h3>
        <div class="theme-tabs">
          <button 
            v-for="theme in themes" 
            :key="theme.id"
            :class="['btn', 'me-2', selectedTheme === theme.id ? 'btn-primary' : 'btn-outline-primary']"
            @click="selectTheme(theme.id)"
          >
            {{ theme.name }}
          </button>
        </div>
      </div>
      
      <div v-if="themeLoading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
        <p class="mt-2">추천 여행지를 불러오는 중입니다...</p>
      </div>
      
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="attraction in themeAttractions" :key="attraction.no" class="col">
          <attraction-card :attraction="attraction" />
        </div>
      </div>
    </section>
    
    <!-- 지역별 추천 여행지 -->
    <section class="region-recommendations mt-5">
      <div class="section-title d-flex justify-content-between align-items-center mb-4">
        <h3>지역별 추천 여행지</h3>
        <select 
          v-model="selectedRegion" 
          class="form-select form-select-sm" 
          style="width: auto;"
          @change="fetchRegionAttractions"
        >
          <option 
            v-for="region in regions" 
            :key="region.id" 
            :value="region.id"
          >
            {{ region.name }}
          </option>
        </select>
      </div>
      
      <div v-if="regionLoading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
        <p class="mt-2">지역별 여행지를 불러오는 중입니다...</p>
      </div>
      
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="attraction in regionAttractions" :key="attraction.no" class="col">
          <attraction-card :attraction="attraction" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import PopularAttractions from '@/components/attraction/PopularAttractions.vue';
import AttractionCard from '@/components/attraction/AttractionCard.vue';
import { ref, onMounted } from 'vue';
import attractionService from '@/services/attraction';

// 테마 관련
const themes = ref([]);
const selectedTheme = ref(null);
const themeAttractions = ref([]);
const themeLoading = ref(false);

// 지역 관련
const regions = ref([]);
const selectedRegion = ref(null);
const regionAttractions = ref([]);
const regionLoading = ref(false);

// 폼 데이터 조회
const fetchFormData = async () => {
  try {
    const { data } = await attractionService.getFormData();
    
    // 테마 데이터 설정
    themes.value = data.contentList || [];
    if (themes.value.length > 0) {
      selectedTheme.value = themes.value[0].id;
      await fetchThemeAttractions();
    }
    
    // 지역 데이터 설정
    regions.value = data.sidoList || [];
    if (regions.value.length > 0) {
      selectedRegion.value = regions.value[0].id;
      await fetchRegionAttractions();
    }
  } catch (error) {
    console.error('폼 데이터 조회 실패:', error);
  }
};

// 테마별 여행지 조회
const fetchThemeAttractions = async () => {
  if (!selectedTheme.value) return;
  
  try {
    themeLoading.value = true;
    const { data } = await attractionService.getRandomAttractionsByTheme(selectedTheme.value, 3);
    themeAttractions.value = data || [];
  } catch (error) {
    console.error('테마별 여행지 조회 실패:', error);
    themeAttractions.value = [];
  } finally {
    themeLoading.value = false;
  }
};

// 지역별 여행지 조회
const fetchRegionAttractions = async () => {
  if (!selectedRegion.value) return;
  
  try {
    regionLoading.value = true;
    const { data } = await attractionService.getRandomAttractionsByRegion(selectedRegion.value, 3);
    regionAttractions.value = data || [];
  } catch (error) {
    console.error('지역별 여행지 조회 실패:', error);
    regionAttractions.value = [];
  } finally {
    regionLoading.value = false;
  }
};

// 테마 선택
const selectTheme = (themeId) => {
  selectedTheme.value = themeId;
  fetchThemeAttractions();
};

// 컴포넌트 마운트 시 데이터 조회
onMounted(fetchFormData);
</script>

<style scoped>
.section-title h3 {
  font-weight: bold;
  color: #333;
}

.theme-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .section-title {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .theme-tabs {
    margin-top: 0.5rem;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
  }
}
</style>