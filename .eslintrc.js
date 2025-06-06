module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false // Babel 설정 파일이 필요하지 않게 설정
  },
  globals:{
    __API_BASE_URL__: 'readonly',
    __KAKAO_MAP_API_KEY__: 'readonly',
    __KAKAO_REST_API_KEY__: 'readonly'
  }, 
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
