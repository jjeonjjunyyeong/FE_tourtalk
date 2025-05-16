<template>
  <div class="board-write-view">
    <div class="container">
      <h2 class="mb-4">{{ isEdit ? '게시글 수정' : '게시글 작성' }}</h2>

      <div class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="submitForm">
            <!-- 알림 메시지 -->
            <div v-if="message" :class="['alert', messageType === 'error' ? 'alert-danger' : 'alert-success']">
              {{ message }}
            </div>

            <!-- 제목 입력 -->
            <div class="mb-3">
              <label for="title" class="form-label">제목</label>
              <input
                type="text"
                id="title"
                v-model="boardForm.title"
                class="form-control"
                placeholder="제목을 입력하세요"
                required
              >
            </div>

            <!-- 내용 입력 -->
            <div class="mb-4">
              <label for="content" class="form-label">내용</label>
              <textarea
                id="content"
                v-model="boardForm.content"
                class="form-control"
                placeholder="내용을 입력하세요"
                rows="10"
                required
              ></textarea>
            </div>

            <!-- 게시글 상태 선택 -->
            <div class="mb-3">
              <label class="form-label">게시글 상태</label>
              <div class="d-flex">
                <div class="form-check me-3">
                  <input
                    type="radio"
                    id="statusActive"
                    v-model="boardForm.status"
                    value="ACTIVE"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="statusActive">공개</label>
                </div>
                <div class="form-check">
                  <input
                    type="radio"
                    id="statusInactive"
                    v-model="boardForm.status"
                    value="INACTIVE"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="statusInactive">비공개</label>
                </div>
              </div>
            </div>

            <!-- 파일 업로드 (선택사항) -->
            <div class="mb-4">
              <label for="fileUpload" class="form-label">파일 첨부 (선택사항)</label>
              <input
                type="file"
                id="fileUpload"
                class="form-control"
                @change="handleFileUpload"
              >
              <div v-if="boardForm.filePath" class="mt-2">
                <span class="text-muted">현재 파일: {{ getFileNameFromPath(boardForm.filePath) }}</span>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-danger ms-2"
                  @click="removeFile"
                >
                  삭제
                </button>
              </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="d-flex justify-content-between">
              <router-link to="/boards" class="btn btn-secondary">
                <i class="bi bi-x-circle me-1"></i> 취소
              </router-link>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-check-circle me-1"></i>
                {{ isEdit ? '수정하기' : '등록하기' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import boardService from '@/services/board';

export default {
  name: 'BoardWriteView',
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 상태 관리
    const loading = ref(false);
    const message = ref('');
    const messageType = ref('');
    const selectedFile = ref(null);
    
    // 폼 데이터
    const boardForm = reactive({
      title: '',
      content: '',
      writerId: 2, // 임시로 사용자 ID 설정 (실제로는 로그인된 사용자 ID 사용)
      categoryId: 1, // QnA 게시판 카테고리 ID (백엔드와 협의 필요)
      status: 'ACTIVE',
      filePath: ''
    });

    // 수정 모드 여부 확인
    const isEdit = computed(() => {
      return route.path.includes('/edit/');
    });

    // 게시글 ID (수정 모드일 때만 사용)
    const postId = computed(() => {
      return isEdit.value ? Number(route.params.no) : null;
    });

    // 파일 업로드 처리
    const handleFileUpload = (event) => {
      selectedFile.value = event.target.files[0];
      // 실제 파일 업로드는 폼 제출 시 처리
    };

    // 파일 경로에서 파일명 추출
    const getFileNameFromPath = (path) => {
      if (!path) return '';
      return path.split('/').pop();
    };

    // 파일 삭제
    const removeFile = () => {
      boardForm.filePath = '';
      selectedFile.value = null;
      // 파일 입력 필드 초기화
      const fileInput = document.getElementById('fileUpload');
      if (fileInput) fileInput.value = '';
    };

    // 게시글 등록
    const createBoard = async () => {
      try {
        loading.value = true;
        
        // 파일 업로드 처리 (실제로는 FormData와 별도의 API 호출 필요)
        if (selectedFile.value) {
          // 실제 구현에서는 파일 업로드 API 호출 후 파일 경로 설정
          // const formData = new FormData();
          // formData.append('file', selectedFile.value);
          // const uploadResponse = await fileService.uploadFile(formData);
          // boardForm.filePath = uploadResponse.data.filePath;
          
          // 임시 구현 (실제로는 파일 업로드 후 경로를 설정해야 함)
          boardForm.filePath = `/uploads/${selectedFile.value.name}`;
        }
        
        const response = await boardService.createBoard(boardForm);
        
        message.value = '게시글이 등록되었습니다.';
        messageType.value = 'success';
        
        // 게시글 상세 페이지로 이동
        setTimeout(() => {
          router.push(`/boards/${response.data.postId}`);
        }, 1000);
      } catch (error) {
        console.error('게시글 등록 실패:', error);
        message.value = '게시글 등록에 실패했습니다.';
        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    // 게시글 수정
    const updateBoard = async () => {
      try {
        loading.value = true;
        
        // 파일 업로드 처리 (실제로는 FormData와 별도의 API 호출 필요)
        if (selectedFile.value) {
          // 실제 구현에서는 파일 업로드 API 호출 후 파일 경로 설정
          // const formData = new FormData();
          // formData.append('file', selectedFile.value);
          // const uploadResponse = await fileService.uploadFile(formData);
          // boardForm.filePath = uploadResponse.data.filePath;
          
          // 임시 구현 (실제로는 파일 업로드 후 경로를 설정해야 함)
          boardForm.filePath = `/uploads/${selectedFile.value.name}`;
        }
        
        await boardService.updateBoard(postId.value, boardForm);
        
        message.value = '게시글이 수정되었습니다.';
        messageType.value = 'success';
        
        // 게시글 상세 페이지로 이동
        setTimeout(() => {
          router.push(`/boards/${postId.value}`);
        }, 1000);
      } catch (error) {
        console.error('게시글 수정 실패:', error);
        message.value = '게시글 수정에 실패했습니다.';
        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    // 폼 제출 처리
    const submitForm = () => {
      if (isEdit.value) {
        updateBoard();
      } else {
        createBoard();
      }
    };

    // 수정일 경우 기존 게시글 정보 가져오기
    const fetchBoardDetail = async () => {
      if (!isEdit.value) return;
      
      try {
        loading.value = true;
        const { data } = await boardService.getBoardDetail(postId.value);
        
        if (!data) {
          message.value = '게시글 정보를 찾을 수 없습니다.';
          messageType.value = 'error';
          return;
        }
        
        // 폼 데이터 설정
        boardForm.title = data.title;
        boardForm.content = data.content;
        boardForm.status = data.status;
        boardForm.filePath = data.filePath;
        boardForm.categoryId = data.categoryId;
        boardForm.writerId = data.writerId;
      } catch (error) {
        console.error('게시글 정보 조회 실패:', error);
        message.value = '게시글 정보를 불러오는데 실패했습니다.';
        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    // 컴포넌트 마운트 시 실행
    onMounted(() => {
      fetchBoardDetail();
    });

    return {
      boardForm,
      loading,
      message,
      messageType,
      isEdit,
      submitForm,
      handleFileUpload,
      getFileNameFromPath,
      removeFile
    };
  }
};
</script>

<style scoped>
.board-write-view {
  padding: 2rem 0;
}
</style>