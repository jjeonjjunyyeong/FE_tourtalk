<template>
  <div class="member-detail container py-5">
    <h2 class="text-center mb-5 fw-bold">회원 정보</h2>

    <div class="card shadow p-4 rounded-4">
      <div class="row">
        <!-- 왼쪽 : 프로필 + 아이디/닉네임 -->
        <div
          class="col-md-3 d-flex flex-column align-items-center justify-content-start border-end"
        >
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

          <div class="info-box w-100 text-center">
            <label>아이디</label>
            <div class="info-value">{{ member.id }}</div>
          </div>
          <div class="info-box w-100 text-center">
            <label>닉네임</label>
            <div class="info-value">{{ member.nickname }}</div>
          </div>
        </div>

        <!-- 가운데 -->
        <div class="col-md-5 border-end">
          <div class="info-box" v-for="(label, key) in centerFields" :key="key">
            <label>{{ label }}</label>
            <div class="info-value">{{ formatField(key) }}</div>
          </div>
        </div>

        <!-- 오른쪽 -->
        <div class="col-md-4">
          <div class="info-box" v-for="(label, key) in rightFields" :key="key">
            <label>{{ label }}</label>
            <div class="info-value">{{ formatField(key) }}</div>
          </div>

          <div v-if="member.role === 'CURATOR'" class="info-box">
            <label>자격증 번호</label>
            <div class="info-value">{{ member.curatorNo }}</div>
          </div>

          <div v-if="member.role === 'CURATOR'" class="info-box">
            <label>자격증 이미지</label>
            <div class="info-value text-center">
              <img
                :src="`${apiBase}/${member.curatorImg}`"
                alt="자격증"
                class="img-thumbnail"
                style="max-width: 140px"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 수정 버튼 -->
      <div class="text-end mt-4">
        <button class="btn btn-outline-primary" @click="goToEdit">정보 수정</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import memberService from '@/services/member'
import fileService from '@/services/file'

const router = useRouter()
const apiBase = __API_BASE_URL__

const member = ref({})

const centerFields = {
  email: '이메일',
  phone: '전화번호',
  gender: '성별',
  birthDate: '생년월일',
}

const rightFields = {
  address: '주소',
  role: '등급',
  status: '상태',
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

// 프로필 이미지 업로드 처리
const handleProfileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const type = 'members'

  try {
    // 업로드 요청
    const result = await fileService.upload(file, type)
    const filePath = result.filePath

    // DB 저장 요청
    await memberService.updateProfileImg(filePath)

    // 화면 갱신
    member.value.profileImgPath = filePath
    alert('프로필 이미지가 업로드 및 저장되었습니다.')
  } catch (err) {
    alert('업로드에 실패했습니다.')
  }
}

onMounted(async () => {
  try {
    const response = await memberService.getMyInfo()
    member.value = response.data
  } catch (err) {
    alert('회원 정보를 불러오는 데 실패했습니다.')
  }
})

const goToEdit = () => {
  router.push('/member/edit')
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

/* 빈 이미지 공간 고정 */
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
</style>
