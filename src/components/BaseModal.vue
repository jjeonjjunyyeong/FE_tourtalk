<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-container animate__animated animate__fadeInDown">
      <div class="modal-body">
        <p class="modal-message" v-html="message"></p>

        <!-- 기본 alert/confirm -->
        <div class="modal-actions" v-if="mode === 'alert'">
          <button class="btn btn-primary" @click="close">확인</button>
        </div>
        <div class="modal-actions" v-else-if="mode === 'confirm'">
          <button class="btn btn-secondary" @click="$emit('cancel')">취소</button>
          <button class="btn btn-primary" @click="$emit('confirm')">확인</button>
        </div>

        <!-- 예약 완료 후 이동용 -->
        <div class="modal-actions" v-else-if="mode === 'custom'">
          <button class="btn btn-secondary" @click="$emit('custom-action-1')">
            상품 예약 목록
          </button>
          <button class="btn btn-primary" @click="$emit('custom-action-2')">마이페이지 이동</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  message: String,
  mode: {
    type: String,
    default: 'alert',
  },
})

const emit = defineEmits(['close', 'cancel', 'confirm'])
const close = () => emit('close')
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background: #fff;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation-duration: 0.3s;
}

.modal-body {
  text-align: center;
}

.modal-message {
  font-size: 1rem;
  margin-bottom: 1.2rem;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  min-width: 80px;
}
</style>
