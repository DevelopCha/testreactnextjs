import React from 'react';
import { useRouter } from 'next/router';
import { useMypage } from '../../hooks/useMypage';
import { useAuthStore } from '../../store/useAuthStore';

const EMAIL_DOMAINS = [
    { value: 'naver.com', label: 'naver.com' },
    { value: 'gmail.com', label: 'gmail.com' },
    { value: 'daum.net', label: 'daum.net' },
];

const MemberEdit = () => {
    const router = useRouter();
    const setUserType = useAuthStore((state) => state.setUserType);

    const {
        formState,
        isLoading,
        isSaving,
        handleInputChange,
        handleEmailIdChange,
        handleEmailDomainChange,
        handleCustomDomainChange,
        handleAgreementChange,
        requestVerification,
        confirmVerification,
        debugSetVerified,
        saveProfile,
    } = useMypage();

    const handlePasswordChangeClick = () => {
        // Save userType to store before navigating
        setUserType(formState.userType || 'USER'); // Default to USER if empty
        router.push('/member/password');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">회원정보 변경</h1>
                <button
                    onClick={handlePasswordChangeClick}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                    비밀번호 변경
                </button>
            </div>

            <div className="space-y-6">
                {/* 이름 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* 이메일 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <div className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            value={formState.emailId}
                            onChange={handleEmailIdChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-500">@</span>
                        {formState.isCustomDomain ? (
                            <input
                                type="text"
                                value={formState.emailDomain}
                                onChange={handleCustomDomainChange}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="직접입력"
                            />
                        ) : (
                            <input
                                type="text"
                                value={formState.emailDomain}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                        )}
                        <select
                            onChange={handleEmailDomainChange}
                            value={formState.isCustomDomain ? 'direct' : formState.emailDomain}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>선택</option>
                            {EMAIL_DOMAINS.map((domain) => (
                                <option key={domain.value} value={domain.value}>{domain.label}</option>
                            ))}
                            <option value="direct">직접입력</option>
                        </select>
                    </div>

                    {/* 이메일 인증 컨트롤 */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={requestVerification}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            인증 요청
                        </button>
                        <button
                            onClick={confirmVerification}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            인증 확인
                        </button>

                        {/* Debug Checkbox (Cheat) */}
                        <label className="flex items-center space-x-1 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formState.isEmailVerified}
                                onChange={(e) => debugSetVerified(e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className={`text-sm ${formState.isEmailVerified ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                                {formState.isEmailVerified ? '인증됨' : '미인증'}
                            </span>
                        </label>
                    </div>
                </div>

                {/* 휴대폰 번호 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰 번호</label>
                    <input
                        type="text"
                        name="phone"
                        value={formState.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* 성별 (DB: sexyn -> Array: sex_cod) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formState.agreementCodes.includes('sex_cod')}
                            onChange={() => handleAgreementChange('sex_cod')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">남성 (sex_cod)</span>
                    </label>
                </div>

                {/* 약관 동의 (DB: telyn, smsyn -> Array: tel_cod, sms_cod) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">마케팅 수신 동의</label>
                    <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formState.agreementCodes.includes('tel_cod')}
                                onChange={() => handleAgreementChange('tel_cod')}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">전화 수신 (tel_cod)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formState.agreementCodes.includes('sms_cod')}
                                onChange={() => handleAgreementChange('sms_cod')}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">SMS 수신 (sms_cod)</span>
                        </label>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <div className="pt-4">
                    <button
                        onClick={saveProfile}
                        disabled={isSaving}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${isSaving
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSaving ? '저장 중...' : '수정해서 저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberEdit;
