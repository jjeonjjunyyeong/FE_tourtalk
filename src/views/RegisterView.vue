<template>
  <div class="register-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">회원가입</h2>

              <form @submit.prevent="register">
                <!-- 알림 메시지 -->
                <div v-if="message" :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']">
                  {{ message }}
                </div>

                <!-- 아이디 입력 -->
                <div class="mb-3">
                  <label for="userId" class="form-label">아이디 *</label>
                  <div class="input-group">
                    <input
                      type="text"
                      id="userId"
                      v-model="userData.id"
                      class="form-control"
                      placeholder="4~20자 영문, 숫자"
                      required
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="checkIdAvailability"
                      :disabled="loading || !userData.id"
                    >
                      중복확인
                    </button>
                  </div>
                  <div class="form-text" v-if="idChecked">
                    <i :class="['bi', idAvailable ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger']"></i>
                    {{ idAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.' }}
                  </div>
                </div>

                <!-- 비밀번호 입력 -->
                <div class="mb-3">
                  <label for="password" class="form-label">비밀번호 *</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      v-model="userData.password"
                      class="form-control"
                      placeholder="8~20자 영문, 숫자, 특수문자"
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
                  <div class="form-text" v-if="userData.password">
                    <i :class="['bi', isPasswordValid ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger']"></i>
                    {{ isPasswordValid ? '사용 가능한 비밀번호입니다.' : '8~20자 영문, 숫자, 특수문자를 포함해야 합니다.' }}
                  </div>
                </div>

                <!-- 비밀번호 확인 -->
                <div class="mb-3">
                  <label for="passwordConfirm" class="form-label">비밀번호 확인 *</label>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="passwordConfirm"
                    v-model="passwordConfirm"
                    class="form-control"
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  >
                  <div class="form-text" v-if="passwordConfirm">
                    <i :class="['bi', isPasswordMatch ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger']"></i>
                    {{ isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
                  </div>
                </div>

                <!-- 닉네임 입력 -->
                <div class="mb-3">
                  <label for="nickname" class="form-label">닉네임 *</label>
                  <input
                    type="text"
                    id="nickname"
                    v-model="userData.nickname"
                    class="form-control"
                    placeholder="닉네임을 입력하세요"
                    required
                  >
                </div>

                <!-- 이메일 입력 -->
                <div class="mb-3">
                  <label for="email" class="form-label">이메일 *</label>
                  <input
                    type="email"
                    id="email"
                    v-model="userData.email"
                    class="form-control"
                    placeholder="이메일을 입력하세요"
                    required
                  >
                </div>

                <!-- 전화번호 입력 -->
                <div class="mb-3">
                  <label for="phone" class="form-label">전화번호 *</label>
                  <input
                    type="tel"
                    id="phone"
                    v-model="userData.phone"
                    class="form-control"
                    placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                    required
                  >
                </div>

                <!-- 약관 동의 -->
                <div class="mb-4">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      v-model="agreeTerms"
                      class="form-check-input"
                      required
                    >
                    <label class="form-check-label" for="agreeTerms">
                      <span>개인정보 수집 및 이용에 동의합니다. *</span>
                      <a href="#" class="ms-1 small">(약관 보기)</a>
                    </label>
                  </div>
                </div>

                <!-- 회원가입 버튼 -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading || !isFormValid"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    회원가입
                  </button>
                </div>

                <!-- 로그인 링크 -->
                <div class="text-center mt-3">
                  <span class="text-muted">이미 계정이 있으신가요?</span>
                  <router-link to="/login" class="ms-2">로그인</router-link>
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
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth';

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter();

    // 회원가입 상태
    const loading = ref(false);
    const message = ref('');
    const messageType = ref('');
    const showPassword = ref(false);
    const passwordConfirm = ref('');
    const agreeTerms = ref(false);

    // 아이디 중복 체크
    const idChecked = ref(false);
    const idAvailable = ref(false);

    // 회원가입 폼 데이터
    const userData = reactive({
      id: '',
      password: '',
      nickname: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active'
    });

    // 비밀번호 유효성 검사
    const isPasswordValid = computed(() => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      return regex.test(userData.password);
    });

    // 비밀번호 일치 여부
    const isPasswordMatch = computed(() => {
      return userData.password === passwordConfirm.value;
    });

    // 폼 유효성 검사
    const isFormValid = computed(() => {
      return (
        userData.id &&
        userData.password &&
        passwordConfirm.value &&
        userData.nickname &&
        userData.email &&
        userData.phone &&
        isPasswordValid.value &&
        isPasswordMatch.value &&
        idAvailable.value &&
        agreeTerms.value
      );
    });

    // 비밀번호 표시 토글
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    // 아이디 중복 확인
    const checkIdAvailability = async () => {
      if (!userData.id) return;

      try {
        loading.value = true;

        // TODO: 실제 API 연동
        // const response = await authService.checkIdAvailability(userData.id);
        // idAvailable.value = response.data.available;

        // 임시 구현 (실제 서비스에서는 API 호출 필요)
        await new Promise(resolve => setTimeout(resolve, 500));
        idAvailable.value = true; // 임시로 항상 사용 가능하게 설정

        idChecked.value = true;
      } catch (error) {
        console.error('아이디 중복 확인 실패:', error);
        idAvailable.value = false;
      } finally {
        loading.value = false;
      }
    };

    // 회원가입 처리
    const register = async () => {
      if (!isFormValid.value) return;

      try {
        loading.value = true;
        message.value = '';

        // 회원 상세 정보
        const memberDetails = {
          email: userData.email,
          phone: userData.phone,
          gender: 'unknown',
          address: '',
          postalCode: '',
          birthDate: null,
          profileImgPath: null
        };

        // API 요청 데이터
        const requestData = {
          ...userData,
          memberDetails
        };

        const response = await authService.register(requestData);

        message.value = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.';
        messageType.value = 'success';

        // 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 2000);

      } catch (error) {
        console.error('회원가입 실패:', error);

        if (error.response && error.response.data) {
          message.value = error.response.data.message || '회원가입 처리 중 오류가 발생했습니다.';
        } else {
          message.value = '회원가입 처리 중 오류가 발생했습니다.';
        }

        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    return {
      userData,
      passwordConfirm,
      agreeTerms,
      loading,
      message,
      messageType,
      showPassword,
      idChecked,
      idAvailable,
      isPasswordValid,
      isPasswordMatch,
      isFormValid,
      register,
      togglePasswordVisibility,
      checkIdAvailability
    };
  }
};
</script>

<style scoped>
.register-view {
  padding: 2rem 0;
}
</style>
