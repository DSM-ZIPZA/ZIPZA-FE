import { Navigate, Outlet } from "react-router"
/**
 * @description 토큰에 따른 라우트 가드
 */

const AuthGuard = () => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default AuthGuard
