// Author: TrungQuanDev: https://youtube.com/@trungquandev
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'

// Config react-toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Config react-router-dom with BrowserRouter
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/'>
    <CssBaseline />
    <App />
    <ToastContainer position="bottom-left" theme="colored" />
  </BrowserRouter>
)

/*
🔵 React FE
  ↓
🟣 Axios Request Interceptor ✅ ← bạn gắn token ở đây
  ↓
🌐 Browser → Gửi HTTP request
  ↓
🟡 BE Middleware (auth, parse, CORS...)
  ↓
🟠 BE Controller
  ↓
🔴 BE Service / DB
  ↓
🟢 BE Trả về response
  ↓
🟣 Axios Response Interceptor ✅ ← bạn hiển thị toast ở đây
  ↓
🔵 React nhận data, update UI

*/