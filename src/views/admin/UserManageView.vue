<template>
  <div class="container py-5">
    <h3 class="fw-bold text-center mb-4">회원 관리</h3>

    <!-- 필터 영역 -->
    <div class="d-flex gap-3 mb-3">
      <input
        v-model="search.keyword"
        type="text"
        class="form-control"
        placeholder="아이디 또는 닉네임"
      />
      <select v-model="search.role" class="form-select">
        <option value="">전체 역할</option>
        <option value="USER">일반회원</option>
        <option value="CURATOR">큐레이터</option>
      </select>
      <select v-model="search.status" class="form-select">
        <option value="">전체 상태</option>
        <option value="ACTIVE">정상</option>
        <option value="SUSPENDED">정지</option>
        <option value="PENDING">대기</option>
        <option value="DELETED">탈퇴</option>
      </select>
      <button @click="fetchMembers" class="btn btn-primary">검색</button>
    </div>

    <!-- 목록 -->
    <table class="table table-bordered text-center align-middle">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>아이디</th>
          <th>닉네임</th>
          <th>역할</th>
          <th>상태</th>
          <th>이메일</th>
          <th>전화번호</th>
          <th>수정</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.mno">
          <td>{{ member.mno }}</td>
          <td>{{ member.id }}</td>
          <td>{{ member.nickname }}</td>
          <td>{{ getRoleLabel(member.role) }}</td>
          <td>{{ getStatusLabel(member.status) }}</td>
          <td>{{ member.email }}</td>
          <td>{{ formatPhone(member.phone) }}</td>
          <td>
            <button
              v-if="['USER', 'CURATOR'].includes(member.role)"
              class="btn btn-sm btn-outline-info"
              @click="openEditModal(member.mno)"
            >
              수정
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <nav class="d-flex justify-content-center mt-4">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(page - 1)">이전</a>
        </li>
        <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: page === p }">
          <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
        </li>
        <li class="page-item" :class="{ disabled: page === totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(page + 1)">다음</a>
        </li>
      </ul>
    </nav>

    <!-- 회원 수정 모달 (작성 예정) -->
    <EditMemberModal v-if="selectedMno" :mno="selectedMno" @close="handleClose" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminMemberService from '@/services/admin'
import EditMemberModal from '@/components/common/EditMemberModal.vue'

const members = ref([])
const page = ref(1)
const size = 10
const totalPages = ref(1)
const selectedMno = ref(null)

const search = ref({
  keyword: '',
  role: '',
  status: '',
})

const getRoleLabel = (role) => {
  switch (role) {
    case 'USER':
      return '일반회원'
    case 'CURATOR':
      return '큐레이터'
    case 'ADMIN':
      return '관리자'
    default:
      return role
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '정상'
    case 'SUSPENDED':
      return '정지'
    case 'PENDING':
      return '대기'
    case 'DELETED':
      return '탈퇴'
    default:
      return status
  }
}

const formatPhone = (phone) => {
  if (!phone) return ''
  // 01012345678 -> 010-1234-5678
  return phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
}

const fetchMembers = async () => {
  const res = await adminMemberService.getMembers({ ...search.value, pageNumber: page.value, size })
  members.value = res.data.content
  totalPages.value = res.data.totalPages
}

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
    fetchMembers()
  }
}

const openEditModal = (mno) => {
  selectedMno.value = mno
}

const handleClose = () => {
  selectedMno.value = null
  fetchMembers()
}

onMounted(fetchMembers)
</script>
