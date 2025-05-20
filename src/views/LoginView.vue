<template>
  <div class="login-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">로그인</h2>

              <form @submit.prevent="login">
                <!-- 알림 메시지 -->
                <div v-if="message" :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']">
                  {{ message }}
                </div>

                <!-- 아이디 입력 -->
                <div class="mb-3">
                  <label for="userId" class="form-label">아이디</label>
                  <input
                    type="text"
                    id="userId"
                    v-model="credentials.id"
                    class="form-control"
                    placeholder="아이디를 입력하세요"
                    required
                  >
                </div>

                <!-- 비밀번호 입력 -->
                <div class="mb-4">
                  <label for="password" class="form-label">비밀번호</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      v-model="credentials.password"
                      class="form-control"
                      placeholder="비밀번호를 입력하세요"
                      required
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="togglePasswordVisibility"
                    >
                      <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
                    </button>
                  </div>
                </div>

                <!-- 로그인 버튼 -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    로그인
                  </button>
                </div>

                <!-- 회원가입 링크 -->
                <div class="text-center mt-3">
                  <span class="text-muted">계정이 없으신가요?</span>
                  <router-link to="/register" class="ms-2">회원가입</router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'LoginView',
  setup() {
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

    // 로그인 상태
    const loading = ref(false);
    const message = ref('');
    const messageType = ref('');
    const showPassword = ref(false);

    // 로그인 폼 데이터
    const credentials = reactive({
      id: '',
      password: ''
    });

    // 비밀번호 표시 토글
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    // 로그인 처리
    const login = async () => {
      try {
        loading.value = true;
        message.value = '';

        const success = await authStore.login(credentials.id, credentials.password);
        if (success) {
            const redirectPath = route.query.redirect || '/';
            router.push(redirectPath);
          } else {
            message.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
            messageType.value = 'error';
          }
        loading.value = false;
      } catch (error) {
        console.error('로그인 실패:', error);

        if (error.response && error.response.status === 401) {
          message.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
        } else {
          message.value = '로그인 처리 중 오류가 발생했습니다.';
        }

        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      loading,
      message,
      messageType,
      showPassword,
      login,
      togglePasswordVisibility
    };
  }
};
</script>

<style scoped>
.login-view {
  display: flex;
  min-height: calc(100vh - 200px);
  align-items: center;
  padding: 2rem 0;
}
</style>
