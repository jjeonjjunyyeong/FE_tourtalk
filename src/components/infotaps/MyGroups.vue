<template>
  <div>
    <h3 class="mb-4">내 여행 그룹</h3>
    <ul v-if="groups.length">
      <li v-for="group in groups" :key="group.groupId">
        {{ group.name }} - {{ group.startDate }} ~ {{ group.endDate }}
      </li>
    </ul>
    <p v-else>참여한 여행 그룹이 없습니다.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import groupService from '@/services/group'

const groups = ref([])

onMounted(async () => {
  // const res = await groupService.getMyGroups()
  // groups.value = res.data
})
</script>
