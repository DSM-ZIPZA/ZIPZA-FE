import AuthForm from "@/features/auth/ui/AuthForm"

/**
 * @description 로그인 페이지 컴포넌트
 */
const LoginPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <AuthForm type="login" />
        </div>
    )
}

export default LoginPage
