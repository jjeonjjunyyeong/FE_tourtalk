import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/attractions',
    name: 'Attractions',
    component: () => import('@/views/AttractionView.vue')
  },
  {
    path: '/attractions/:no',
    name: 'AttractionDetail',
    component: () => import('@/views/AttractionDetailView.vue'),
    props: true
  },
  {
    path: '/trip-plan',
    name: 'TripPlan',
    component: () => import('@/views/TripPlanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  },
  {
    path: '/boards',
    name: 'BoardList',
    component: () => import('@/views/boards/BoardListView.vue')
  },
  {
    path: '/boards/write',
    name: 'BoardWrite',
    component: () => import('@/views/boards/BoardWriteView.vue'),
    meta: { requiresAuth: false } // 로그인 여부에 따라 접근 가능 -> true 로 변경
  },
  {
    path: '/boards/:no',
    name: 'BoardDetail',
    component: () => import('@/views/boards/BoardDetailView.vue')
  },
  {
    path: '/boards/edit/:no',
    name: 'BoardEdit',
    component: () => import('@/views/boards/BoardWriteView.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  // 여기가 변경된 부분
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior() {
    // 항상 페이지 상단으로 스크롤
    return { top: 0 };
  }
});

// 네비게이션 가드를 사용하여 인증이 필요한 페이지 처리
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('userToken') !== null;

  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    // 로그인이 필요한 페이지인데 로그인되어 있지 않은 경우
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
