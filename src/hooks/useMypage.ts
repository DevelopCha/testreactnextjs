import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, MypageState } from '../types/MypageTypes';
import { mypageService } from '../api/mypageService';

// Mapping Constants
const AGREEMENT_MAP = {
    sex_cod: 'sexyn',
    tel_cod: 'telyn',
    sms_cod: 'smsyn',
} as const;

export const useMypage = () => {
    const queryClient = useQueryClient();

    // Form State
    const [formState, setFormState] = useState<MypageState>({
        name: '',
        email: '',
        phone: '',
        sexyn: 0,
        telyn: 0,
        smsyn: 0,
        userType: '',
        emailId: '',
        emailDomain: '',
        isCustomDomain: false,
        agreementCodes: [], // UI State for checkboxes
        isEmailVerified: true, // Initial load assumes verified if data exists (or false if strict)
    });

    // 1. Fetch Data
    const { data: userData, isLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: mypageService.fetchUser,
        staleTime: 1000 * 60 * 5,
    });

    // 2. Sync Data to Form State & Transform
    useEffect(() => {
        if (userData) {
            const [emailId, emailDomain] = userData.email.split('@');

            // Transform DB flags (1/0) to Array codes
            const codes: string[] = [];
            if (userData.sexyn === 1) codes.push('sex_cod');
            if (userData.telyn === 1) codes.push('tel_cod');
            if (userData.smsyn === 1) codes.push('sms_cod');

            setFormState({
                ...userData,
                emailId: emailId || '',
                emailDomain: emailDomain || '',
                isCustomDomain: false,
                agreementCodes: codes,
                isEmailVerified: true, // Assume fetched data is verified
            });
        }
    }, [userData]);

    // 3. Mutations
    const saveMutation = useMutation({
        mutationFn: mypageService.updateUser,
        onSuccess: (data, variables) => {
            // Alert showing the payload that was sent/saved
            alert(`저장 성공:\n${JSON.stringify(variables, null, 2)}`);
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: () => alert('저장 실패'),
    });

    const verifyRequestMutation = useMutation({
        mutationFn: mypageService.requestEmailVerification,
        onSuccess: (_, email) => {
            alert(`인증번호가 ${email}로 전송되었습니다.`);
        },
        onError: () => alert('인증번호 전송 실패'),
    });

    const verifyConfirmMutation = useMutation({
        mutationFn: (code: string) =>
            mypageService.confirmEmailVerification(`${formState.emailId}@${formState.emailDomain}`, code),
        onSuccess: (isValid) => {
            if (isValid) {
                setFormState(prev => ({ ...prev, isEmailVerified: true }));
                alert('이메일 인증이 완료되었습니다.');
                queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            } else {
                alert('인증 코드가 올바르지 않습니다.');
            }
        },
        onError: () => alert('인증 확인 중 오류가 발생했습니다.'),
    });

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    // Email Handlers (Reset verification on change)
    const handleEmailIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            emailId: e.target.value,
            isEmailVerified: false
        }));
    };

    const handleEmailDomainChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const value = e.target.value;
        setFormState((prev) => {
            const newState = { ...prev, isEmailVerified: false };
            if (value === 'direct') {
                return { ...newState, isCustomDomain: true, emailDomain: '' };
            }
            return { ...newState, isCustomDomain: false, emailDomain: value };
        });
    };

    const handleCustomDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            emailDomain: e.target.value,
            isEmailVerified: false
        }));
    };

    // Verification Handlers
    const requestVerification = () => {
        const email = `${formState.emailId}@${formState.emailDomain}`;
        if (!formState.emailId || !formState.emailDomain) {
            alert('이메일을 입력해주세요.');
            return;
        }
        verifyRequestMutation.mutate(email);
    };

    const confirmVerification = () => {
        const code = prompt('인증번호를 입력하세요 (Mock: 아무거나 입력)');
        if (code) verifyConfirmMutation.mutate(code);
    };

    const debugSetVerified = (verified: boolean) => {
        setFormState(prev => ({ ...prev, isEmailVerified: verified }));
    };

    // Agreement Handler (Array Logic)
    const handleAgreementChange = (code: string) => {
        setFormState((prev) => {
            const newCodes = prev.agreementCodes.includes(code)
                ? prev.agreementCodes.filter(c => c !== code)
                : [...prev.agreementCodes, code];

            return { ...prev, agreementCodes: newCodes };
        });
    };

    // Save Handler
    const saveProfile = () => {
        if (!formState.isEmailVerified) {
            alert('이메일 인증을 완료해주세요.');
            return;
        }

        const fullEmail = `${formState.emailId}@${formState.emailDomain}`;

        // Transform Array codes back to DB flags
        const payload: UserProfile = {
            name: formState.name,
            email: fullEmail,
            phone: formState.phone,
            sexyn: formState.agreementCodes.includes('sex_cod') ? 1 : 0,
            telyn: formState.agreementCodes.includes('tel_cod') ? 1 : 0,
            smsyn: formState.agreementCodes.includes('sms_cod') ? 1 : 0,
            userType: formState.userType,
        };

        saveMutation.mutate(payload);
    };

    return {
        formState,
        isLoading,
        isSaving: saveMutation.isPending,
        handleInputChange,
        handleEmailIdChange,
        handleEmailDomainChange,
        handleCustomDomainChange,
        handleAgreementChange,
        requestVerification,
        confirmVerification,
        debugSetVerified,
        saveProfile,
    };
};
