import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { mypageService } from '../api/mypageService';

// Validation Schema
const passwordSchema = z.object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z
        .string()
        .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
        .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다.')
        .regex(/[0-9]/, '숫자를 포함해야 합니다.')
        .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: '새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.',
    path: ['newPassword'],
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export const usePasswordChange = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        mode: 'onChange', // Validate on change for immediate feedback
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: PasswordFormValues) =>
            mypageService.changePassword(data.currentPassword, data.newPassword),
        onSuccess: () => {
            alert('비밀번호가 성공적으로 변경되었습니다.');
            reset();
        },
        onError: (error: Error) => {
            alert(`변경 실패: ${error.message}`);
        },
    });

    const onSubmit = (data: PasswordFormValues) => {
        changePasswordMutation.mutate(data);
    };

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        isValid,
        isSubmitting: changePasswordMutation.isPending,
    };
};
