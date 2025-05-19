import axios from 'axios';

// 기본 API 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // 쿠키 자동 포함, JWT HttpOnly 기반
  timeout: 5000
});

export default apiClient;
