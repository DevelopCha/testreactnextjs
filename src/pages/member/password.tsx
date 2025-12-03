import React from 'react';
import { useRouter } from 'next/router';
import { usePasswordChange } from '../../hooks/usePasswordChange';

const PasswordChange = () => {
    const router = useRouter();
    const { register, handleSubmit, errors, isValid, isSubmitting, userType } = usePasswordChange();

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">비밀번호 변경</h1>

            {/* UserType Display */}
            <div className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-600">
                현재 사용자 타입: <span className="font-bold text-blue-600">{userType || '없음 (직접 접근)'}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 현재 비밀번호 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                    <input
                        type="password"
                        {...register('currentPassword')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.currentPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                    />
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.currentPassword.message}</p>
                    )}
                </div>

                {/* 새 비밀번호 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                    <input
                        type="password"
                        {...register('newPassword')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.newPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                    />
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>

                {/* 새 비밀번호 확인 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                    <input
                        type="password"
                        {...register('confirmPassword')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* 버튼 영역 */}
                <div className="pt-4 flex space-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${!isValid || isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? '변경 중...' : '변경하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChange;
