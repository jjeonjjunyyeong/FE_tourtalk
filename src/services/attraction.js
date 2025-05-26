import apiClient from './api'

export default {
  // 관광지 폼 데이터 조회 (콘텐츠 유형, 시도 목록, 랜덤 관광지)
  getFormData() {
    return apiClient.get('/attractions/form-data')
  },

  // 특정 시도에 대한 시군구 목록 조회
  getGugunList(sidoCode) {
    return apiClient.get('/attractions/guguns', { params: { sidoCode } })
  },

  // 코드 기반 관광지 목록 조회
  getAttractionsByCodes(contentTypeId, sidoCode, gugunCode, page = 1, size = 10) {
    return apiClient.get('/attractions/codes', {
      params: { contentTypeId, sidoCode, gugunCode, page, size },
    })
  },

  // 검색 조건을 통한 관광지 검색
  searchAttractions(searchCondition) {
    return apiClient.get('/attractions/search', { params: searchCondition })
  },

  // 특정 관광지 상세 정보 조회
  getAttractionDetail(no) {
    return apiClient.get(`/attractions/${no}`)
  },

  // 인기 관광지 목록 조회
  getPopularAttractions(limit = 10) {
    return apiClient.get('/attractions/popular', { params: { limit } })
  },

  // 테마별 랜덤 관광지 조회
  getRandomAttractionsByTheme(contentTypeId, count = 4) {
    return apiClient.get(`/attractions/random/theme/${contentTypeId}`, {
      params: { count },
    })
  },

  // 지역별 랜덤 관광지 조회
  getRandomAttractionsByRegion(sidoCode, count = 4) {
    return apiClient.get(`/attractions/random/region/${sidoCode}`, {
      params: { count },
    })
  },

  // 관광지명 자동완성
  getAttractionTitles(keyword) {
    return apiClient.get('/attractions/titles', { params: { keyword } })
  },
}
