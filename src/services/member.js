import apiClient from "./api";

export default {
    // 회원 가입
    regist(userData) {
        return apiClient.post('/member', userData)
    },

    // 아이디 중복 확인
    checkIdAvailability(id) {
    return apiClient.get(`/member/check`, { params: { id } });
    }

}