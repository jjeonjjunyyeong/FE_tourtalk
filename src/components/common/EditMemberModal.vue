<template>
  <div class="modal fade show d-block bg-dark bg-opacity-50" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content p-4">
        <div class="modal-header">
          <h5 class="modal-title">회원 정보 수정</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">아이디</label>
              <input type="text" class="form-control" v-model="form.id" disabled />
            </div>

            <div class="col-md-6">
              <label class="form-label">닉네임</label>
              <input type="text" class="form-control" v-model="form.nickname" />
            </div>

            <div class="col-md-6">
              <label class="form-label">이메일</label>
              <input type="email" class="form-control" v-model="form.email" />
            </div>

            <div class="col-md-6">
              <label class="form-label">전화번호</label>
              <input type="text" class="form-control" v-model="form.phone" />
            </div>

            <div class="col-md-6">
              <label class="form-label">성별</label>
              <select v-model="form.gender" class="form-select">
                <option value="UNKNOWN">비공개</option>
                <option value="MAN">남자</option>
                <option value="WOMAN">여자</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">상태</label>
              <select v-model="form.status" class="form-select">
                <option value="ACTIVE">정상 활동</option>
                <option value="SUSPENDED">일시 정지</option>
                <option value="PENDING">승인 대기</option>
                <option value="DELETED">탈퇴</option>
              </select>
            </div>

            <div v-if="form.role === 'CURATOR'" class="col-12">
              <label class="form-label">자격증 이미지</label>
              <div v-if="form.curatorImg" class="mb-3">
                <img
                  :src="`${apiBase}/${form.curatorImg}`"
                  alt="자격증 이미지"
                  class="img-fluid rounded border"
                  style="max-width: 300px"
                />
              </div>
              <div v-else class="text-muted mb-3">이미지 없음</div>
              <label class="form-label">자격증 번호</label>
              <input type="text" class="form-control mb-3" v-model="form.curatorNo" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">닫기</button>
          <button class="btn btn-primary" @click="save">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminMemberService from '@/services/admin'

const apiBase = import.meta.env.VITE_API_BASE_URL
const props = defineProps({ mno: Number })
const emit = defineEmits(['close'])

const form = ref({
  id: '',
  nickname: '',
  email: '',
  phone: '',
  gender: '',
  status: '',
  role: '',
  curatorNo: '',
  curatorImg: '',
})

const fetchDetail = async () => {
  try {
    const res = await adminMemberService.getMemberDetail(props.mno)
    const m = res.data

    console.log('🔍 회원 정보:', m) // 응답 전체 확인
    console.log('📄 자격증 이미지 경로:', m.curatorImg) // 이미지 경로 확인

    form.value = {
      id: m.id,
      nickname: m.nickname,
      email: m.email,
      phone: m.phone,
      gender: m.gender,
      status: m.status,
      role: m.role,
      curatorNo: m.curatorNo || '',
      curatorImg: m.curatorImg || '',
    }
  } catch (err) {
    alert('회원 정보를 불러오는 데 실패했습니다.')
    emit('close')
  }
}

const save = async () => {
  try {
    await adminMemberService.updateMember(props.mno, form.value)
    alert('회원 정보가 수정되었습니다.')
    emit('close')
  } catch (err) {
    alert('수정에 실패했습니다.')
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.modal {
  display: block;
  z-index: 1050;
}
</style>
