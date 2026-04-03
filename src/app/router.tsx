import LoginPage from "@/pages/login/LoginPage"
import SignupPage from "@/pages/signup/SignupPage"
import AuthGuard from "@/shared/lib/AuthGuard"
import RootRedirect from "@/shared/lib/RootRedirect"
import { createBrowserRouter } from "react-router"

export const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <RootRedirect />,
        },
        {
            children: [
                {
                    path: "/login",
                    element: <LoginPage />,
                },
                {
                    path: "/signup",
                    element: <SignupPage />,
                },
                {
                    element: <AuthGuard />,
                    children: [
                        {
                            path: "/home",
                            // element: <HomePage />,
                        },
                    ],
                },
            ],
        },
    ],
    {
        basename: "/",
    }
)
