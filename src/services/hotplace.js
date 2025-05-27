import apiClient from './api';

export default {
  // Hotplace 등록
  createHotplace(formData) {
    return apiClient.post('/hotplaces', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Hotplace 상세 조회
  getHotplaceDetail(id) {
    return apiClient.get(`/hotplaces/${id}`);
  },

  // 전체 Hotplace 목록 조회 (페이징)
  getAllHotplaces(params = {}) {
    const { page = 1, size = 12 } = params;
    return apiClient.get('/hotplaces', { params: { page, size } });
  },

  // 내가 등록한 Hotplace 목록 조회
  getMyHotplaces(params = {}) {
    const { page = 1, size = 12 } = params;
    return apiClient.get('/hotplaces/my', { params: { page, size } });
  },

  // Hotplace 수정
  updateHotplace(id, formData) {
    return apiClient.put(`/hotplaces/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Hotplace 삭제
  deleteHotplace(id) {
    return apiClient.delete(`/hotplaces/${id}`);
  },

  // Hotplace 검색
  searchHotplaces(params = {}) {
    const { keyword, contentTypeId, page = 1, size = 12 } = params;
    const queryParams = { page, size };

    if (keyword) queryParams.keyword = keyword;
    if (contentTypeId) queryParams.contentTypeId = contentTypeId;

    return apiClient.get('/hotplaces/search', { params: queryParams });
  },

  // 인기 Hotplace 조회
  getPopularHotplaces(limit = 10) {
    return apiClient.get('/hotplaces/popular', { params: { limit } });
  },

  // 카테고리 목록 조회 (기존 attraction API 활용)
  getContentTypes() {
    return apiClient.get('/attractions/form-data');
  }
};
