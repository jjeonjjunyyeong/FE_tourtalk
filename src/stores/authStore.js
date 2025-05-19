import { defineStore } from 'pinia';
import authApi from '@/services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLogin: false,
    mno: null,
    id: '',
    nickname: '',
    role: '',
  }),

  actions: {
    async login(id, password) {
      try {
        const res = await authApi.login({ id, password });
        this.isLogin = true;
        this.mno = res.data.mno;
        this.id = res.data.id;
        this.nickname = res.data.nickname;
        this.role = res.data.role;
        return true;
      } catch (err) {
        console.error('로그인 실패:', err.response?.data || err.message);
        return false;
      }
    },

    async logout() {
      await authApi.logout();
      this.$reset(); // 상태 초기화
    },

    async checkLogin() {
      try {
        const res = await authApi.check();
        this.isLogin = true;
        this.mno = res.data.mno;
        this.id = res.data.id;
        this.nickname = res.data.nickname;
        this.role = res.data.role;
        return true;
      } catch (err) {
        this.$reset();
        return false;
      }
    },
  },
});
