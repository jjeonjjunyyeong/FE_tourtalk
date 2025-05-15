import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';
// Bootstrap JS + Popper
import '@popperjs/core';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 사용자 정의 스타일
import './assets/styles/main.css';

// Axios 기본 설정
axios.defaults.baseURL = 'http://localhost:8080/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 앱 생성
const app = createApp(App);

// 전역 속성으로 axios 등록
app.config.globalProperties.$axios = axios;

// 라우터 사용 및 앱 마운트
app.use(router).mount('#app');
