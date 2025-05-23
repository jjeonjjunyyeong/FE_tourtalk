import apiClient from './api'

export default {
  // 게시글 검색 조회 (페이지네이션, 검색 조건 적용)
  getBoardSearch(params) {
    return apiClient.get('/boards/search', { params })
  },

  // 게시글 전체 목록 조회 (페이지네이션 적용)
  getBoardList(params) {
    return apiClient.get('/boards/list', { params })
  },

  // 게시글 상세 조회
  getBoardDetail(postId) {
    return apiClient.get(`/boards/${postId}`)
  },

  // 게시글 등록
  createBoard(boardData) {
    return apiClient.post('/boards', boardData)
  },

  // 게시글 수정
  updateBoard(boardData) {
    return apiClient.put(`/boards`, boardData)
  },

  // 게시글 삭제
  softDeleteBoard(postId) {
    return apiClient.delete(`/boards/${postId}`)
  },

  // 본인이 작성한 게시글 전체 조회
  getMyPosts(writerId, page, size) {
    return apiClient.get('/boards/myPosts', {
      params: {
        writerId,
        pageNumber: page,
        size,
      },
    })
  },
}
