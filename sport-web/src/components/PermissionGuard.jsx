import React from 'react'
import { useSelector } from 'react-redux'
import { hasPermission, hasRole, canPerformAction } from '../utils/permissions'

/**
 * 权限控制组件 - 根据用户权限显示/隐藏子组件
 * @param {Object} props
 * @param {string|Array} props.permissions - 需要的权限
 * @param {string|Array} props.roles - 需要的角色
 * @param {string} props.action - 操作类型
 * @param {string} props.resource - 资源类型
 * @param {boolean} props.requireAll - 是否需要所有权限（默认true）
 * @param {ReactNode} props.children - 子组件
 * @param {ReactNode} props.fallback - 无权限时的替代组件
 */
export const PermissionGuard = ({
  permissions,
  roles,
  action,
  resource,
  requireAll = true,
  children,
  fallback = null
}) => {
  const { user } = useSelector((state) => state.auth)

  // 检查权限
  let hasRequiredPermission = true

  if (permissions) {
    if (requireAll) {
      hasRequiredPermission = hasPermission(user, permissions)
    } else {
      hasRequiredPermission = hasAnyPermission(user, permissions)
    }
  }

  // 检查角色
  let hasRequiredRole = true
  if (roles) {
    hasRequiredRole = hasRole(user, roles)
  }

  // 检查操作权限
  let hasActionPermission = true
  if (action && resource) {
    hasActionPermission = canPerformAction(user, action, resource)
  }

  const isAuthorized = hasRequiredPermission && hasRequiredRole && hasActionPermission

  return isAuthorized ? children : fallback
}

/**
 * 检查用户是否有任意权限
 */
function hasAnyPermission(user, permissions) {
  if (!user || !user.role) {
    return false
  }
  
  // 这里需要导入权限配置，为避免循环依赖，直接实现
  const ROLE_PERMISSIONS = {
    admin: [
      'user:read', 'user:write', 'user:delete',
      'student:read', 'student:write', 'student:delete', 'student:import', 'student:export',
      'class:read', 'class:write', 'class:delete', 'class:assign_teacher',
      'physical_test:read', 'physical_test:write', 'physical_test:delete', 'physical_test:import', 'physical_test:export', 'physical_test:analyze',
      'sports_meet:read', 'sports_meet:write', 'sports_meet:delete', 'sports_meet:manage', 'sports_meet:judge',
      'school:read', 'school:write', 'school:delete',
      'school_year:read', 'school_year:write', 'school_year:delete', 'school_year:manage',
      'statistics:read', 'statistics:export',
      'log:read', 'log:export', 'log:delete',
      'system:setting'
    ],
    teacher: [
      'user:read',
      'student:read', 'student:write', 'student:import', 'student:export',
      'class:read', 'class:write', 'class:assign_teacher',
      'physical_test:read', 'physical_test:write', 'physical_test:import', 'physical_test:export', 'physical_test:analyze',
      'sports_meet:read', 'sports_meet:write', 'sports_meet:manage', 'sports_meet:judge',
      'school:read',
      'school_year:read',
      'statistics:read', 'statistics:export'
    ],
    student: [
      'user:read',
      'student:read',
      'class:read',
      'physical_test:read',
      'sports_meet:read',
      'school:read',
      'school_year:read',
      'statistics:read'
    ]
  }

  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions]
  
  return permissionsToCheck.some(permission => 
    userPermissions.includes(permission)
  )
}

/**
 * 角色检查组件 - 简化的角色检查
 */
export const RoleGuard = ({ roles, children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth)
  const isAuthorized = hasRole(user, roles)
  
  return isAuthorized ? children : fallback
}

/**
 * 权限检查Hook
 */
export const usePermission = (permissions, requireAll = true) => {
  const { user } = useSelector((state) => state.auth)
  return requireAll ? hasPermission(user, permissions) : hasAnyPermission(user, permissions)
}

/**
 * 角色检查Hook
 */
export const useRole = (roles) => {
  const { user } = useSelector((state) => state.auth)
  return hasRole(user, roles)
}

/**
 * 操作权限检查Hook
 */
export const useActionPermission = (action, resource) => {
  const { user } = useSelector((state) => state.auth)
  return canPerformAction(user, action, resource)
}

/**
 * 高阶组件：权限控制
 */
export const withPermission = (permissions, requireAll = true, fallback = null) => {
  return (WrappedComponent) => {
    return (props) => {
      const { user } = useSelector((state) => state.auth)
      const hasRequiredPermission = requireAll 
        ? hasPermission(user, permissions)
        : hasAnyPermission(user, permissions)
      
      if (!hasRequiredPermission) {
        return fallback
      }
      
      return <WrappedComponent {...props} />
    }
  }
}

/**
 * 高阶组件：角色控制
 */
export const withRole = (roles, fallback = null) => {
  return (WrappedComponent) => {
    return (props) => {
      const { user } = useSelector((state) => state.auth)
      const isAuthorized = hasRole(user, roles)
      
      if (!isAuthorized) {
        return fallback
      }
      
      return <WrappedComponent {...props} />
    }
  }
}

/**
 * 权限按钮组件
 */
export const PermissionButton = ({
  permissions,
  roles,
  action,
  resource,
  children,
  disabled = false,
  ...props
}) => {
  const { user } = useSelector((state) => state.auth)

  let hasRequiredPermission = true

  if (permissions) {
    hasRequiredPermission = hasPermission(user, permissions)
  }

  if (roles) {
    hasRequiredPermission = hasRequiredPermission && hasRole(user, roles)
  }

  if (action && resource) {
    hasRequiredPermission = hasRequiredPermission && canPerformAction(user, action, resource)
  }

  return (
    <button
      {...props}
      disabled={disabled || !hasRequiredPermission}
      title={!hasRequiredPermission ? '您没有权限执行此操作' : undefined}
    >
      {children}
    </button>
  )
}

/**
 * 权限链接组件
 */
export const PermissionLink = ({
  permissions,
  roles,
  action,
  resource,
  children,
  to,
  fallback = null,
  ...props
}) => {
  const { user } = useSelector((state) => state.auth)

  let hasRequiredPermission = true

  if (permissions) {
    hasRequiredPermission = hasPermission(user, permissions)
  }

  if (roles) {
    hasRequiredPermission = hasRequiredPermission && hasRole(user, roles)
  }

  if (action && resource) {
    hasRequiredPermission = hasRequiredPermission && canPerformAction(user, action, resource)
  }

  if (!hasRequiredPermission) {
    return fallback
  }

  return (
    <a href={to} {...props}>
      {children}
    </a>
  )
}

export default PermissionGuard