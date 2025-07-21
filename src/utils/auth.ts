import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    role: string;
}

export function getUserRole(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.role;
    } catch {
        return null;
    }
}