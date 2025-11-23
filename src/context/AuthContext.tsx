import React, { createContext, useContext, useReducer, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

type Action =
    | { type: "LOGIN_SUCCESS"; payload: User }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

const AuthContext = createContext<{
    state: AuthState;
    login: (user: User) => void;
    logout: () => void;
} | null>(null);

function authReducer(state: AuthState, action: Action): AuthState {
    switch (action.type) {
        case "LOGIN_SUCCESS":
            return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
        case "LOGOUT":
            return { ...state, user: null, isAuthenticated: false, isLoading: false };
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        // Check localStorage or session on mount
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            dispatch({ type: "LOGIN_SUCCESS", payload: JSON.parse(storedUser) });
        } else {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, []);

    const login = (user: User) => {
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
    };

    const logout = () => {
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
    };

    return (
        <AuthContext.Provider value={{ state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
