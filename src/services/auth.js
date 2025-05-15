import apiClient from './api';

export default {
  // 사용자 로그인
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  // 사용자 등록
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },

  // 사용자 정보 가져오기
  getProfile() {
    return apiClient.get('/auth/profile');
  },

  // 로그아웃
  logout() {
    localStorage.removeItem('userToken');
    return Promise.resolve();
  },

  // 현재 로그인 상태 확인
  isLoggedIn() {
    return localStorage.getItem('userToken') !== null;
  }
};
