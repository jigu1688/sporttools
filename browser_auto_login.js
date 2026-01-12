// 自动登录并验证学生数据显示脚本
// 用途：粘贴到浏览器控制台（F12 → Console）运行

console.log('🚀 开始自动登录并验证学生数据...\n');

// 1. 登录
console.log('[1/3] 正在登录...');
fetch('http://localhost:8002/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(data => {
  if (!data.access_token) {
    console.error('❌ 登录失败:', data);
    return;
  }
  
  console.log('✅ 登录成功');
  console.log('   用户:', data.user_info.username);
  
  // 2. 保存 token 到 localStorage
  const authData = {
    token: data.access_token,
    user: data.user_info,
    isAuthenticated: true
  };
  localStorage.setItem('auth', JSON.stringify(authData));
  localStorage.setItem('persist:root', JSON.stringify({
    auth: JSON.stringify({
      user: data.user_info,
      token: data.access_token,
      isAuthenticated: true
    })
  }));
  
  console.log('\n[2/3] 已保存 token 到 localStorage');
  console.log('   localStorage.auth 已设置');
  
  // 3. 刷新页面使前端重新加载认证状态
  console.log('\n[3/3] 即将刷新页面以加载前端数据...');
  console.log('   3秒后自动刷新...');
  
  setTimeout(() => {
    console.log('\n🔄 正在刷新页面...');
    window.location.reload();
  }, 3000);
})
.catch(err => {
  console.error('❌ 请求失败:', err);
  console.log('   提示：确保后端运行在 http://localhost:8002');
});
