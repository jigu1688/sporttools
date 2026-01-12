// 权限管理工具

// 角色定义
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
}

// 权限定义
export const PERMISSIONS = {
  // 用户管理
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // 学生管理
  STUDENT_READ: 'student:read',
  STUDENT_WRITE: 'student:write',
  STUDENT_DELETE: 'student:delete',
  STUDENT_IMPORT: 'student:import',
  STUDENT_EXPORT: 'student:export',
  
  // 班级管理
  CLASS_READ: 'class:read',
  CLASS_WRITE: 'class:write',
  CLASS_DELETE: 'class:delete',
  CLASS_ASSIGN_TEACHER: 'class:assign_teacher',
  
  // 体测管理
  PHYSICAL_TEST_READ: 'physical_test:read',
  PHYSICAL_TEST_WRITE: 'physical_test:write',
  PHYSICAL_TEST_DELETE: 'physical_test:delete',
  PHYSICAL_TEST_IMPORT: 'physical_test:import',
  PHYSICAL_TEST_EXPORT: 'physical_test:export',
  PHYSICAL_TEST_ANALYZE: 'physical_test:analyze',
  
  // 运动会管理
  SPORTS_MEET_READ: 'sports_meet:read',
  SPORTS_MEET_WRITE: 'sports_meet:write',
  SPORTS_MEET_DELETE: 'sports_meet:delete',
  SPORTS_MEET_MANAGE: 'sports_meet:manage',
  SPORTS_MEET_JUDGE: 'sports_meet:judge',
  
  // 学校管理
  SCHOOL_READ: 'school:read',
  SCHOOL_WRITE: 'school:write',
  SCHOOL_DELETE: 'school:delete',
  
  // 学年管理
  SCHOOL_YEAR_READ: 'school_year:read',
  SCHOOL_YEAR_WRITE: 'school_year:write',
  SCHOOL_YEAR_DELETE: 'school_year:delete',
  SCHOOL_YEAR_MANAGE: 'school_year:manage',
  
  // 统计分析
  STATISTICS_READ: 'statistics:read',
  STATISTICS_EXPORT: 'statistics:export',
  
  // 系统日志
  LOG_READ: 'log:read',
  LOG_EXPORT: 'log:export',
  LOG_DELETE: 'log:delete',
  
  // 系统设置
  SYSTEM_SETTING: 'system:setting'
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // 管理员拥有所有权限
    ...Object.values(PERMISSIONS)
  ],
  [ROLES.TEACHER]: [
    // 教师权限
    PERMISSIONS.USER_READ,
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_WRITE,
    PERMISSIONS.STUDENT_IMPORT,
    PERMISSIONS.STUDENT_EXPORT,
    PERMISSIONS.CLASS_READ,
    PERMISSIONS.CLASS_WRITE,
    PERMISSIONS.CLASS_ASSIGN_TEACHER,
    PERMISSIONS.PHYSICAL_TEST_READ,
    PERMISSIONS.PHYSICAL_TEST_WRITE,
    PERMISSIONS.PHYSICAL_TEST_IMPORT,
    PERMISSIONS.PHYSICAL_TEST_EXPORT,
    PERMISSIONS.PHYSICAL_TEST_ANALYZE,
    PERMISSIONS.SPORTS_MEET_READ,
    PERMISSIONS.SPORTS_MEET_WRITE,
    PERMISSIONS.SPORTS_MEET_MANAGE,
    PERMISSIONS.SPORTS_MEET_JUDGE,
    PERMISSIONS.SCHOOL_READ,
    PERMISSIONS.SCHOOL_YEAR_READ,
    PERMISSIONS.STATISTICS_READ,
    PERMISSIONS.STATISTICS_EXPORT
  ],
  [ROLES.STUDENT]: [
    // 学生权限
    PERMISSIONS.USER_READ,
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.CLASS_READ,
    PERMISSIONS.PHYSICAL_TEST_READ,
    PERMISSIONS.SPORTS_MEET_READ,
    PERMISSIONS.SCHOOL_READ,
    PERMISSIONS.SCHOOL_YEAR_READ,
    PERMISSIONS.STATISTICS_READ
  ]
}

/**
 * 检查用户是否具有指定权限
 * @param {Object} user - 用户对象
 * @param {string|Array} permissions - 权限或权限数组
 * @returns {boolean}
 */
export function hasPermission(user, permissions) {
  if (!user || !user.role) {
    return false
  }
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions]
  
  return permissionsToCheck.every(permission => 
    userPermissions.includes(permission)
  )
}

/**
 * 检查用户是否具有任一指定权限
 * @param {Object} user - 用户对象
 * @param {string|Array} permissions - 权限或权限数组
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !user.role) {
    return false
  }
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions]
  
  return permissionsToCheck.some(permission => 
    userPermissions.includes(permission)
  )
}

/**
 * 检查用户是否具有指定角色
 * @param {Object} user - 用户对象
 * @param {string|Array} roles - 角色或角色数组
 * @returns {boolean}
 */
export function hasRole(user, roles) {
  if (!user || !user.role) {
    return false
  }
  
  const rolesToCheck = Array.isArray(roles) ? roles : [roles]
  return rolesToCheck.includes(user.role)
}

/**
 * 获取用户的所有权限
 * @param {Object} user - 用户对象
 * @returns {Array} 权限数组
 */
export function getUserPermissions(user) {
  if (!user || !user.role) {
    return []
  }
  
  return ROLE_PERMISSIONS[user.role] || []
}

/**
 * 检查路由权限
 * @param {Object} user - 用户对象
 * @param {Object} route - 路由对象
 * @returns {boolean}
 */
export function canAccessRoute(user, route) {
  if (!route.meta || !route.meta.permissions) {
    return true // 没有权限要求的路由，所有用户都可以访问
  }
  
  return hasPermission(user, route.meta.permissions)
}

/**
 * 检查操作权限
 * @param {Object} user - 用户对象
 * @param {string} action - 操作类型
 * @param {string} resource - 资源类型
 * @returns {boolean}
 */
export function canPerformAction(user, action, resource) {
  const permission = `${resource}:${action}`
  return hasPermission(user, permission)
}

/**
 * 创建权限检查器（用于高阶组件）
 * @param {string|Array} permissions - 需要的权限
 * @returns {Function} 检查器函数
 */
export function createPermissionChecker(permissions) {
  return (user) => hasPermission(user, permissions)
}

/**
 * 创建角色检查器（用于高阶组件）
 * @param {string|Array} roles - 需要的角色
 * @returns {Function} 检查器函数
 */
export function createRoleChecker(roles) {
  return (user) => hasRole(user, roles)
}

// 常用权限组合
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE
  ],
  STUDENT_MANAGEMENT: [
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_WRITE,
    PERMISSIONS.STUDENT_DELETE,
    PERMISSIONS.STUDENT_IMPORT,
    PERMISSIONS.STUDENT_EXPORT
  ],
  CLASS_MANAGEMENT: [
    PERMISSIONS.CLASS_READ,
    PERMISSIONS.CLASS_WRITE,
    PERMISSIONS.CLASS_DELETE,
    PERMISSIONS.CLASS_ASSIGN_TEACHER
  ],
  PHYSICAL_TEST_MANAGEMENT: [
    PERMISSIONS.PHYSICAL_TEST_READ,
    PERMISSIONS.PHYSICAL_TEST_WRITE,
    PERMISSIONS.PHYSICAL_TEST_DELETE,
    PERMISSIONS.PHYSICAL_TEST_IMPORT,
    PERMISSIONS.PHYSICAL_TEST_EXPORT,
    PERMISSIONS.PHYSICAL_TEST_ANALYZE
  ],
  SPORTS_MEET_MANAGEMENT: [
    PERMISSIONS.SPORTS_MEET_READ,
    PERMISSIONS.SPORTS_MEET_WRITE,
    PERMISSIONS.SPORTS_MEET_DELETE,
    PERMISSIONS.SPORTS_MEET_MANAGE,
    PERMISSIONS.SPORTS_MEET_JUDGE
  ],
  SCHOOL_MANAGEMENT: [
    PERMISSIONS.SCHOOL_READ,
    PERMISSIONS.SCHOOL_WRITE,
    PERMISSIONS.SCHOOL_DELETE
  ],
  SYSTEM_ADMIN: [
    PERMISSIONS.SCHOOL_YEAR_MANAGE,
    PERMISSIONS.LOG_READ,
    PERMISSIONS.LOG_EXPORT,
    PERMISSIONS.LOG_DELETE,
    PERMISSIONS.SYSTEM_SETTING
  ]
}

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasRole,
  getUserPermissions,
  canAccessRoute,
  canPerformAction,
  createPermissionChecker,
  createRoleChecker,
  PERMISSION_GROUPS
}