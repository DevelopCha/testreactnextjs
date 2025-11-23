import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "user@example.com",
            password: "password123!",
        },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            // Simulate API call latency
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock validation
            if (data.email === "user@example.com" && data.password === "password123!") {
                login({ id: 1, email: data.email, name: "Demo User" });
                const redirect = router.query.redirect as string;
                router.push(redirect || "/");
            } else {
                setError("root", { message: "Invalid email or password" });
            }
        } catch (error) {
            setError("root", { message: "An unexpected error occurred" });
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            id="email"
                            {...register("email")}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                            placeholder="user@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="password"
                            type="password"
                            {...register("password")}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                            placeholder="password123!"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
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
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link href="/auth/pw-reset" className="text-gray-500 hover:text-gray-700 hover:underline">
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
