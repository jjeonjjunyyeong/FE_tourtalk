import apiClient from './api'

export default {
  // 시간대 별 예약인원 조회
  getReservationsByTime(productId) {
    return apiClient.get(`/tourBooking/product/${productId}/counts`)
  },
}
