import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // 쿠키 삭제
    res.setHeader('Set-Cookie', [
        'passwordVerified=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    ]);

    return res.status(200).json({ success: true });
}
