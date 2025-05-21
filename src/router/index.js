import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import { useAuthStore } from '@/stores/authStore'

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
    name: 'RegisterSelect',
    component: () => import('@/views/register/RegisterTypeSelectView.vue')
  },
  {
    path: '/register/user',
    name: 'RegisterUser',
    component: () => import('@/views/register/RegisterUserView.vue')
  },
   {
    path: '/register/curator',
    name: 'RegisterCurator',
    component: () => import('@/views/register/RegisterCuratorView.vue')
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      const isLoggedIn = await authStore.checkLogin();

      if (isLoggedIn) {
        next();
      } else {
        next({ name: 'Login', query: { redirect: to.fullPath } });
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      next({ name: 'Login', query: { redirect: to.fullPath } });
    }
  } else {
    next();
  }
});

export default router;
