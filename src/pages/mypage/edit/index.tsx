import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { apiClient } from "@/lib/api-client";

interface EditProfileForm {
    name: string;
    email: string; // Read-only usually
}

export default function EditProfilePage() {
    const { state, login } = useAuth(); // login used to update context
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { isSubmitting },
    } = useForm<EditProfileForm>();

    useEffect(() => {
        if (state.user) {
            setValue("name", state.user.name);
            setValue("email", state.user.email);
        }
    }, [state.user, setValue]);

    const onSubmit = async (data: EditProfileForm) => {
        // Simulate API update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update local context
        if (state.user) {
            const updatedUser = { ...state.user, name: data.name };
            login(updatedUser); // Update context
            alert("Profile updated successfully!");
            router.push("/mypage");
        }
    };

    return (
        <AuthGuard>
            <Layout>
                <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                    <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                {...register("email")}
                                disabled
                                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                {...register("name", { required: "Name is required" })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </AuthGuard>
    );
}
