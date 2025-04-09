import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT, TAB_URLS } from '~/utils/constants'
import { Button } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleLogoutAPI } from '~/apis'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      setUser(res.data)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    //Gọi API logout
    await handleLogoutAPI()
    //Nếu TH dùng cookie thì xóa userInfo trong localstorage
    // localStorage.removeItem('userInfo')

    //Điều hướng về login nếu logout thành công
    navigate('/login')
  }

  //Nhiệm vụ là lấy giá trị tab dựa theo url sau khi refresh trang
  const getDefaultActiveTab = () => {
    let activeTab = TAB_URLS.DASHBOARD
    Object.values(TAB_URLS).forEach(tab => {
      if (location.pathname.includes(tab)) activeTab = tab
    })
    return activeTab
  }

  const [tab, setTab] = useState(getDefaultActiveTab())
  const handleChange = (event, newTab) => {
    setTab(newTab)
  }

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 1em',
      gap: 2
    }}>
      <Alert severity="info" sx={{ '.MuiAlert-message': { overflow: 'hidden' }, width: { md: 'max-content' } }}>
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>

      <Alert severity="success" variant='outlined'
        sx={{
          '.MuiAlert-message': { overflow: 'hidden' },
          width: { md: 'max-content' }
        }}>
          Role hiện tại đang đăng nhập là :&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.role}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>

      {/*Khu vực phân quyền truy cập. Sử dụng Mui tabs cho đơn giản để test các trang khác nhau */}
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Dashboard" value={TAB_URLS.DASHBOARD} component={Link} to="/dashboard"/>
            <Tab label="Support" value={TAB_URLS.SUPPORT} component={Link} to="/support"/>
            <Tab label="Messages" value={TAB_URLS.MESSAGES} component={Link} to="/messages"/>
            <Tab label="Revuene" value={TAB_URLS.REVENUE} component={Link} to="/revuene"/>
            <Tab label="Admin Tools" value={TAB_URLS.ADMIN_TOOLS} component={Link} to="/admin-tools"/>
          </TabList>
        </Box>
        <TabPanel value={TAB_URLS.DASHBOARD}>
          <Alert severity='success' sx={{ width: 'max-content' }}>
            Nội dung này dành chung cho tất cả các Roles
          </Alert>
        </TabPanel>
        <TabPanel value={TAB_URLS.SUPPORT}>
          <Alert severity='success' sx={{ width: 'max-content' }}>
            Nội dung trang Support!
          </Alert>
        </TabPanel>
        <TabPanel value={TAB_URLS.MESSAGES}>
          <Alert severity='info' sx={{ width: 'max-content' }}>
            Nội dung trang Messages!
          </Alert>
        </TabPanel>
        <TabPanel value={TAB_URLS.REVENUE}>
          <Alert severity='warning' sx={{ width: 'max-content' }}>
            Nội dung trang Revuene!
          </Alert>
        </TabPanel>
        <TabPanel value={TAB_URLS.ADMIN_TOOLS}>
          <Alert severity='error' sx={{ width: 'max-content' }}>
            Nội dung trang Admin Tool!
          </Alert>
        </TabPanel>
      </TabContext>
      <Divider/>

      <Button
        type='button'
        variant='contained'
        color='info'
        size='large'
        sx={{ mt: 2, maxWidth: 'min-content', alignSelf:'flex-end' }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  )
}

export default Dashboard
