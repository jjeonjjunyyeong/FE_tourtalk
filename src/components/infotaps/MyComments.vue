<template>
  <div>
    <h3 class="mb-4">내가 작성한 댓글</h3>
    <ul v-if="comments.length">
      <li v-for="comment in comments" :key="comment.id">
        "{{ comment.content }}" ({{ comment.createdAt }})
      </li>
    </ul>
    <p v-else>작성한 댓글이 없습니다.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import commentService from '@/services/comment'

const comments = ref([])

onMounted(async () => {
  // const res = await commentService.getMyComments()
  // comments.value = res.data
})
</script>
