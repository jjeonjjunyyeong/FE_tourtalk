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
  // 게시글 목록 조회 (검색 + 페이징)
  getBoardList(params) {
    return apiClient.get('/admin/boards', { params })
  },
  // 게시글 상태 변경
  updateBoard(postId, updateRequest) {
    return apiClient.patch(`/admin/boards/${postId}`, updateRequest)
},
  // 게시글 상세 정보 조회
  getBoardDetail(postId) {
    return apiClient.get(`/admin/boards/${postId}`)
  },
}
