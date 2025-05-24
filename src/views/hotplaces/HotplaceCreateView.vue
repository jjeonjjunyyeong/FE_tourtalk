<template>
  <div class="hotplace-create-view">
    <div class="container">
      <h2 class="mb-4">핫플레이스 등록</h2>

      <hotplace-form @submit="handleSubmit" />
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import HotplaceForm from '@/components/hotplace/HotplaceForm.vue';
import hotplaceService from '@/services/hotplace';

export default {
  name: 'HotplaceCreateView',
  components: {
    HotplaceForm
  },
  setup() {
    const router = useRouter();

    const handleSubmit = async (formData) => {
      try {
        const response = await hotplaceService.createHotplace(formData);

        alert('핫플레이스가 성공적으로 등록되었습니다!');

        // 등록된 핫플레이스 상세 페이지로 이동
        router.push(`/hotplaces/${response.data.id}`);

      } catch (error) {
        console.error('핫플레이스 등록 실패:', error);

        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || '알 수 없는 오류가 발생했습니다.';

          switch (status) {
            case 400:
              alert(`잘못된 요청입니다: ${message}`);
              break;
            case 401:
              alert('로그인이 필요합니다.');
              router.push('/login');
              break;
            case 413:
              alert('업로드한 파일이 너무 큽니다. 파일 크기를 확인해주세요.');
              break;
            default:
              alert(`오류가 발생했습니다 (${status}): ${message}`);
          }
        } else if (error.request) {
          alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
        } else {
          alert('요청 처리 중 오류가 발생했습니다.');
        }
      }
    };

    return {
      handleSubmit
    };
  }
};
</script>

<style scoped>
.hotplace-create-view {
  padding: 2rem 0;
}
</style>
