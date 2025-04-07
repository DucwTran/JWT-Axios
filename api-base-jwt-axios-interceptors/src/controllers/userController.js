import { StatusCodes } from 'http-status-codes'
import ms from 'ms' //xử lý để đổi từ giờ/ngày/tháng/năm -> ms
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

/*
Mock nhanh thông tin user thay vì phải tạo Database rồi query.
*/
const MOCK_DATABASE = {
  USER: {
    ID: 'trancongduc-sample-id-12345678',
    EMAIL: 'trancongduc@gmail.com',
    PASSWORD: 'trancongduc@gmail.com'
  }
}

/*
  - 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
  - Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
  - Ở đây mình làm Demo thôi nên mới đặt biến const và giá trị random ngẫu nhiên trong code nhé.
*/

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    //Tạo thông tin paypoad để đính kèm trong JWT token: bao gồm id và email của user
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    //Tạo ra 2 loại token là access token và refresh token để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      '1h'
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
      // 15
    )

    /*
    - Xử lý trường hợp trả về http only cookie cho phía trình duyệt
    - Đối với maxAge - Thời gian sống của Cookie thì max là 14 ngày (khác với token life nha)
    */
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    //NẾU DÙNG TOKEN THÌ KHÔNG CẦN DÙNG COOKIE VÀ NGƯỢC LẠI, ĐÂY DEMO CẢ 2 CHO BIẾT THÔI

    //Trả về thông tin user cũng như sẽ trả về Tokens cho trường hợp phía FE cần lưu Tokens vào localStorage
    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    //Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở hàm login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    //Cách 1: Lấy refreshToken luôn từ Cookie đã đính kèm vào request
    // const refreshTokenFromCookie = req.cookies?.refreshToken

    //Cách 2: Từ localstorage phía FE sẽ truyền vào body khi gọi API
    const refreshTokenFromBody = req.body?.refreshToken

    //Verify / Giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      // refreshTokenFromCookie, // Dùng token theo cách 1 ở trên
      refreshTokenFromBody, //Dùng token theo cách 2 ở trên
      REFRESH_TOKEN_SECRET_SIGNATURE
    )

    //Đoạn này chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    //Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )

    //Res lại cookie accessToken mới cho trường hợp sử dụng cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    //Trả về accessToken mới cho trường hợp FE cần update lại trong localstorage
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Refresh Token API failed' })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
