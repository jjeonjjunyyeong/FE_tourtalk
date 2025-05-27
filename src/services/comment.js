import apiClient from './api'

export default {
  // 댓글 목록 조회
  getComments(postId) {
    return apiClient.get(`/comments`, {
      params: { postId },
    })
  },

  // 댓글 작성
  writeComment(commentData) {
    return apiClient.post(`comments`, commentData)
  },

  // 댓글 수정
  modifyComment(commentData) {
    return apiClient.put(`comments`, commentData)
  },

  // 댓글 삭제
  softDeleteComment(commentId) {
    return apiClient.delete(`comments/${commentId}`)
  },

  // 마이페이지 : 내 댓글 조회
  getMyComments(writerId, page, size) {
    return apiClient.get('/comments/myComments', {
      params: { writerId, pageNumber: page, size },
    })
  },
}
