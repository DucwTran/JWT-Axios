import { StatusCodes } from 'http-status-codes'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

//Middleware này sẽ đảm nhận nhiệm  vụ quan trọng: Lấy xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  //Cách 1: Lấy accessToken nằm trong request cookies phía client - withCredentials trong file authorizeAxios và credentials trong CORS
  const accessTokenFromCookie = req.cookies?.accessToken
  // console.log('accessTokenFromCookie: ', accessTokenFromCookie)
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json( { message: 'UNAUTHORIZED! Token not found' })
    return
  }

  //Cách 2: Lấy accessToken trong trường hợp FE lưu localStorage và gửi lên thông qua header authorization
  const accessTokenFromHeader = req.headers.authorization
  // console.log('accessTokenFromHeader: ', accessTokenFromHeader)
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json( { message: 'UNAUTHORIZED! Token not found' })
    return
  }

  try {
    // Bước 1: Thực hiện giải mã token xem nó có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      accessTokenFromCookie, // Dùng token theo cách 1
      // accessTokenFromCookie.substring('Bearer '.length), //Dùng token theo cách 2 ở tren
      ACCESS_TOKEN_SECRET_SIGNATURE
    )
    // Bước 2(Quan trọng): Nếu như token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được từ cái req.jwtDecoded, để sử dụng cho các tầng tiếp theo
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Cho phép cái request đó đi tiếp
    next()
  } catch (error) {
    //TH lỗi 01: Nếu các accessToken nó bị hết hạn thì mình cần trả về 1 mã lỗi 410-GONE cho FE để nó gọi lại API refresh
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json( { message: 'Need to refresh Token' })
      return
    }
    //TH lỗi 02: Nếu như các accessToken nó không xử lý hợp lệ hoặc do điều gì đó thì mình thẳng tay trả về mã 401 cho FE để logout
    res.status(StatusCodes.UNAUTHORIZED).json( { message: 'UNAUTHORIZED! Please Login' })
  }

}
export const authMiddleware = {
  isAuthorized
}