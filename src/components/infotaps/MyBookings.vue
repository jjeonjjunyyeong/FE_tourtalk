<template>
  <div>
    <h3 class="mb-4">내 예약 상품</h3>
    <ul v-if="bookings.length">
      <li v-for="booking in bookings" :key="booking.bookingId">
        {{ booking.title }} - {{ booking.date }} (인원: {{ booking.people }})
      </li>
    </ul>
    <p v-else>예약한 상품이 없습니다.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import bookingService from '@/services/booking'

const bookings = ref([])

onMounted(async () => {
  // const res = await bookingService.getMyBookings()
  // bookings.value = res.data
})
</script>
