import { create } from 'zustand';

interface AuthState {
    userType: string;
    setUserType: (type: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    userType: '',
    setUserType: (type) => set({ userType: type }),
}));
