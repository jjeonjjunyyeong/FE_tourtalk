import apiClient from './api'

export default {
  // 회원 가입
  regist(userData) {
    return apiClient.post('/member', userData)
  },

  // 아이디 중복 확인
  checkIdAvailability(id) {
    return apiClient.get(`/member/checkId`, { params: { id } })
  },

  // 상세 정보 조회(본인)
  getMyInfo() {
    return apiClient.get('/member/me') // JWT 기반 로그인 상태에서 자신의 정보
  },

  // 프로필 이미지 업로드
  updateProfileImg(profileImgPath) {
    return apiClient.put('/member/profile-img', null, {
      params: { profileImgPath },
    })
  },
}
