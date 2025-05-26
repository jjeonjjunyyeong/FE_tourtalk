import apiClient from './api'

export default {
  // 전체 회원 정보 조회
  getMembers(params) {
    return apiClient.get('/admin/members', { params }) // page, size, role, status 등 전달
  },
  // 상세 회원 정보 조회
  getMemberDetail(mno) {
    return apiClient.get(`/admin/members/${mno}`)
  },
  // 회원 정보 수정
  updateMember(mno, payload) {
    return apiClient.put(`/admin/members/${mno}`, payload)
  },
  // 회원 상태 수정
  updateStatus(mno, status) {
    return apiClient.patch(`/admin/members/${mno}/status`, { status })
  },
}
