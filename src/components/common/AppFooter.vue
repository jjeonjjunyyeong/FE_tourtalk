<template>
  <footer class="bg-dark text-white py-4 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-3 mb-md-0">
          <h5 class="mb-3">TourTalk</h5>
          <p class="mb-0">여행의 즐거움을 발견하고, 새로운 경험을 계획하세요.</p>
          <p class="small mt-2 text-muted">© 2025 SSAFY. All rights reserved.</p>
        </div>

        <div class="col-md-4 mb-3 mb-md-0">
          <h5 class="mb-3">주요 링크</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-white-50">홈</router-link></li>
            <li><router-link to="/attractions" class="text-white-50">여행지 검색</router-link></li>
            <li><router-link to="/trip-plan" class="text-white-50">여행 계획</router-link></li>
            <li><a href="#" class="text-white-50">고객 지원</a></li>
          </ul>
        </div>

        <div class="col-md-4">
          <h5 class="mb-3">연락처</h5>
          <ul class="list-unstyled text-white-50">
            <li><i class="bi bi-geo-alt-fill me-2"></i> 광주광역시 북구 SSAFY</li>
            <li><i class="bi bi-envelope-fill me-2"></i> info@tourtalk.com</li>
            <li><i class="bi bi-telephone-fill me-2"></i> +82 10-1234-5678</li>
          </ul>

          <div class="mt-3">
            <a href="#" class="text-white me-2"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-white me-2"><i class="bi bi-twitter"></i></a>
            <a href="#" class="text-white me-2"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-white"><i class="bi bi-youtube"></i></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 푸터는 간단하므로 특별한 로직이 필요 없습니다
</script>

<style scoped>
footer {
  margin-top: auto;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s;
}

.text-white-50:hover {
  color: white;
}
</style>
