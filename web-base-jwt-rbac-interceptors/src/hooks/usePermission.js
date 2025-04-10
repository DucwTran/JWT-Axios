import { rolePermission } from '~/config/roleConfig'

//Custom hooks kiểm tra quyền hạn của user và permission
export const usePermission = (userRole) => {
  const hasPermission = (requiredPermission) => {
    const allowedPermission = rolePermission[userRole] || []
    return allowedPermission.includes(requiredPermission)
  }
  return { hasPermission }
}