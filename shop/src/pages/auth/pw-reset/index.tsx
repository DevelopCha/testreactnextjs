import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";

const resetSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function PasswordResetPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetForm>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetForm) => {
        setStatus("loading");
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulate random failure for demonstration
            if (Math.random() < 0.1) throw new Error("Network error");

            setStatus("success");
        } catch (error) {
            setStatus("error");
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

                {status === "success" ? (
                    <div className="text-center space-y-4">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h3 className="text-xl font-semibold">Check your email</h3>
                        <p className="text-gray-500">
                            We have sent a password reset link to your email address.
                        </p>
                        <Link href="/auth/login" className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-6">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <p className="text-gray-500 text-sm text-center mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                {...register("email")}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                                placeholder="user@example.com"
                                disabled={status === "loading"}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {status === "error" && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                                Something went wrong. Please try again.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {status === "loading" ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="text-center text-sm">
                            <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </Layout>
    );
}
