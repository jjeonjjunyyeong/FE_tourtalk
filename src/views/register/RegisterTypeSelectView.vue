<template>
  <div class="register-select container py-5 text-center">
    <h2 class="mb-5 fw-bold">회원 유형을 선택해주세요</h2>
    <div class="row justify-content-center g-4">
      <!-- 일반 회원 카드 -->
      <div class="col-md-5">
        <div class="register-card card card-user" @click="goToUserRegister">
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <div class="emoji">🙋‍♂️</div>
            <h4 class="mt-3">일반 회원 가입</h4>
            <p class="text-muted mt-2">일반 사용자를 위한 회원가입입니다.</p>
          </div>
        </div>
      </div>

      <!-- 학예사 카드 -->
      <div class="col-md-5">
        <div class="register-card card card-curator" @click="goToCuratorRegister">
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <div class="emoji">🧑‍🏫</div>
            <h4 class="mt-3">학예사 회원 가입</h4>
            <p class="text-muted mt-2">전문 큐레이터 전용 회원가입입니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goToUserRegister = () => {
  router.push('/register/user');
};

const goToCuratorRegister = () => {
  router.push('/register/curator');
};
</script>

<style scoped>
.register-select {
  min-height: 70vh;
}

.register-card {
  min-height: 240px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  border-radius: 16px;
}

.register-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.card-user {
  background: #e3f2fd; /* light blue */
  color: #0d47a1;
}

.card-curator {
  background: #ede7f6; /* light purple */
  color: #4a148c;
}

.emoji {
  font-size: 3rem;
}
</style>
