import apiClient from './api'

export default {
  // 사용자 로그인
  login({ id, password }) {
    return apiClient.post('/auth/login', null, {
      params: { id, password },
    })
  },

  // 로그아웃
  logout() {
    return apiClient.post('/auth/logout')
  },

  // 현재 로그인 상태 확인
  check() {
    return apiClient.get('/auth/check')
  },
}
