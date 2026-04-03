import AuthForm from "@/features/auth/ui/AuthForm"

/**
 * @description 회원가입 페이지 컴포넌트
 */
const SignupPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <AuthForm type="signup" />
        </div>
    )
}

export default SignupPage
