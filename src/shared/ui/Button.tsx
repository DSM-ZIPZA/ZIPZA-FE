import { memo, type ComponentProps } from "react"
import clsx from "clsx"

type Props = ComponentProps<"button"> & {
    fullWidth?: boolean
}

export const Button = memo(function Button({
    fullWidth = true,
    type = "button",
    children,
    disabled,
    className,
    ...props
}: Props) {
    return (
        <button
            type={type}
            disabled={disabled}
            aria-disabled={disabled}
            className={clsx(
                "inline-flex items-center justify-center",
                "h-14 px-4 py-2 rounded-lg",
                "bg-blue-600 text-white",
                "text-label-large",
                "hover:bg-blue-700",
                "focus-visible:outline focus-visible:outline-offset-2",
                "focus-visible:outline-blue-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                fullWidth ? "w-full" : "w-fit",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
})
