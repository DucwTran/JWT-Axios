import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis'

//Khởi tạo 1 đối tượng Axios mục đích để custom và cấu hình chung cho dự án
let authorizedAxiosInstance = axios.create()

//Thời gian chờ tối đa của 1 request: để 10p
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

//withCredentials: Sẽ cho phép axios tự động đính kèm và gửi cookie trong mỗi request lên BE
//(Phục vụ trường hợp chúng ta lưu JWT Token vào trong httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true


//Cấu hình Interceptors(Bộ đánh chặn vào giữa mọi Request và Response)
// Add a request interceptor: Can thiệp vào giữa những API request
authorizedAxiosInstance.interceptors.request.use( (config) => {
  //Lấy accessToken từ localStorage và đính kèm vào header
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    //Cần thêm  "Bearer" vì chúng ta tuân thủ theo tiêu chuẩn 0Auth 2.0 trong việc xác định loại token đang sử dụng
    //Bearer là định nghĩa loại Token dành cho việc xác thực và ủy quyền, tham khảo các loại token khác như: Basic token, Digest Tokenm 0Auth Token,..
    config.headers.Authorization = `Bearer ${accessToken }`
  }

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

//Khởi tạo 1 cái promise cho việc gọi api refresh_token
//Mục đích: để khi nhận yêu cầu refreshToken đầu tiên thì hold việc gọi API refresh_token cho tới khi xong xuôi thì mới retry lại những api bị lỗi
//trước đó thay vì cứ thế gọi lại refreshTokenAPI liên tục với mỗi request lỗi
let refreshTokenPromise = null

// Add a response interceptor: Can thiệp vào giữa những response trả về
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Any status code that lie within the range of 200-299 cause this function to trigger
  // Do something with response data
  return response
}, (error) => {
  //Xử lý RefreshToken tự động
  //Nếu như nhận mã 410 thì gọi API logout
  if (error.response?.status === 401) {
    handleLogoutAPI().then(() => {
      location.href = '/login'
    })
  }

  //Nếu nhận được mã 410 từ BE thì sẽ gọi API refresh token để làm mới lại accessToken
  //Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
  const originalRequest = error.config
  if (error.response?.status === 410 && originalRequest) {
    if (!refreshTokenPromise) {
      //Lấy refreshToken từ localStorage( cho trường hợp localStorage)
      const refreshToken = localStorage.getItem('refreshToken')
      //Gọi API refresh Token
      refreshTokenPromise = refreshTokenAPI(refreshToken)
        .then((res) => {
          //Lấy và gán lại access token từ local storage( Cho trường hợp localStorage)
          const { accessToken } = res.data
          localStorage.setItem('accessToken', accessToken)
          authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`

          //Đồng thời lưu ý là accessToken cũng đã được update lại ở Cookie rồi( cho trường hợp Cookie), không cần 3 dòng code trên

        })
        .catch((_error) => {
          handleLogoutAPI().then(() => {
            location.href = '/login'
          })
          return Promise.reject(_error)
        })
        .finally(() => {
          //Dù API refresh_token có thành công hay lỗi thì vẫn luôn gán lại promiseAPI này về null như ban đầu
          refreshTokenPromise = null
        })
    }

    //Cuối cùng mới return cái refresh_tokenPromise trong trường hợp success ở đây
    return refreshTokenPromise.then(() => {
      //Quan trọng: return lại axios instance của chúng ta kết hợp cái originRequest để gọi lại những API bị lỗi
      return authorizedAxiosInstance(originalRequest)
    })

  }

  /*
  - Any status codes that falls outside the range of 200-299 cause this function to trigger
  - Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây(Clean Code)
  - Console.log ra để thấy cấu trúc của error để biết chấm tới message ở đâu
  - Dùng Toastify để hiển thị ra bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410(mã GONE phục vụ việc tự động refresh lại token)
  */
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message )
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance

/*
CÓ 2 KIỂU KIỂM TRA VÀ SỬ DỤNG TRẠNG THÁI ĐĂNG NHẬP:
1.Dùng Token(Access và Refresh) để lưu vào localStorage
2.Dùng Cookie -> HttpOnly Cookie
*/