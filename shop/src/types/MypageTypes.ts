export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    // DB flags (1 or 0)
    sexyn: number;
    telyn: number;
    smsyn: number;
    userType: string;
}

export interface MypageState extends UserProfile {
    emailId: string;
    emailDomain: string;
    isCustomDomain: boolean;

    // UI State
    agreementCodes: string[]; // ['sex_cod', 'tel_cod', 'sms_cod']
    isEmailVerified: boolean;
}

export interface UpdateProfileRequest {
    name: string;
    email: string;
    phone: string;
    sexyn: number;
    telyn: number;
    smsyn: number;
}
