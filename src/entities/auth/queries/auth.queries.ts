import { useMutation } from "@tanstack/react-query"
import type { ILoginRequest, ISignupRequest } from "@/entities/auth/api/auth.api.type"
import { authApi } from "@/entities/auth/api/auth.api"
import { toast } from "react-toastify"

/** 회원가입 뮤테이션 */
export const useSignupMutation = () => {
    return useMutation({
        mutationFn: (params: ISignupRequest) => authApi.signup(params),

        onSuccess: () => {
            toast.success("회원가입 성공")
        },

        onError: (error: any) => {
            const message = error?.response?.data?.message ?? "회원가입에 실패했습니다"
            toast.error(message)
        },
    })
}

/** 로그인 뮤테이션 */
export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (params: ILoginRequest) => authApi.login(params),

        onSuccess: () => {
            toast.success("로그인 성공")
        },

        onError: (error: any) => {
            const message = error?.response?.data?.message ?? "로그인에 실패했습니다"
            toast.error(message)
        },
    })
}

/** 로그아웃 뮤테이션 */
export const useLogoutMutation = () => {
    return useMutation({
        mutationFn: () => authApi.logout(),

        onSuccess: () => {
            toast.success("로그아웃 되었습니다")
        },

        onError: () => {
            toast.error("로그아웃에 실패했습니다")
        },
    })
}
