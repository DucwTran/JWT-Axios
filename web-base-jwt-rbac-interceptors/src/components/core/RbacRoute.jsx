import { Navigate, Outlet } from 'react-router-dom'
import { roles } from '~/config/roleConfig'
import { usePermission } from '~/hooks/usePermission'

function RbacRoute({
  requiredPermission,
  redirectTo = '/access-denied'
}) {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  const userRole = user.role || roles.CLIENT
  const { hasPermission } = usePermission(userRole)

  if (!hasPermission(requiredPermission)) {
    return <Navigate to={redirectTo}/>
  }
  return (
    <>
      <Outlet />
    </>
  )
}

export default RbacRoute
