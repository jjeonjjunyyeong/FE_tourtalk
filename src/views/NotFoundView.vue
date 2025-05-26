<template>
  <div class="not-found-view">
    <div class="container text-center">
      <div class="error-container">
        <h1 class="display-1">404</h1>
        <h2 class="mb-4">페이지를 찾을 수 없습니다</h2>
        <p class="lead mb-5">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>

        <router-link to="/" class="btn btn-primary btn-lg">
          <i class="bi bi-house-door me-2"></i>
          홈으로 돌아가기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 페이지는 로직이 없으므로 빈 setup
</script>

<style scoped>
.not-found-view {
  display: flex;
  min-height: calc(100vh - 200px);
  align-items: center;
  padding: 2rem 0;
}

.error-container {
  padding: 2rem;
}

.display-1 {
  font-size: 8rem;
  font-weight: bold;
  color: #4361ee;
}
</style>