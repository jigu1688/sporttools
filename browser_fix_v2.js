// 完整修复脚本 v2：清除旧数据 + 完整登录 + 正确保存 localStorage
// 粘贴到浏览器控制台运行

console.log('🔧 完整修复脚本 v2 启动\n');

// 第1步：完全清除 localStorage
console.log('=== [1] 清除旧的 localStorage 数据 ===');
localStorage.clear();
sessionStorage.clear();
console.log('✅ 已清除 localStorage 和 sessionStorage');

// 第2步：登录
console.log('\n=== [2] 登录 ===');
fetch('http://localhost:8002/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(data => {
  if (!data.access_token) {
    console.error('❌ 登录失败:', data);
    return null;
  }
  
  console.log('✅ 登录成功');
  console.log('   用户:', data.user_info.username);
  console.log('   Token:', data.access_token.substring(0, 30) + '...');
  
  // 第3步：正确保存到 localStorage（Redux persist 格式）
  console.log('\n=== [3] 保存到 localStorage ===');
  
  // 方式1：保存到 auth 键（给 apiClient 使用）
  const authData = {
    token: data.access_token,
    user: data.user_info,
    isAuthenticated: true
  };
  localStorage.setItem('auth', JSON.stringify(authData));
  console.log('✅ 已保存到 localStorage.auth');
  
  // 方式2：保存到 persist:root 键（Redux persist 格式）
  // 注意：auth 的值必须是 JSON 字符串，然后整个对象再 stringify
  const persistRoot = {
    auth: JSON.stringify(authData),
    data: JSON.stringify({
      schoolYears: [],
      currentSchoolYear: { id: null, year_name: '', start_date: '', end_date: '', status: '' },
      schoolInfo: {},
      classes: [],
      students: [],
      studentHistories: [],
      users: []
    })
  };
  localStorage.setItem('persist:root', JSON.stringify(persistRoot));
  console.log('✅ 已保存到 localStorage.persist:root');
  
  // 第4步：验证 localStorage
  console.log('\n=== [4] 验证 localStorage ===');
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  console.log('✅ localStorage.auth.isAuthenticated:', auth.isAuthenticated);
  const persist = JSON.parse(localStorage.getItem('persist:root') || '{}');
  console.log('✅ localStorage.persist:root 已保存');
  
  // 第5步：刷新页面
  console.log('\n=== [5] 刷新页面 ===');
  console.log('2秒后刷新...');
  setTimeout(() => {
    console.log('🔄 刷新中...');
    // 完整刷新（绕过缓存）
    window.location.replace(window.location.origin + window.location.pathname);
  }, 2000);
  
  return data;
})
.catch(err => {
  console.error('❌ 错误:', err.message);
  console.error(err);
});
