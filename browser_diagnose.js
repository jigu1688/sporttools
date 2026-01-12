// 诊断脚本：检查登录、localStorage、Redux 状态和网络请求
// 用途：粘贴到浏览器控制台（F12 → Console）运行

console.log('🔍 开始诊断...\n');

// ========== 1. 检查 Redux 状态 ==========
console.log('=== [1] Redux 状态检查 ===');
try {
  // 尝试从 window 获取 Redux store（Vite/React 可能暴露）
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('✅ Redux DevTools 已检测到');
  }
  // 通过页面加载的数据检查
  const authStorage = localStorage.getItem('auth');
  if (authStorage) {
    try {
      const authData = JSON.parse(authStorage);
      console.log('✅ localStorage.auth 存在');
      console.log('   - token:', authData.token ? `存在 (${authData.token.slice(0,20)}...)` : '❌ 缺失');
      console.log('   - user:', authData.user ? `存在 (${authData.user.username})` : '❌ 缺失');
      console.log('   - isAuthenticated:', authData.isAuthenticated);
    } catch (e) {
      console.error('❌ localStorage.auth 格式无效:', e.message);
    }
  } else {
    console.log('❌ localStorage.auth 不存在');
  }
} catch (e) {
  console.error('❌ 检查失败:', e.message);
}

// ========== 2. 登录并保存 Token ==========
console.log('\n=== [2] 登录 ===');
fetch('http://localhost:8002/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(async r => {
  console.log('   HTTP 状态码:', r.status);
  const data = await r.json();
  
  if (!data.access_token) {
    console.error('❌ 登录失败');
    console.log('   响应:', JSON.stringify(data, null, 2));
    return null;
  }
  
  console.log('✅ 登录成功');
  console.log('   - 用户名:', data.user_info?.username);
  console.log('   - Token:', data.access_token.slice(0,20) + '...');
  
  // ========== 3. 保存到 localStorage ==========
  console.log('\n=== [3] 保存 Token 到 localStorage ===');
  const authData = {
    token: data.access_token,
    user: data.user_info,
    isAuthenticated: true
  };
  localStorage.setItem('auth', JSON.stringify(authData));
  console.log('✅ 已保存到 localStorage.auth');
  
  // ========== 4. 测试 API 请求 ==========
  console.log('\n=== [4] 测试学生列表 API ===');
  const headers = {
    'Authorization': `Bearer ${data.access_token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const studentsRes = await fetch('http://localhost:8002/api/v1/students?page=1&page_size=10', {
      method: 'GET',
      headers: headers
    });
    
    console.log('   HTTP 状态码:', studentsRes.status);
    
    if (studentsRes.status !== 200) {
      const errText = await studentsRes.text();
      console.error('❌ API 返回错误');
      console.log('   响应:', errText.slice(0, 200));
      return null;
    }
    
    const studentsData = await studentsRes.json();
    console.log('✅ API 返回成功');
    console.log('   - 总数:', studentsData.total);
    console.log('   - 本页记录:', studentsData.items?.length || 0);
    
    if (studentsData.items && studentsData.items.length > 0) {
      console.log('   - 示例:', studentsData.items[0].real_name, '-', studentsData.items[0].student_no);
    }
    
  } catch (e) {
    console.error('❌ API 请求失败:', e.message);
    return null;
  }
  
  return data;
})
.then(data => {
  if (!data) return;
  
  console.log('\n=== [5] 刷新页面加载前端 ===');
  console.log('   3秒后刷新...');
  setTimeout(() => {
    console.log('🔄 刷新中...');
    window.location.reload();
  }, 3000);
})
.catch(err => {
  console.error('❌ 诊断过程出错:', err.message);
  console.error('   堆栈:', err.stack);
});
