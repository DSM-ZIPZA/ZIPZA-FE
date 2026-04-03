import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router"
import { ToastContainer } from "react-toastify"

type Props = {
    router: ReturnType<typeof createBrowserRouter>
    client: QueryClient
}
/**
 * @description Providers component
 * @param router - React Router
 * @param client - React Query Client
 */
export const Providers = ({ router, client }: Props) => {
    return (
        <QueryClientProvider client={client}>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar
                newestOnTop
                closeOnClick
                pauseOnHover={false}
                draggable={false}
                theme="light"
            />
            <RouterProvider router={router} />
        </QueryClientProvider>
    )
}
