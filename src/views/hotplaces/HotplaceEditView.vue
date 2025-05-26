<template>
  <div class="hotplace-edit-view">
    <div class="container">
      <h2 class="mb-4">핫플레이스 수정</h2>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
        <p class="mt-2">핫플레이스 정보를 불러오는 중입니다...</p>
      </div>

      <!-- 오류 상태 -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
        <div class="mt-3">
          <router-link to="/hotplaces/my" class="btn btn-outline-primary">
            내 핫플레이스로 돌아가기
          </router-link>
        </div>
      </div>

      <!-- 수정 폼 -->
      <hotplace-form
        v-else-if="hotplace"
        :hotplace="hotplace"
        :is-edit="true"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HotplaceForm from '@/components/hotplace/HotplaceForm.vue'
import hotplaceService from '@/services/hotplace'

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const hotplace = ref(null)
const loading = ref(true)
const error = ref(null)

// 핫플레이스 상세 정보 조회
const fetchHotplaceDetail = async () => {
  const hotplaceId = Number(props.id)
  if (isNaN(hotplaceId)) {
    error.value = '잘못된 핫플레이스 ID입니다.'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const { data } = await hotplaceService.getHotplaceDetail(hotplaceId)

    if (!data) {
      error.value = '핫플레이스 정보를 찾을 수 없습니다.'
      return
    }

    // 수정 권한 확인
    if (!data.isOwner) {
      error.value = '수정 권한이 없습니다.'
      return
    }

    hotplace.value = data
  } catch (err) {
    console.error('핫플레이스 상세 정보 조회 실패:', err)

    if (err.response?.status === 403) {
      error.value = '수정 권한이 없습니다.'
    } else if (err.response?.status === 404) {
      error.value = '존재하지 않는 핫플레이스입니다.'
    } else if (err.response?.status === 401) {
      error.value = '로그인이 필요합니다.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = '핫플레이스 정보를 불러오는데 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// 수정 폼 제출 처리
const handleSubmit = async (formData) => {
  try {
    const response = await hotplaceService.updateHotplace(hotplace.value.id, formData)

    alert('핫플레이스가 성공적으로 수정되었습니다!')

    // 수정된 핫플레이스 상세 페이지로 이동
    router.push(`/hotplaces/${hotplace.value.id}`)

  } catch (error) {
    console.error('핫플레이스 수정 실패:', error)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || '알 수 없는 오류가 발생했습니다.'

      switch (status) {
        case 400:
          alert(`잘못된 요청입니다: ${message}`)
          break
        case 401:
          alert('로그인이 필요합니다.')
          router.push('/login')
          break
        case 403:
          alert('수정 권한이 없습니다.')
          router.push('/hotplaces/my')
          break
        case 404:
          alert('존재하지 않는 핫플레이스입니다.')
          router.push('/hotplaces/my')
          break
        case 413:
          alert('업로드한 파일이 너무 큽니다. 파일 크기를 확인해주세요.')
          break
        default:
          alert(`오류가 발생했습니다 (${status}): ${message}`)
      }
    } else if (error.request) {
      alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.')
    } else {
      alert('요청 처리 중 오류가 발생했습니다.')
    }
  }
}

// 컴포넌트 마운트
onMounted(() => {
  fetchHotplaceDetail()
})
</script>

<style scoped>
.hotplace-edit-view {
  padding: 2rem 0;
}
</style>