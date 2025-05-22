<template>
  <div class="saved-trip-plan-list">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩중...</span>
      </div>
      <p class="mt-2">저장된 일정을 불러오는 중입니다...</p>
    </div>

    <!-- 저장된 일정이 없는 경우 -->
    <div v-else-if="tripPlans.length === 0" class="text-center py-5">
      <i class="bi bi-folder-x display-4 text-muted"></i>
      <h5 class="mt-3">저장된 일정이 존재하지 않습니다.</h5>
      <p class="text-muted">여행 계획을 저장하면 여기에 표시됩니다.</p>
    </div>

    <!-- 저장된 일정 목록 -->
    <div v-else>
      <!-- 상단 컨트롤 바 -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="form-check">
            <input
              type="checkbox"
              id="selectAll"
              v-model="selectAllPlans"
              @change="toggleSelectAll"
              class="form-check-input"
            >
            <label class="form-check-label" for="selectAll">
              전체 선택
            </label>
          </div>

          <!-- 상태 필터 -->
          <select
            v-model="statusFilter"
            @change="onStatusFilterChange"
            class="form-select form-select-sm"
            style="width: auto;"
          >
            <option value="">전체 상태</option>
            <option value="DRAFT">임시저장</option>
            <option value="COMPLETED">완료</option>
          </select>
        </div>

        <div class="d-flex gap-2">
          <span class="text-muted small">
            총 {{ pageInfo?.totalElements || 0 }}개
          </span>
          <button
            class="btn btn-sm btn-danger"
            @click="deleteSelectedPlans"
            :disabled="selectedPlanIds.length === 0"
          >
            <i class="bi bi-trash me-1"></i>
            선택 삭제 ({{ selectedPlanIds.length }})
          </button>
        </div>
      </div>

      <!-- 일정 목록 -->
      <div class="trip-plans-list">
        <div
          v-for="plan in tripPlans"
          :key="plan.id"
          class="trip-plan-item card mb-3"
          :class="{ 'selected': selectedPlanIds.includes(plan.id) }"
        >
          <div class="card-body">
            <div class="row align-items-center">
              <!-- 체크박스 -->
              <div class="col-auto">
                <input
                  type="checkbox"
                  :id="`plan-${plan.id}`"
                  v-model="selectedPlanIds"
                  :value="plan.id"
                  class="form-check-input"
                >
              </div>

              <!-- 일정 정보 -->
              <div class="col">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <!-- 제목과 상태 -->
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <h6 class="mb-0">{{ plan.name }}</h6>
                      <span
                        class="badge"
                        :class="getStatusBadgeClass(plan.status)"
                      >
                        {{ getStatusText(plan.status) }}
                      </span>
                    </div>

                    <!-- 설명 -->
                    <p class="mb-2 text-muted small">
                      {{ plan.description || '설명 없음' }}
                    </p>

                    <!-- 메타 정보 -->
                    <div class="row text-muted small">
                      <div class="col-md-6">
                        <i class="bi bi-calendar me-1"></i>
                        {{ formatDateRange(plan.startDate, plan.endDate) }}
                      </div>
                      <div class="col-md-6">
                        <i class="bi bi-geo-alt me-1"></i>
                        {{ plan.attractions?.length || 0 }}개 관광지
                        <span v-if="plan.totalDistance" class="ms-2">
                          | {{ formatDistance(plan.totalDistance) }}
                        </span>
                      </div>
                    </div>

                    <!-- 관광지 미리보기 -->
                    <div v-if="plan.attractions && plan.attractions.length > 0" class="mt-2">
                      <div class="attraction-preview">
                        <span
                          v-for="(attraction, index) in plan.attractions.slice(0, 3)"
                          :key="attraction.id"
                          class="badge bg-light text-dark me-1"
                        >
                          {{ attraction.attractionTitle }}
                        </span>
                        <span
                          v-if="plan.attractions.length > 3"
                          class="badge bg-secondary"
                        >
                          +{{ plan.attractions.length - 3 }}개
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 액션 버튼들 -->
                  <div class="d-flex flex-column gap-2 ms-3">
                    <div class="btn-group-vertical btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="$emit('load-plan', plan.id)"
                        title="일정 불러오기"
                      >
                        <i class="bi bi-download me-1"></i>
                        불러오기
                      </button>

                      <button
                        class="btn btn-outline-secondary"
                        @click="showPlanDetail(plan)"
                        title="상세 보기"
                      >
                        <i class="bi bi-eye me-1"></i>
                        상세보기
                      </button>

                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-warning dropdown-toggle"
                          data-bs-toggle="dropdown"
                          title="상태 변경"
                        >
                          <i class="bi bi-gear"></i>
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <button
                              class="dropdown-item"
                              @click="updatePlanStatus(plan.id, 'DRAFT')"
                              :disabled="plan.status === 'DRAFT'"
                            >
                              <i class="bi bi-file-earmark me-2"></i>
                              임시저장으로 변경
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="updatePlanStatus(plan.id, 'COMPLETED')"
                              :disabled="plan.status === 'COMPLETED'"
                            >
                              <i class="bi bi-check-circle me-2"></i>
                              완료로 변경
                            </button>
                          </li>
                        </ul>
                      </div>

                      <button
                        class="btn btn-outline-danger"
                        @click="deleteSinglePlan(plan.id)"
                        title="삭제"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <nav v-if="pageInfo && pageInfo.totalPages > 1" aria-label="Page navigation" class="mt-4">
        <ul class="pagination justify-content-center">
          <li :class="['page-item', { disabled: pageInfo.first }]">
            <button
              class="page-link"
              @click="changePage(pageInfo.pageNumber - 1)"
              :disabled="pageInfo.first"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          <li
            v-for="page in getPageNumbers()"
            :key="page"
            :class="['page-item', { active: page === pageInfo.pageNumber }]"
          >
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>

          <li :class="['page-item', { disabled: pageInfo.last }]">
            <button
              class="page-link"
              @click="changePage(pageInfo.pageNumber + 1)"
              :disabled="pageInfo.last"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 상세보기 모달 -->
    <div class="modal fade" id="planDetailModal" tabindex="-1" aria-hidden="true" ref="planDetailModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedPlan?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedPlan">
              <!-- 기본 정보 -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>상태:</strong>
                  <span
                    class="badge ms-2"
                    :class="getStatusBadgeClass(selectedPlan.status)"
                  >
                    {{ getStatusText(selectedPlan.status) }}
                  </span>
                </div>
                <div class="col-md-6">
                  <strong>작성일:</strong> {{ formatDate(selectedPlan.createdAt) }}
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>여행 기간:</strong> {{ formatDateRange(selectedPlan.startDate, selectedPlan.endDate) }}
                </div>
                <div class="col-md-6">
                  <strong>총 거리:</strong> {{ formatDistance(selectedPlan.totalDistance) }}
                </div>
              </div>

              <!-- 설명 -->
              <div class="mb-3">
                <strong>설명:</strong>
                <p class="mt-1">{{ selectedPlan.description || '설명이 없습니다.' }}</p>
              </div>

              <!-- 관광지 목록 -->
              <div class="mb-3">
                <strong>관광지 목록 ({{ selectedPlan.attractions?.length || 0 }}개):</strong>
                <div class="mt-2">
                  <div
                    v-for="(attraction, index) in selectedPlan.attractions"
                    :key="attraction.id"
                    class="d-flex align-items-center mb-2 p-2 bg-light rounded"
                  >
                    <span class="badge bg-primary me-2">{{ index + 1 }}</span>
                    <div class="flex-grow-1">
                      <div class="fw-bold">{{ attraction.attractionTitle }}</div>
                      <small class="text-muted">{{ attraction.sido }} {{ attraction.gugun }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="loadPlanFromModal"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-download me-1"></i>
              이 일정 불러오기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import tripPlanService from '@/services/tripPlan';

export default {
  name: 'SavedTripPlanList',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'load-plan', 'plans-updated'],
  setup(props, { emit }) {
    const loading = ref(false);
    const tripPlans = ref([]);
    const pageInfo = ref(null);
    const selectedPlanIds = ref([]);
    const selectAllPlans = ref(false);
    const statusFilter = ref('');
    const selectedPlan = ref(null);
    const planDetailModalRef = ref(null);
    let planDetailModal = null;

    // 현재 페이지
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 여행 계획 목록 조회
    const loadTripPlans = async (page = 1, size = 10, status = null) => {
      try {
        loading.value = true;
        selectedPlanIds.value = [];
        selectAllPlans.value = false;
        currentPage.value = page;

        const params = { page, size };
        if (status) {
          params.status = status;
        }

        const { data } = await tripPlanService.getUserTripPlans(params);

        tripPlans.value = data.content || [];
        pageInfo.value = {
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          first: data.first,
          last: data.last
        };

        // 부모 컴포넌트에 알림
        emit('plans-updated', tripPlans.value);

      } catch (error) {
        console.error('저장된 일정 조회 실패:', error);
        tripPlans.value = [];
        pageInfo.value = null;

        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
        }
      } finally {
        loading.value = false;
      }
    };

    // 상태 필터 변경
    const onStatusFilterChange = () => {
      loadTripPlans(1, pageSize.value, statusFilter.value || null);
    };

    // 페이지 변경
    const changePage = (page) => {
      if (page >= 1 && page <= pageInfo.value.totalPages) {
        loadTripPlans(page, pageSize.value, statusFilter.value || null);
      }
    };

    // 전체 선택 토글
    const toggleSelectAll = () => {
      if (selectAllPlans.value) {
        selectedPlanIds.value = tripPlans.value.map(plan => plan.id);
      } else {
        selectedPlanIds.value = [];
      }
    };

    // 선택된 일정들 삭제
    const deleteSelectedPlans = async () => {
      if (selectedPlanIds.value.length === 0) return;

      if (!confirm(`선택한 ${selectedPlanIds.value.length}개의 일정을 삭제하시겠습니까?`)) {
        return;
      }

      try {
        await tripPlanService.deleteTripPlans(selectedPlanIds.value);
        await loadTripPlans(currentPage.value, pageSize.value, statusFilter.value || null);
        selectedPlanIds.value = [];
        selectAllPlans.value = false;
        alert('선택한 일정이 삭제되었습니다.');
      } catch (error) {
        console.error('일정 삭제 실패:', error);
        alert('일정 삭제에 실패했습니다.');
      }
    };

    // 단일 일정 삭제
    const deleteSinglePlan = async (planId) => {
      if (!confirm('이 일정을 삭제하시겠습니까?')) return;

      try {
        await tripPlanService.deleteTripPlan(planId);
        await loadTripPlans(currentPage.value, pageSize.value, statusFilter.value || null);
        alert('일정이 삭제되었습니다.');
      } catch (error) {
        console.error('일정 삭제 실패:', error);
        alert('일정 삭제에 실패했습니다.');
      }
    };

    // 일정 상태 업데이트
    const updatePlanStatus = async (planId, newStatus) => {
      try {
        await tripPlanService.updateTripPlanStatus(planId, newStatus);
        await loadTripPlans(currentPage.value, pageSize.value, statusFilter.value || null);
        alert(`일정이 ${getStatusText(newStatus)}으로 변경되었습니다.`);
      } catch (error) {
        console.error('일정 상태 변경 실패:', error);
        alert('일정 상태 변경에 실패했습니다.');
      }
    };

    // 일정 상세보기
    const showPlanDetail = async (plan) => {
      try {
        // 상세 정보가 필요한 경우 API 호출
        if (!plan.attractions || plan.attractions.length === 0) {
          const { data } = await tripPlanService.getTripPlanDetail(plan.id);
          selectedPlan.value = data;
        } else {
          selectedPlan.value = plan;
        }

        planDetailModal.show();
      } catch (error) {
        console.error('일정 상세 조회 실패:', error);
        alert('일정 상세 정보를 불러오는데 실패했습니다.');
      }
    };

    // 모달에서 일정 불러오기
    const loadPlanFromModal = () => {
      if (selectedPlan.value) {
        emit('load-plan', selectedPlan.value.id);
      }
    };

    // 페이지 번호 계산
    const getPageNumbers = () => {
      if (!pageInfo.value) return [];

      const { pageNumber, totalPages } = pageInfo.value;
      const pages = [];
      const start = Math.max(1, pageNumber - 2);
      const end = Math.min(totalPages, pageNumber + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };

    // 상태 텍스트 반환
    const getStatusText = (status) => {
      switch (status) {
        case 'DRAFT': return '임시저장';
        case 'COMPLETED': return '완료';
        case 'DELETED': return '삭제됨';
        default: return '알 수 없음';
      }
    };

    // 상태 뱃지 클래스 반환
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'DRAFT': return 'bg-warning text-dark';
        case 'COMPLETED': return 'bg-success';
        case 'DELETED': return 'bg-danger';
        default: return 'bg-secondary';
      }
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
      if (!dateString) return '날짜 정보 없음';
      return new Date(dateString).toLocaleDateString('ko-KR');
    };

    // 날짜 범위 포맷팅
    const formatDateRange = (startDate, endDate) => {
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      if (start === end) {
        return start;
      }

      return `${start} - ${end}`;
    };

    // 거리 포맷팅
    const formatDistance = (distance) => {
      if (!distance) return '0km';
      return `${parseFloat(distance).toFixed(1)}km`;
    };

    // 선택된 일정 ID 변경 감지
    watch(selectedPlanIds, () => {
      selectAllPlans.value = selectedPlanIds.value.length === tripPlans.value.length && tripPlans.value.length > 0;
      emit('update:modelValue', selectedPlanIds.value);
    }, { deep: true });

    // 컴포넌트 마운트 시 초기화
    onMounted(async () => {
      // Bootstrap 모달 초기화
      const { Modal } = await import('bootstrap');
      planDetailModal = new Modal(planDetailModalRef.value);

      // 초기 데이터 로드
      await loadTripPlans();
    });

    // 외부에서 데이터 새로고침을 위한 메서드
    const refresh = () => {
      loadTripPlans(currentPage.value, pageSize.value, statusFilter.value || null);
    };

    return {
      loading,
      tripPlans,
      pageInfo,
      selectedPlanIds,
      selectAllPlans,
      statusFilter,
      selectedPlan,
      planDetailModalRef,
      loadTripPlans,
      onStatusFilterChange,
      changePage,
      toggleSelectAll,
      deleteSelectedPlans,
      deleteSinglePlan,
      updatePlanStatus,
      showPlanDetail,
      loadPlanFromModal,
      getPageNumbers,
      getStatusText,
      getStatusBadgeClass,
      formatDate,
      formatDateRange,
      formatDistance,
      refresh
    };
  }
};
</script>

<style scoped>
.trip-plans-list {
  max-height: 500px;
  overflow-y: auto;
}

.trip-plan-item {
  transition: all 0.2s;
  cursor: pointer;
}

.trip-plan-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.trip-plan-item.selected {
  border-color: #4361ee;
  box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
}

.attraction-preview .badge {
  font-size: 0.7rem;
}

.btn-group-vertical .btn {
  font-size: 0.8rem;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #4361ee;
}

.page-item.active .page-link {
  background-color: #4361ee;
  border-color: #4361ee;
}

.modal-dialog {
  max-width: 800px;
}

.form-select-sm {
  min-width: 120px;
}
</style>
