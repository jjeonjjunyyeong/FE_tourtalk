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
    const { data } = await attractionService.getRandomAttractionsByTheme(selectedTheme.value, 6);
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
    const { data } = await attractionService.getRandomAttractionsByRegion(selectedRegion.value, 6);
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
