import apiClient from './api'

export default {
  // 상품 등록
  createProduct(productData) {
    return apiClient.post('/tourProduct', productData)
  },

  // 상품 수정
  updateProduct(productId, productData) {
    return apiClient.put(`/tourProduct/${productId}`, productData)
  },

  // 상품 삭제
  softDeleteProduct(productId) {
    return apiClient.delete(`/tourProduct/${productId}/deleted`)
  },

  // 큐레이터의 상품 조회
  getMyProducts() {
    return apiClient.get(`/tourProduct/curator/products`)
  },

  // 상품 상세 조회
  getProductById(productId) {
    return apiClient.get(`/tourProduct/products/${productId}`)
  },
  // 예약 페이지 진입 시 상품 목록(모집 중인) 조회
  searchAvailableProducts(params) {
    return apiClient.get(`/tourProduct/available`, { params })
  },
  // 관광지 이름 가져오기
  getLocationById(locationNo) {
    return apiClient.get(`/tourProduct/locations/${locationNo}`)
  },
}
