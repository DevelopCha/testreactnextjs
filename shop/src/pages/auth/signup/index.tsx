import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import { apiClient } from "@/lib/api-client";

const signupSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[a-z]/, "Must contain at least one lowercase letter")
            .regex(/[0-9]/, "Must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupForm) => {
        try {
            // Simulate API call
            await apiClient.post("users", {
                email: data.email,
                name: data.name,
                password: data.password,
                role: "user",
            });

            alert("Signup successful! Please login.");
            router.push("/auth/login");
        } catch (error) {
            setError("root", { message: "Signup failed. Please try again." });
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            {...register("email")}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                            placeholder="user@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            {...register("name")}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                            placeholder="John Doe"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            {...register("password")}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                            placeholder="Min 8 chars, 1 upper, 1 lower, 1 number, 1 special"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm Password</label>
                        <input
                            type="password"
                            {...register("confirmPassword")}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {errors.root && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                            {errors.root.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Signing up..." : "Sign Up"}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                        Login
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
