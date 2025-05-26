import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/attractions',
    name: 'Attractions',
    component: () => import('@/views/AttractionView.vue'),
  },
  {
    path: '/attractions/:no',
    name: 'AttractionDetail',
    component: () => import('@/views/AttractionDetailView.vue'),
    props: true,
  },
  {
    path: '/trip-plan',
    name: 'TripPlan',
    component: () => import('@/views/TripPlanView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'RegisterSelect',
    component: () => import('@/views/register/RegisterTypeSelectView.vue'),
  },
  {
    path: '/register/user',
    name: 'RegisterUser',
    component: () => import('@/views/register/RegisterUserView.vue'),
  },
  {
    path: '/register/curator',
    name: 'RegisterCurator',
    component: () => import('@/views/register/RegisterCuratorView.vue'),
  },
  {
    path: '/profile',
    name: 'MyPageView',
    component: () => import('@/views/MyPageView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
  {
    path: '/boards',
    name: 'BoardList',
    component: () => import('@/views/boards/BoardListView.vue'),
  },
  {
    path: '/boards/write',
    name: 'BoardWrite',
    component: () => import('@/views/boards/BoardWriteView.vue'),
    meta: { requiresAuth: false }, // 로그인 여부에 따라 접근 가능 -> true 로 변경
  },
  {
    path: '/boards/:no',
    name: 'BoardDetail',
    component: () => import('@/views/boards/BoardDetailView.vue'),
  },
  {
    path: '/boards/edit/:no',
    name: 'BoardEdit',
    component: () => import('@/views/boards/BoardWriteView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/products/manage',
    name: 'ProductManage',
    component: () => import('@/views/products/ProductManageView.vue'),
    meta: { requiresAuth: true, role: 'CURATOR' },
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: () => import('@/views/products/ProductCreateView.vue'),
    meta: { requiresAuth: true, role: 'CURATOR' },
  },
  {
    path: '/products/edit/:productId',
    name: 'ProductEdit',
    component: () => import('@/views/products/ProductEditView.vue'),
    meta: { requiresAuth: true, role: 'CURATOR' },
    props: true,
  },
  {
    path: '/products/:productId',
    name: 'ProductDetail',
    component: () => import('@/views/products/ProductDetailView.vue'),
    props: true,
  },
  {
    path: '/admin/users',
    name: 'UserManage',
    component: () => import('@/views/admin/UserManageView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
  },
  {
    path: '/products/booking',
    name: 'ProductBooking',
    component: () => import('@/views/products/ProductBookingView.vue'),
  },
  {
    path: '/products/:productId/book/:time?',
    name: 'BookingView',
    component: () => import('@/views/products/ProductBookingReserveView.vue'),
  },
 {
    path: '/admin/boards',
    name: 'BoardsManage',
    component: () => import('@/views/admin/BoardsManageView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN'},
 },
]

const router = createRouter({
  // 여기가 변경된 부분
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior() {
    // 항상 페이지 상단으로 스크롤
    return { top: 0 }
  },
})

// 네비게이션 가드를 사용하여 인증이 필요한 페이지 처리
router.beforeEach(async (to, from, next) => {
  // 인증 스토어 인스턴스 생성
  const authStore = useAuthStore()

  // HTTP Only Cookie 방식에서는 백엔드에 로그인 상태 확인 요청
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      // 백엔드에 로그인 상태 확인 요청
      const isLoggedIn = await authStore.checkLogin()

      if (isLoggedIn) {
        // 로그인되어 있으면 요청한 페이지로 이동
        next()
      } else {
        // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
        next({ name: 'Login', query: { redirect: to.fullPath } })
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error)
      // 오류 발생 시 로그인 페이지로 리다이렉트
      next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  } else {
    // 인증이 필요 없는 페이지는 그냥 진행
    next()
  }
})

export default router
