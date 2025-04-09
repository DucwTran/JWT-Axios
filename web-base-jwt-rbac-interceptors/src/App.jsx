// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'
import AccessDenied from './pages/AccessDenied'
import NotFound from './pages/NotFound'

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (!user ) return <Navigate to="/login" replace={true} />
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
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/support' element={<Dashboard />} />
        <Route path='/messages' element={<Dashboard />} />
        <Route path='/revuene' element={<Dashboard />} />
        <Route path='/admin-tools' element={<Dashboard />} />
      </Route>

      <Route path='/access-denied' element={<AccessDenied />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
