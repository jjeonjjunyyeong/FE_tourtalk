// 이거 지워야됨
// import apiClient from './api';

// export default {
//   // QnA 게시글 목록 조회 (페이지네이션, 검색 조건 적용)
//   getQnaList(searchCondition) {
//     return apiClient.get('/boards', { params: searchCondition });
//   },

//   // QnA 게시글 상세 조회
//   getQnaDetail(postId) {
//     return apiClient.get(`/boards/${postId}`);
//   },

//   // QnA 게시글 등록
//   createQna(boardData) {
//     return apiClient.post('/boards', boardData);
//   },

//   // QnA 게시글 수정
//   updateQna(postId, boardData) {
//     return apiClient.put(`/boards/${postId}`, boardData);
//   }
// };