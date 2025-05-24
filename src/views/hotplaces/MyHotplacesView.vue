<template>
  <div class="my-hotplaces-view">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>내 핫플레이스 관리</h2>
        <router-link to="/hotplaces/create" class="btn btn-primary">
          <i class="bi bi-plus-circle me-1"></i>
          새 핫플레이스 등록
        </router-link>
      </div>

      <!-- 통계 카드 -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="card-title">총 등록</h5>
                  <h3 class="mb-0">{{ pageInfo?.totalElements || 0 }}개</h3>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-geo-alt-fill fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="card-title">총 조회수</h5>
                  <h3 class="mb-0">{{ totalViews }}</h3>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-eye-fill fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="card-title">평균 평점</h5>
                  <h3 class="mb-0">{{ averageRating }}점</h3>
                </div>
                <div class="align-self-center">
                  <i class="bi bi-star-fill fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 핫플레이스 목록 -->
      <div class="card shadow-sm">
        <div class="card-header bg-light">
          <h5 class="mb-0">내가 등록한 핫플레이스</h5>
        </div>
        <div class="card-body p-0">
          <!-- 로딩 상태 -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">로딩중...</span>
            </div>
            <p class="mt-2">핫플레이스를 불러오는 중입니다...</p>
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="hotplaces.length === 0" class="text-center py-5">
            <i class="bi bi-geo-alt display-4 text-muted"></i>
            <h4 class="mt-3">등록된 핫플레이스가 없습니다</h4>
            <p class="text-muted">첫 번째 핫플레이스를 등록해보세요!</p>
            <router-link to="/hotplaces/create" class="btn btn-primary">
              <i class="bi bi-plus-circle me-1"></i>핫플레이스 등록하기
            </router-link>
          </div>

          <!-- 목록 테이블 -->
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 15%">이미지</th>
                  <th style="width: 25%">제목</th>
                  <th style="width: 15%">카테고리</th>
                  <th style="width: 10%">평점</th>
                  <th style="width: 10%">조회수</th>
                  <th style="width: 15%">등록일</th>
                  <th style="width: 10%">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hotplace in hotplaces" :key="hotplace.id">
                  <!-- 이미지 -->
                  <td>
                    <div class="hotplace-thumbnail">
                      <img
                        v-if="hotplace.imageUrls && hotplace.imageUrls.length > 0"
                        :src="hotplace.imageUrls[0]"
                        :alt="hotplace.title"
                        class="img-fluid rounded"
                      >
                      <div v-else class="no-thumbnail">
                        <i class="bi bi-image"></i>
                      </div>
                    </div>
                  </td>

                  <!-- 제목 -->
                  <td>
                    <router-link :to="`/hotplaces/${hotplace.id}`" class="text-decoration-none">
                      <strong>{{ hotplace.title }}</strong>
                    </router-link>
                    <div v-if="hotplace.description" class="small text-muted mt-1">
                      {{ truncateText(hotplace.description, 50) }}
                    </div>
                  </td>

                  <!-- 카테고리 -->
                  <td>
                    <span class="badge bg-primary">{{ hotplace.contentTypeName }}</span>
                  </td>

                  <!-- 평점 -->
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-star-fill text-warning me-1"></i>
                      {{ hotplace.rating }}점
                    </div>
                  </td>

                  <!-- 조회수 -->
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-eye me-1"></i>
                      {{ hotplace.viewCount || 0 }}
                    </div>
                  </td>

                  <!-- 등록일 -->
                  <td>
                    <small class="text-muted">{{ formatDate(hotplace.createdAt) }}</small>
                  </td>

                  <!-- 관리 버튼 -->
                  <td>
                    <div class="btn-group btn-group-sm">
                      <router-link
                        :to="`/hotplaces/edit/${hotplace.id}`"
                        class="btn btn-outline-primary"
                        title="수정"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
                      <button
                        class="btn btn-outline-danger"
                        @click="confirmDelete(hotplace)"
                        title="삭제"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="pageInfo && pageInfo.totalPages > 1" class="card-footer">
          <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center mb-0">
              <li :class="['page-item', { disabled: pageInfo.first }]">
                <a class="page-link" href="#" @click.prevent="onPageChange(pageInfo.pageNumber - 1)">
                  <i class="bi bi-chevron-left"></i>
                </a>
              </li>

              <li v-for="page in displayedPages" :key="page"
                  :class="['page-item', { active: page === pageInfo.pageNumber }]">
                <a class="page-link" href="#" @click.prevent="onPageChange(page)">
                  {{ page }}
                </a>
              </li>

              <li :class="['page-item', { disabled: pageInfo.last }]">
                <a class="page-link" href="#" @click.prevent="onPageChange(pageInfo.pageNumber + 1)">
                  <i class="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">핫플레이스 삭제</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p><strong>{{ selectedHotplace?.title }}</strong>을(를) 정말 삭제하시겠습니까?</p>
            <p class="text-danger small">삭제된 데이터는 복구할 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-danger" @click="deleteHotplace" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2"></span>
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import hotplaceService from '@/services/hotplace';

export default {
  name: 'MyHotplacesView',
  setup() {
    const hotplaces = ref([]);
    const pageInfo = ref(null);
    const loading = ref(false);
    const deleteLoading = ref(false);
    const selectedHotplace = ref(null);
    const deleteModalRef = ref(null);
    let deleteModal = null;

    // 검색 조건
    const searchCondition = reactive({
      page: 1,
      size: 10
    });

    // 통계 계산
    const totalViews = computed(() => {
      return hotplaces.value.reduce((sum, hotplace) => sum + (hotplace.viewCount || 0), 0);
    });

    const averageRating = computed(() => {
      if (hotplaces.value.length === 0) return '0.0';
      const sum = hotplaces.value.reduce((total, hotplace) => total + hotplace.rating, 0);
      return (sum / hotplaces.value.length).toFixed(1);
    });

    // 화면에 표시할 페이지 번호 계산
    const displayedPages = computed(() => {
      if (!pageInfo.value) return [];

      const { pageNumber, totalPages } = pageInfo.value;
      const pages = [];
      const start = Math.max(1, pageNumber - 2);
      const end = Math.min(totalPages, pageNumber + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    });

    // 내 핫플레이스 목록 조회
    const fetchMyHotplaces = async () => {
      try {
        loading.value = true;
        const { data } = await hotplaceService.getMyHotplaces(searchCondition);

        hotplaces.value = data.content || [];
        pageInfo.value = {
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          first: data.first,
          last: data.last
        };
      } catch (error) {
        console.error('내 핫플레이스 목록 조회 실패:', error);

        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          router.push('/login');
        } else {
          hotplaces.value = [];
          pageInfo.value = null;
        }
      } finally {
        loading.value = false;
      }
    };

    // 페이지 변경
    const onPageChange = (page) => {
      if (page < 1 || page > pageInfo.value.totalPages) return;
      if (page === pageInfo.value.pageNumber) return;

      searchCondition.page = page;
      fetchMyHotplaces();

      // 페이지 상단으로 스크롤
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // 텍스트 줄임
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ko-KR');
    };

    // 삭제 확인
    const confirmDelete = (hotplace) => {
      selectedHotplace.value = hotplace;
      deleteModal.show();
    };

    // 핫플레이스 삭제
    const deleteHotplace = async () => {
      if (!selectedHotplace.value) return;

      try {
        deleteLoading.value = true;

        await hotplaceService.deleteHotplace(selectedHotplace.value.id);

        deleteModal.hide();
        alert('핫플레이스가 삭제되었습니다.');

        // 목록 새로고침
        await fetchMyHotplaces();

      } catch (error) {
        console.error('핫플레이스 삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
      } finally {
        deleteLoading.value = false;
        selectedHotplace.value = null;
      }
    };

    // 컴포넌트 마운트
    onMounted(async () => {
      // Bootstrap 모달 초기화
      const { Modal } = await import('bootstrap');
      deleteModal = new Modal(deleteModalRef.value);

      // 데이터 로드
      fetchMyHotplaces();
    });

    return {
      hotplaces,
      pageInfo,
      loading,
      deleteLoading,
      selectedHotplace,
      deleteModalRef,
      totalViews,
      averageRating,
      displayedPages,
      onPageChange,
      truncateText,
      formatDate,
      confirmDelete,
      deleteHotplace
    };
  }
};
</script>

<style scoped>
.my-hotplaces-view {
  padding: 2rem 0;
}

.hotplace-thumbnail {
  width: 60px;
  height: 45px;
  overflow: hidden;
  border-radius: 0.375rem;
}

.hotplace-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
  border-radius: 0.375rem;
}

.page-link {
  color: #4361ee;
}

.page-item.active .page-link {
  background-color: #4361ee;
  border-color: #4361ee;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>
