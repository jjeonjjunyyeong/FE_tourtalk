import apiClient from './api';

export default {
  // 여행 채팅 AI
  travelChat(message) {
    return apiClient.post('/ai/chat', { message });
  },

  // 관광지 정보 AI
  attractionInfo(attractionName, address, overview) {
    return apiClient.post('/ai/attraction-info', {
      attractionName,
      address,
      overview
    });
  }
};