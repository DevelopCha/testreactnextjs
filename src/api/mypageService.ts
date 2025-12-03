import { UserProfile } from '../types/MypageTypes';

// Configuration Flag
const USE_MOCK_API = true;

interface MypageApi {
    fetchUser(): Promise<UserProfile>;
    updateUser(data: UserProfile): Promise<UserProfile>;
    requestEmailVerification(email: string): Promise<void>;
    confirmEmailVerification(email: string, code: string): Promise<boolean>;
    changePassword(currentPw: string, newPw: string): Promise<boolean>;
}

// Mock Implementation
const MockApi: MypageApi = {
    fetchUser: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    name: '홍길동',
                    email: 'test@mail.com',
                    phone: '010-1234-5678',
                    sexyn: 1, // Male checked
                    telyn: 0,
                    smsyn: 1, // SMS checked
                    userType: 'USER',
                });
            }, 500);
        });
    },
    updateUser: async (data: UserProfile) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Mock Update:', data);
                resolve(data);
            }, 500);
        });
    },
    requestEmailVerification: async (email: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Verification requested for ${email}`);
                // Removed alert()
                resolve();
            }, 500);
        });
    },
    confirmEmailVerification: async (email: string, code: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Verifying ${email} with code ${code}`);
                // Mock: Always succeed for now
                resolve(true);
            }, 500);
        });
    },
    changePassword: async (currentPw: string, newPw: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Changing password from ${currentPw} to ${newPw}`);
                if (currentPw === '1234') { // Mock correct password
                    resolve(true);
                } else {
                    reject(new Error('현재 비밀번호가 일치하지 않습니다.'));
                }
            }, 500);
        });
    },
};

// Real Implementation
const RealApi: MypageApi = {
    fetchUser: async () => { throw new Error('Not implemented'); },
    updateUser: async () => { throw new Error('Not implemented'); },
    requestEmailVerification: async () => { throw new Error('Not implemented'); },
    confirmEmailVerification: async () => { throw new Error('Not implemented'); },
    changePassword: async () => { throw new Error('Not implemented'); },
};

export const mypageService = USE_MOCK_API ? MockApi : RealApi;
