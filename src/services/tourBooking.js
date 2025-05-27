import apiClient from './api'

export default {
  // 시간대 별 예약인원 조회
  getReservationsByTime(productId) {
    return apiClient.get(`/tourBooking/product/${productId}/counts`)
  },
  // 예약 생성
  createBooking(request) {
    return apiClient.post('/tourBooking', request)
  },
  // 사용자 예약 정보 가져오기
  getMyBookings() {
    return apiClient.get(`/tourBooking/member`)
  },
  // 마이페이지에서 예약한 상품 결제
  confirmPayment(bookingId) {
    return apiClient.put(`/tourBooking/${bookingId}/pay`)
  },
  // 예약 취소
  cancelBooking(bookingId) {
    return apiClient.put(`/tourBooking/${bookingId}/cancel`)
  },
}
