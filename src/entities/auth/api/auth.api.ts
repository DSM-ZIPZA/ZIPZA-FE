import type {
    ILoginRequest,
    ILoginResponse,
    IRefreshRequest,
    IRefreshResponse,
    ISignupRequest,
} from "@/entities/auth/api/auth.api.type"
import { ApiHelper } from "@/shared/api/api.base"
import { API_PATH } from "@/shared/api/api.path"
import type { ApiResponse } from "@/shared/model/api.type"

/** 인증 API */
export const authApi = {
    /**
     * @description 회원가입 API
     * @param {ISignupRequest} body - 회원가입 요청 바디
     */
    signup: async (body: ISignupRequest) => {
        const response = await ApiHelper.post<ApiResponse<ISignupRequest>>(API_PATH.AUTH.SIGNUP, body)
        return response
    },

    /**
     * @description 로그인 API
     * @param {ILoginRequest} body - 로그인 요청 바디
     */
    login: async (body: ILoginRequest) => {
        const response = await ApiHelper.post<ApiResponse<ILoginResponse>>(API_PATH.AUTH.LOGIN, body)
        return response
    },

    /**
     * @description 로그아웃 API
     */
    logout: async () => {
        const response = await ApiHelper.post(API_PATH.AUTH.LOGOUT)
        return response
    },

    /**
     * @description 토큰 재발급 API
     * @param {IRefreshRequest} body - 토큰 재발급 요청 바디
     */
    refresh: async (body: IRefreshRequest) => {
        const response = await ApiHelper.post<ApiResponse<IRefreshResponse>>(API_PATH.AUTH.REFRESH, body)
        return response
    },
}
