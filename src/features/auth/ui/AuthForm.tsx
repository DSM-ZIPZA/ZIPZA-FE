import { Input } from "@/shared/ui/Input"
import { Button } from "@/shared/ui/Button"
import { useNavigate } from "react-router"

interface IAuthProp {
    type: "login" | "signup"
}

/**
 * @description 로그인/회원가입 폼 컴포넌트
 */
const AuthForm = ({ type }: IAuthProp) => {
    const navigate = useNavigate()

    return (
        <form className="w-full h-full flex flex-col gap-12 max-w-90 md:max-w-120 xl:max-w-150 max-h-150">
            <div>
                <h1 className="text-blue-500 text-title-medium md:text-title-large">
                    {type == "login" ? "로그인" : "회원가입"}
                </h1>
                <h5 className="text-gray-400 text-body-medium md:text-body-large">저희 서비스에 오신걸 환영해요!</h5>
            </div>

            <div className="flex flex-col gap-7">
                <Input label="아이디" placeholder="아이디를 입력해주세요." />
                <Input label="비밀번호" placeholder="비밀번호를 입력해주세요." type="password" />

                <div className="flex flex-col gap-2">
                    <Button type="submit" className="mt-4">
                        {type == "login" ? "로그인" : "회원가입"}
                    </Button>
                    <div className="w-full flex justify-center items-center gap-2">
                        <p className="text-gray-400">
                            {type == "login" ? "아직 회원이 아니신가요?" : "이미 회원이신가요?"}
                        </p>
                        <span
                            onClick={() => navigate(type === "login" ? "/signup" : "/login")}
                            className="cursor-pointer select-none text-blue-500 text-label-medium"
                        >
                            {type == "login" ? "회원가입하기" : "로그인하기"}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default AuthForm
