import { useId, useState, type ComponentProps } from "react"
import clsx from "clsx"
import { Eye, EyeOff } from "lucide-react"

export type InputState = "default" | "error" | "success"

type Props = ComponentProps<"input"> & {
    label?: string
    variant?: "input" | "textarea"
    state?: InputState
    message?: string
}

const STATE_STYLE: Record<InputState, string> = {
    default: "border-gray-300 focus-within:border-blue-600",
    error: "border-red-500 focus-within:border-red-500",
    success: "border-green-500 focus-within:border-green-500",
}

const MESSAGE_STYLE: Record<InputState, string> = {
    default: "text-gray-400",
    error: "text-red-500",
    success: "text-green-600",
}

export const Input = ({
    label,
    type = "text",
    variant = "input",
    className,
    state = "default",
    message,
    ...props
}: Props) => {
    const id = useId()
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    return (
        <div className="flex w-full flex-col gap-2">
            {label && (
                <label htmlFor={id} className="cursor-text text-label-large text-gray-800">
                    {label}
                </label>
            )}

            <div
                className={clsx(
                    "flex items-center rounded-xl p-4 bg-white border transition-colors duration-200",
                    STATE_STYLE[state]
                )}
            >
                {variant === "textarea" ? (
                    <textarea
                        id={id}
                        className={clsx(
                            "w-full resize-none bg-transparent",
                            "text-base leading-6",
                            "text-gray-900",
                            "placeholder:text-gray-400",
                            "focus-visible:outline-none",
                            "h-100",
                            className
                        )}
                        {...(props as ComponentProps<"textarea">)}
                    />
                ) : (
                    <>
                        <input
                            id={id}
                            type={inputType}
                            className={clsx(
                                "w-full bg-transparent",
                                "text-base leading-6",
                                "text-gray-900",
                                "placeholder:text-gray-400",
                                "focus-visible:outline-none",
                                className
                            )}
                            {...props}
                        />

                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="ml-2 text-gray-500"
                                tabIndex={-1}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        )}
                    </>
                )}
            </div>

            {message && <p className={clsx("text-sm ml-1", MESSAGE_STYLE[state])}>{message}</p>}
        </div>
    )
}
