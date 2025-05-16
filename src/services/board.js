import apiClient from './api';

export default {
  // 게시글 목록 조회 (페이지네이션, 검색 조건 적용)
  getBoardList(searchCondition) {
    return apiClient.get('/boards', { params: searchCondition });
  },

  // 게시글 상세 조회
  getBoardDetail(postId) {
    return apiClient.get(`/boards/${postId}`);
  },

  // 게시글 등록
  createBoard(boardData) {
    return apiClient.post('/boards', boardData);
  },

  // 게시글 수정
  updateBoard(postId, boardData) {
    return apiClient.put(`/boards/${postId}`, boardData);
  },

  deleteBoard(postId){
    return apiClient.delete(`/boards/${postId}`);
  }

};