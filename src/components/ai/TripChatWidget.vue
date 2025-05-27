<template>
  <div class="travel-chat-widget">
    <!-- 채팅 아이콘 -->
    <div v-if="!isOpen" class="chat-icon" @click="openChat">
      <i class="bi bi-chat-dots"></i>
    </div>

    <!-- 채팅창 -->
    <div v-if="isOpen" class="chat-container">
      <!-- 헤더 -->
      <div class="chat-header">
        <div class="d-flex align-items-center">
          <i class="bi bi-robot me-2"></i>
          <h6 class="mb-0">여행 AI 어시스턴트</h6>
        </div>
        <button class="btn btn-sm btn-link text-white" @click="closeChat">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- 메시지 영역 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="ai-message">
            <div class="message-content">
              안녕하세요! 여행 AI 어시스턴트입니다. 🌟<br>
              한국 여행에 대해 무엇이든 물어보세요!
            </div>
          </div>
        </div>

        <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>

        <!-- 로딩 메시지 -->
        <div v-if="isLoading" class="message ai-message">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 입력 영역 -->
      <div class="chat-input">
        <div class="input-group">
          <input
            type="text"
            v-model="inputMessage"
            @keypress.enter="sendMessage"
            class="form-control"
            placeholder="여행에 대해 질문해보세요..."
            :disabled="isLoading"
          >
          <button
            class="btn btn-primary"
            @click="sendMessage"
            :disabled="isLoading || !inputMessage.trim()"
          >
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import aiService from '@/services/ai';

export default {
  name: 'TravelChatWidget',
  setup() {
    const isOpen = ref(false);
    const inputMessage = ref('');
    const isLoading = ref(false);
    const messagesContainer = ref(null);
    const messages = reactive([]);

    // localStorage에서 채팅 히스토리 로드
    const loadChatHistory = () => {
      try {
        const stored = localStorage.getItem('travelChatHistory');
        if (stored) {
          const history = JSON.parse(stored);
          messages.splice(0, messages.length, ...history);
        }
      } catch (error) {
        console.error('채팅 히스토리 로드 실패:', error);
      }
    };

    // localStorage에 채팅 히스토리 저장
    const saveChatHistory = () => {
      try {
        localStorage.setItem('travelChatHistory', JSON.stringify(messages));
      } catch (error) {
        console.error('채팅 히스토리 저장 실패:', error);
      }
    };

    // 채팅창 열기
    const openChat = () => {
      isOpen.value = true;
      loadChatHistory();
      nextTick(() => {
        scrollToBottom();
      });
    };

    // 채팅창 닫기
    const closeChat = () => {
      isOpen.value = false;
    };

    // 메시지 전송
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return;

      const userMessage = {
        type: 'user-message',
        content: inputMessage.value,
        timestamp: new Date()
      };

      messages.push(userMessage);
      const messageToSend = inputMessage.value;
      inputMessage.value = '';
      
      saveChatHistory();
      scrollToBottom();

      try {
        isLoading.value = true;

        const { data } = await aiService.travelChat(messageToSend);

        const aiMessage = {
          type: 'ai-message',
          content: data.message || data.data?.message || '[응답 파싱 실패]',
          timestamp: new Date()
        };

        messages.push(aiMessage);
        saveChatHistory();

      } catch (error) {
        console.error('AI 메시지 전송 실패:', error);
        
        const errorMessage = {
          type: 'ai-message error',
          content: '현재 AI 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date()
        };

        messages.push(errorMessage);
        saveChatHistory();
      } finally {
        isLoading.value = false;
        nextTick(() => {
          scrollToBottom();
        });
      }
    };

    // 스크롤을 맨 아래로
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    // 시간 포맷팅
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 메시지 변경 감지하여 스크롤
    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    });

    onMounted(() => {
      // 페이지 로드시 채팅 히스토리 로드
      loadChatHistory();
    });

    return {
      isOpen,
      inputMessage,
      isLoading,
      messagesContainer,
      messages,
      openChat,
      closeChat,
      sendMessage,
      formatTime
    };
  }
};
</script>

<style scoped>
.travel-chat-widget {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 1040;
}

.chat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4361ee, #3f37c9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  transition: all 0.3s ease;
}

.chat-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
}

.chat-icon i {
  font-size: 1.5rem;
  color: white;
}

.chat-container {
  width: 400px;
  height: 650px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  background: linear-gradient(135deg, #4361ee, #3f37c9);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.message {
  max-width: 85%;
  word-wrap: break-word;
}

.user-message {
  align-self: flex-end;
}

.user-message .message-content {
  background: #4361ee;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 18px 18px 4px 18px;
}

.ai-message {
  align-self: flex-start;
}

.ai-message .message-content {
  background: #f8f9fa;
  color: #333;
  padding: 0.75rem 1rem;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid #e9ecef;
}

.ai-message.error .message-content {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.message-time {
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 0.25rem;
  text-align: right;
}

.ai-message .message-time {
  text-align: left;
}

.welcome-message {
  text-align: center;
  margin-bottom: 1rem;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: white;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #4361ee;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .travel-chat-widget {
    bottom: 80px;
    right: 10px;
  }
  
  .chat-container {
    width: calc(100vw - 20px);
    max-width: 400px;
    height: calc(100vh - 160px);
    max-height: 650px;
  }
}
</style>