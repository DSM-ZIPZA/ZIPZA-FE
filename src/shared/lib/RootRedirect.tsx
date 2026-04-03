import { Navigate } from "react-router"

const RootRedirect = () => {
    const token = localStorage.getItem("accessToken")

    return <Navigate to={token ? "/home" : "/login"} replace />
}

export default RootRedirect
