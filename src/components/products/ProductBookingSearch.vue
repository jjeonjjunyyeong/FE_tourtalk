<template>
  <div class="product-booking-search card shadow-sm mb-4">
    <div class="card-body">
      <form @submit.prevent="onSearch">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label">키워드</label>
            <input
              type="text"
              class="form-control"
              v-model="params.keyword"
              placeholder="상품명을 입력하세요"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">예약 날짜</label>
            <input type="date" class="form-control" v-model="params.date" />
          </div>

          <div class="col-md-4">
            <label class="form-label">예약 인원</label>
            <input type="number" min="1" class="form-control" v-model="params.participantCount" />
          </div>

          <div class="col-12 d-flex justify-content-end">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-search me-1"></i> 검색
            </button>
            <button type="button" class="btn btn-outline-secondary ms-2" @click="resetSearch">
              초기화
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const emit = defineEmits(['search'])

const params = reactive({
  keyword: '',
  date: '',
  participantCount: 1,
})

const onSearch = () => {
  emit('search', { ...params })
}

const resetSearch = () => {
  params.keyword = ''
  params.date = ''
  params.participantCount = 1
  emit('search', { ...params })
}
</script>

<style scoped>
.product-booking-search {
  margin-bottom: 2rem;
}
</style>
