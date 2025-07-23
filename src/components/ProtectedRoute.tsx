import { get } from "http";
import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "@/utils/auth";

interface Props {
    allowedRoles: string[];
    children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: Props) => {
    const role = getUserRole();
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/notfoundpage" replace />;
    }

    return <>{children} </>;
};

export default ProtectedRoute;