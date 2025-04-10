// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'
import AccessDenied from './pages/AccessDenied'
import NotFound from './pages/NotFound'
import RbacRoute from './components/core/RbacRoute'
import { permissions } from './config/roleConfig'

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (!user ) return <Navigate to="/login" replace={true} />
  // console.log(user)
  return <Outlet />
}
const UnauthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (user) return <Navigate to="/dashboard" replace={true} />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <Navigate to="/login" replace={true} />
      } />

      <Route element={<UnauthorizedRoutes />}>
        <Route path='/login' element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route element={<RbacRoute requiredPermission={permissions.VIEW_DASHBOARD}/>}>
          <Route path='/dashboard' element={<Dashboard />} />
          {/*
          Thêm các route mà cần yêu cầu required quyền mới đoực truy cập
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/dashboard' element={<Dashboard />} /> */}
        </Route>
        <Route element={<RbacRoute requiredPermission={permissions.VIEW_SUPPORT}/>}>
          <Route path='/support' element={<Dashboard />} />
        </Route>
        <Route element={<RbacRoute requiredPermission={permissions.VIEW_MESSAGES}/>}>
          <Route path='/messages' element={<Dashboard />} />
        </Route>
        <Route element={<RbacRoute requiredPermission={permissions.VIEW_REVENUE}/>}>
          <Route path='/revuene' element={<Dashboard />} />
        </Route>
        <Route element={<RbacRoute requiredPermission={permissions.VIEW_ADMIN_TOOLS}/>}>
          <Route path='/admin-tools' element={<Dashboard />} />
        </Route>
      </Route>

      <Route path='/access-denied' element={<AccessDenied />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
