// 完整修复脚本：登录 + 等待页面加载 + 手动触发数据加载
// 粘贴到浏览器控制台运行

console.log('🚀 完整修复脚本启动\n');

// 步骤1：登录并保存token
console.log('=== 步骤1：登录 ===');
fetch('http://localhost:8002/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(data => {
  if (!data.access_token) {
    console.error('❌ 登录失败', data);
    return null;
  }
  
  console.log('✅ 登录成功:', data.user_info.username);
  
  // 步骤2：保存到 localStorage（两个位置都保存，确保兼容）
  console.log('\n=== 步骤2：保存 Token ===');
  const authData = {
    token: data.access_token,
    user: data.user_info,
    isAuthenticated: true
  };
  
  // 方式1：直接保存到 auth
  localStorage.setItem('auth', JSON.stringify(authData));
  console.log('✅ 已保存到 localStorage.auth');
  
  // 方式2：也保存到 persist:root（Redux persist）
  const persistData = {
    auth: JSON.stringify(authData)
  };
  localStorage.setItem('persist:root', JSON.stringify(persistData));
  console.log('✅ 已保存到 localStorage.persist:root');
  
  // 步骤3：清除所有缓存并重新加载
  console.log('\n=== 步骤3：刷新页面 ===');
  console.log('3秒后完整刷新（包括缓存）...');
  
  setTimeout(() => {
    // 完整清除缓存后刷新
    window.location.href = window.location.href + '?t=' + Date.now();
  }, 3000);
  
  return data;
})
.catch(err => {
  console.error('❌ 错误:', err.message);
});
