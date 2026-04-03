/** 회원가입 요청 타입 */
export interface ISignupRequest {
    userId: string
    password: string
}

/** 로그인 요청 타입 */
export interface ILoginRequest {
    loginId: string
    password: string
}

/** 로그인 응답 타입 */
export interface ILoginResponse {
    accessToken: string
    refreshToken: string
    userId: number
    name: string
    role: string
}

/** 토큰 재발급 요청 타입 */
export interface IRefreshRequest {
    refreshToken: string
}

/** 토큰 재발급 응답 타입 */
export interface IRefreshResponse {
    accessToken: string
    refreshToken: string
    userId: number
    name: string
    role: string
}
