import apiClient from './api';

export default {
  // 여행 계획 저장
  saveTripPlan(tripPlanData) {
    return apiClient.post('/trip-plans', tripPlanData);
  },

  // 사용자의 여행 계획 목록 조회 (페이징 및 상태 필터링 지원)
  getUserTripPlans(params = {}) {
    const { status, page = 1, size = 10 } = params;
    const queryParams = { page, size };
    
    if (status) {
      queryParams.status = status;
    }
    
    return apiClient.get('/trip-plans', { params: queryParams });
  },

  // 특정 여행 계획 상세 조회
  getTripPlanDetail(tripPlanId) {
    return apiClient.get(`/trip-plans/${tripPlanId}`);
  },

  // 여행 계획 수정
  updateTripPlan(tripPlanId, tripPlanData) {
    return apiClient.put(`/trip-plans/${tripPlanId}`, tripPlanData);
  },

  // 여행 계획 완전 삭제
  deleteTripPlan(tripPlanId) {
    return apiClient.delete(`/trip-plans/${tripPlanId}`);
  },

  // 여행 계획 소프트 삭제 (상태만 DELETED로 변경)
  softDeleteTripPlan(tripPlanId) {
    return apiClient.patch(`/trip-plans/${tripPlanId}/soft-delete`);
  },

  // 여행 계획 상태 업데이트
  updateTripPlanStatus(tripPlanId, status) {
    return apiClient.patch(`/trip-plans/${tripPlanId}/status`, null, {
      params: { status }
    });
  },

  // 여러 여행 계획 일괄 삭제 (개별 삭제 API를 순차 호출)
  async deleteTripPlans(tripPlanIds) {
    const deletePromises = tripPlanIds.map(id => this.deleteTripPlan(id));
    return Promise.all(deletePromises);
  },

  // 여러 여행 계획 일괄 소프트 삭제
  async softDeleteTripPlans(tripPlanIds) {
    const deletePromises = tripPlanIds.map(id => this.softDeleteTripPlan(id));
    return Promise.all(deletePromises);
  }
};