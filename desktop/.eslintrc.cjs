module.exports = {
  extends: '@electron-toolkit/eslint-config-ts/recommended',
  rules: {
    // 性能优化建议
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    
    // 代码质量
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // 性能相关警告
    'prefer-const': 'warn',
    'no-var': 'error',
  },
};