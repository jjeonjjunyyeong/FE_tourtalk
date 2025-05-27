import apiClient from './api'

export default {
  // 상품 등록
  createProduct(productData) {
    return apiClient.post('/tourProduct', productData)
  },

  // 상품 수정
  modifyProduct(productData) {
    return apiClient.put('/tourProduct', productData)
  },

  // 상품 삭제
  softDeleteProduct(productId) {
    return apiClient.delete(`/tourProduct/${productId}`)
  },

  // 특정 큐레이터의 상품 전체 조회
  selectAllProductByCurator(mno) {
    return apiClient.get(`/tourProduct?mno=${mno}`)
  },
}
