<template>
  <div class="register-view container py-5">
    <div class="card shadow">
      <div class="card-body p-5">
        <h2 class="text-center mb-4">회원가입</h2>

        <form @submit.prevent="register">
          <!-- 알림 메시지 -->
          <div
            v-if="message"
            :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']"
          >
            {{ message }}
          </div>

          <div class="row">
            <!-- 왼쪽 컬럼 -->
            <div class="col-md-6">
              <!-- 아이디 -->
              <div class="mb-3">
                <label for="userId" class="form-label">아이디 *</label>
                <div class="input-group">
                  <input
                    type="text"
                    id="userId"
                    v-model="curatorData.id"
                    class="form-control"
                    placeholder="4~20자 영문, 숫자"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="checkIdAvailability"
                    :disabled="loading || !curatorData.id"
                  >
                    중복확인
                  </button>
                </div>
                <div class="form-text" v-if="idChecked">
                  <i
                    :class="[
                      'bi',
                      idAvailable
                        ? 'bi-check-circle-fill text-success'
                        : 'bi-x-circle-fill text-danger',
                    ]"
                  ></i>
                  {{ idAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.' }}
                </div>
              </div>

              <!-- 비밀번호 -->
              <div class="mb-3">
                <label for="password" class="form-label">비밀번호 *</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="curatorData.password"
                    class="form-control"
                    placeholder="8~20자 영문, 숫자, 특수문자"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="togglePasswordVisibility"
                  >
                    <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
                  </button>
                </div>
                <div class="form-text" v-if="curatorData.password">
                  <i
                    :class="[
                      'bi',
                      isPasswordValid
                        ? 'bi-check-circle-fill text-success'
                        : 'bi-x-circle-fill text-danger',
                    ]"
                  ></i>
                  {{
                    isPasswordValid
                      ? '사용 가능한 비밀번호입니다.'
                      : '8~20자 영문, 숫자, 특수문자를 포함해야 합니다.'
                  }}
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
                />
                <div class="form-text" v-if="passwordConfirm">
                  <i
                    :class="[
                      'bi',
                      isPasswordMatch
                        ? 'bi-check-circle-fill text-success'
                        : 'bi-x-circle-fill text-danger',
                    ]"
                  ></i>
                  {{ isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
                </div>
              </div>

              <!-- 닉네임 -->
              <div class="mb-3">
                <label for="nickname" class="form-label">닉네임 *</label>
                <input
                  type="text"
                  id="nickname"
                  v-model="curatorData.nickname"
                  class="form-control"
                  required
                />
              </div>

              <!-- 성별 -->
              <div class="mb-3">
                <label for="gender" class="form-label">성별 *</label>
                <select id="gender" class="form-select" v-model="curatorData.gender" required>
                  <option value="UNKNOWN">비공개</option>
                  <option value="MAN">남자</option>
                  <option value="WOMAN">여자</option>
                </select>
              </div>

              <!-- 생년월일 -->
              <div class="mb-3">
                <label for="birthDate" class="form-label">생년월일</label>
                <input
                  type="date"
                  id="birthDate"
                  class="form-control"
                  v-model="curatorData.birthDate"
                />
              </div>
            </div>

            <!-- 오른쪽 컬럼 -->
            <div class="col-md-6">
              <!-- 이메일 -->
              <div class="mb-3">
                <label for="email" class="form-label">이메일 *</label>
                <input
                  type="email"
                  id="email"
                  v-model="curatorData.email"
                  class="form-control"
                  required
                />
              </div>

              <!-- 전화번호 -->
              <div class="mb-3">
                <label for="phone" class="form-label">전화번호 *</label>
                <input
                  type="tel"
                  id="phone"
                  v-model="curatorData.phone"
                  class="form-control"
                  placeholder="010-0000-0000"
                  required
                />
              </div>

              <!-- 자격증 번호 -->
              <div class="mb-3">
                <label for="curatorNo" class="form-label">자격증 번호 *</label>
                <input
                  type="text"
                  id="curatorNo"
                  v-model="curatorData.curatorNo"
                  class="form-control"
                  required
                />
              </div>

              <!-- 자격증 이미지 업로드 -->
              <div class="mb-3">
                <label for="curatorImg" class="form-label">자격증 이미지 파일 *</label>
                <input
                  type="file"
                  id="curatorImg"
                  class="form-control"
                  accept="image/*"
                  @change="handleImageUpload"
                  required
                />
              </div>

              <!-- 주소 -->
              <div class="mb-3">
                <label class="form-label">주소 *</label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    v-model="curatorData.postalCode"
                    placeholder="우편번호"
                    readonly
                  />
                  <button type="button" class="btn btn-outline-secondary" @click="openPostcode">
                    주소 검색
                  </button>
                </div>
                <input
                  type="text"
                  class="form-control mt-2"
                  v-model="curatorData.addressMain"
                  placeholder="기본 주소"
                  readonly
                />
                <input
                  type="text"
                  class="form-control mt-2"
                  v-model="curatorData.addressDetail"
                  placeholder="상세 주소 입력"
                />
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
                  />
                  <label class="form-check-label" for="agreeTerms">
                    개인정보 수집 및 이용에 동의합니다. *
                    <a href="#" class="ms-1 small">(약관 보기)</a>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 회원가입 버튼 -->
          <div class="d-grid gap-2">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              :disabled="loading || !isFormValid"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
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

  <BaseModal
    :visible="showModal"
    :message="modalMessage"
    :mode="modalMode"
    @close="
      () => {
        showModal = false
        if (modalMessage.includes('회원가입 완료')) {
          router.push('/login')
        }
      }
    "
  />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import memberService from '@/services/member'
import fileService from '@/services/file'
import BaseModal from '@/components/BaseModal.vue'

// 모달 관련 설정
const showModal = ref(false)
const modalMessage = ref('')
const modalMode = ref('alert')
const openModal = (msg, mode = 'alert') => {
  modalMessage.value = msg
  modalMode.value = mode
  showModal.value = true
}

// 라우터
const router = useRouter()

// 상태 변수들
const loading = ref(false)
const message = ref('')
const messageType = ref('')
const showPassword = ref(false)
const passwordConfirm = ref('')
const agreeTerms = ref(false)

const idChecked = ref(false)
const idAvailable = ref(false)

// 회원가입 폼 데이터
const curatorData = reactive({
  id: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  curatorNo: '',
  curatorImg: '',
  gender: '',
  postalCode: '',
  addressMain: '', // 도로명/지번주소
  addressDetail: '', // 상세 주소
  address: '', // 서버로 보낼 최종 주소
  birthDate: null,
  role: 'CURATOR',
  status: 'PENDING',
})

// 이미지 업로드 핸들링
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const type = 'curators'

  try {
    const result = await fileService.upload(file, type)
    curatorData.curatorImg = result.filePath
    openModal('이미지 업로드 성공')
  } catch (err) {
    console.error('이미지 업로드 실패', err)
    curatorData.curatorImg = ''
    openModal('이미지 업로드에 실패했습니다.')
  }
}

// 다음 주소 API 연동
const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: function (data) {
      curatorData.postalCode = data.zonecode
      curatorData.addressMain = data.roadAddress || data.jibunAddress
    },
  }).open()
}

// 비밀번호 유효성 검사
const isPasswordValid = computed(() => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/
  return regex.test(curatorData.password)
})

// 비밀번호 일치 여부
const isPasswordMatch = computed(() => curatorData.password === passwordConfirm.value)

// 전체 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    curatorData.id &&
    curatorData.password &&
    passwordConfirm.value &&
    curatorData.nickname &&
    curatorData.email &&
    curatorData.phone &&
    curatorData.curatorNo &&
    curatorData.curatorImg &&
    isPasswordValid.value &&
    isPasswordMatch.value &&
    idAvailable.value &&
    agreeTerms.value
  )
})

// 비밀번호 표시 토글
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 아이디 중복 확인
const checkIdAvailability = async () => {
  if (!curatorData.id) return
  try {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 300))
    const result = await memberService.checkIdAvailability(curatorData.id)
    idAvailable.value = result.data.available
    idChecked.value = true
  } catch (err) {
    idAvailable.value = false
    idChecked.value = true
  } finally {
    loading.value = false
  }
}

// 회원가입 처리
const register = async () => {
  if (!isFormValid.value) return
  try {
    loading.value = true
    message.value = ''

    // 주소 결합
    curatorData.address = `${curatorData.addressMain} ${curatorData.addressDetail}`.trim()

    await memberService.regist({ ...curatorData })

    message.value = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.'
    messageType.value = 'success'

    openModal('회원가입 완료! 로그인 페이지로 이동합니다.', 'alert')
  } catch (err) {
    console.error('회원가입 실패:', err)
    openModal(err.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.', 'alert')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-view {
  padding: 2rem 0;
}
</style>
