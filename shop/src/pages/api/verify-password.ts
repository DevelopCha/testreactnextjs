import type { NextApiRequest, NextApiResponse } from 'next';
import { SITE_PASSWORD } from '@/lib/password-config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { password } = req.body;

    // 비밀번호 검증
    if (password === SITE_PASSWORD) {
        // HttpOnly 쿠키 설정 (XSS 공격 방어)
        res.setHeader('Set-Cookie', [
            `passwordVerified=true; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}` // 1일
        ]);

        return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
}
