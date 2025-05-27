<template>
  <div class="member-detail container-fluid py-5">
    <h2 class="text-center mb-5 fw-bold">회원 정보</h2>

    <div class="card shadow p-4 rounded-4 mx-auto" style="max-width: 1000px">
      <div class="d-flex gap-5">
        <!-- 왼쪽 프로필 -->
        <div class="profile-section d-flex flex-column align-items-center border-end pe-4">
          <div class="profile-wrapper mb-3">
            <img
              v-if="member.profileImgPath"
              :src="`${apiBase}/${member.profileImgPath}`"
              alt="프로필"
              class="rounded-circle border"
            />
            <div v-else class="placeholder-img rounded-circle border"></div>
          </div>

          <input
            type="file"
            @change="handleProfileUpload"
            accept="image/*"
            class="form-control form-control-sm mb-3"
            style="width: 90%"
          />

          <div class="info-box text-center w-100">
            <label>아이디</label>
            <div class="info-value">{{ member.id }}</div>
          </div>
          <div class="info-box w-100 text-center">
            <label>닉네임</label>
            <div class="info-value">
              <template v-if="isEditable('nickname') && isEditMode">
                <input type="text" v-model="member.nickname" class="form-control text-center" />
              </template>
              <template v-else>
                {{ member.nickname }}
              </template>
            </div>
          </div>
        </div>

        <!-- 오른쪽 정보 -->
        <div class="info-section flex-grow-1">
          <div class="info-grid">
            <div class="info-box" v-for="(label, key) in allFields" :key="key">
              <label>{{ label }}</label>
              <div class="info-value">
                <template v-if="isEditable(key)">
                  <template v-if="isEditMode">
                    <template v-if="key === 'gender'">
                      <select v-model="member[key]" class="form-select">
                        <option value="MAN">남자</option>
                        <option value="WOMAN">여자</option>
                        <option value="UNKNOWN">비공개</option>
                      </select>
                    </template>
                    <template v-else-if="key === 'birthDate'">
                      <input type="date" v-model="member[key]" class="form-control" />
                    </template>
                    <template v-else>
                      <input type="text" v-model="member[key]" class="form-control" />
                    </template>
                  </template>
                  <template v-else>
                    {{ formatField(key) }}
                  </template>
                </template>
                <template v-else>
                  {{ formatField(key) }}
                </template>
              </div>
            </div>

            <!-- 자격증 이미지 -->
            <div v-if="member.role === 'CURATOR'" class="info-box">
              <label>자격증 이미지</label>
              <div class="info-value">
                <template v-if="isEditMode">
                  <input
                    type="file"
                    @change="handleCuratorImgUpload"
                    accept="image/*"
                    class="form-control"
                  />
                </template>
                <template v-else>
                  <img
                    :src="`${apiBase}/${member.curatorImg}`"
                    alt="자격증"
                    class="img-thumbnail"
                    style="max-width: 140px"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="text-end mt-4 d-flex justify-content-end gap-2">
        <template v-if="isEditMode">
          <button class="btn btn-secondary" @click="cancelEdit">취소</button>
          <button class="btn btn-primary" @click="saveEdit">저장</button>
        </template>
        <template v-else>
          <button class="btn btn-outline-primary" @click="enterEditMode">정보 수정</button>
          <button class="btn btn-outline-danger" @click="toggleWithdrawInput">회원 탈퇴</button>
        </template>
      </div>

      <!-- 탈퇴 입력창 (조건부 노출) -->
      <div v-if="showWithdrawInput" class="mt-3">
        <label for="withdraw-password" class="form-label">비밀번호 확인 후 탈퇴</label>
        <div class="d-flex gap-2">
          <input
            type="password"
            id="withdraw-password"
            v-model="withdrawPassword"
            class="form-control"
            placeholder="비밀번호 입력"
          />
          <button class="btn btn-danger" @click="withdrawMember">탈퇴하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import memberService from '@/services/member'
import fileService from '@/services/file'
import auth from '@/services/auth'

const apiBase = __API_BASE_URL__
const member = ref({})
const isEditMode = ref(false)

const allFields = {
  email: '이메일',
  phone: '전화번호',
  gender: '성별',
  birthDate: '생년월일',
  address: '주소',
  role: '등급',
  status: '상태',
  curatorNo: '자격증 번호',
}

const editableFieldsByRole = {
  USER: ['nickname', 'phone', 'gender', 'birthDate', 'address'],
  CURATOR: ['nickname', 'phone', 'gender', 'birthDate', 'address', 'curatorNo'],
}

const isEditable = (key) => {
  const role = member.value.role
  return editableFieldsByRole[role]?.includes(key)
}

const formatField = (key) => {
  const val = member.value[key]
  if (!val) return ''
  switch (key) {
    case 'phone':
      return val.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
    case 'birthDate':
      return val.substring(0, 10)
    case 'gender':
      return val === 'MAN' ? '남자' : val === 'WOMAN' ? '여자' : '비공개'
    case 'role':
      return val === 'CURATOR' ? '학예사' : val === 'ADMIN' ? '관리자' : '일반회원'
    case 'status':
      return val === 'ACTIVE'
        ? '정상'
        : val === 'SUSPENDED'
        ? '정지'
        : val === 'PENDING'
        ? '승인 대기'
        : '탈퇴'
    default:
      return val
  }
}

const enterEditMode = () => {
  isEditMode.value = true
}
const cancelEdit = () => {
  isEditMode.value = false
}
const saveEdit = async () => {
  try {
    await memberService.updateMember(member.value)
    isEditMode.value = false
    alert('회원 정보가 수정되었습니다.')
  } catch (e) {
    alert('정보 수정에 실패했습니다.')
  }
}

const handleProfileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    const result = await fileService.upload(file, 'members')
    await memberService.updateProfileImg(result.filePath)
    member.value.profileImgPath = result.filePath
  } catch (err) {
    alert('프로필 업로드 실패')
  }
}

const handleCuratorImgUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    const result = await fileService.upload(file, 'curators')
    member.value.curatorImg = result.filePath
  } catch (err) {
    alert('자격증 이미지 업로드 실패')
  }
}

onMounted(async () => {
  const res = await memberService.getMyInfo()
  member.value = res.data
})

const showWithdrawInput = ref(false)
const withdrawPassword = ref('')

const toggleWithdrawInput = () => {
  showWithdrawInput.value = !showWithdrawInput.value
}

const withdrawMember = async () => {
  if (!withdrawPassword.value) {
    alert('비밀번호를 입력해주세요.')
    return
  }
  try {
    await memberService.softDelete({
      mno: member.value.mno,
      password: withdrawPassword.value,
    })
    alert('회원 탈퇴가 완료되었습니다.')
    auth.logout()
    window.location.href = '/' // 또는 router.push('/')
  } catch (e) {
    alert('비밀번호가 일치하지 않거나 탈퇴에 실패했습니다.')
  }
}
</script>

<style scoped>
.profile-wrapper {
  width: 140px;
  height: 140px;
}
.profile-wrapper img,
.placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-img {
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-box {
  margin-bottom: 1rem;
}
.info-box label {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.4rem;
  display: block;
}
.info-value {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  color: #212529;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 2rem;
}
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
