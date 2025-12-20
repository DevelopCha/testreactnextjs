import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

type CheckoutForm = {
    address: string;
    detailAddress: string;
    phone: string;
    paymentMethod: "card" | "vbank";
    cardNumber?: string;
};

export default function CheckoutPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const { data: cartItems } = useQuery({
        queryKey: ["cart"],
        queryFn: () => apiClient.get("cart"),
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<CheckoutForm>({
        mode: "onChange",
    });

    const formData = watch();

    // Load from SessionStorage
    useEffect(() => {
        const saved = sessionStorage.getItem("checkout_data");
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach((key) => {
                setValue(key as keyof CheckoutForm, parsed[key]);
            });
        }
    }, [setValue]);

    // Save to SessionStorage
    useEffect(() => {
        const subscription = watch((value) => {
            sessionStorage.setItem("checkout_data", JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = async (data: CheckoutForm) => {
        if (step === 1) {
            setStep(2);
            return;
        }

        // Final Submit
        try {
            await apiClient.post("orders", {
                items: cartItems,
                shipping: {
                    address: data.address,
                    detail: data.detailAddress,
                    phone: data.phone,
                },
                payment: {
                    method: data.paymentMethod,
                },
                date: new Date().toISOString(),
                status: "paid",
                totalAmount: cartItems?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || 0,
            });

            // Clear cart (simulated)
            // In real app, server clears cart
            // Here we might need to manually clear mock db cart or just assume it's done

            sessionStorage.removeItem("checkout_data");
            router.push("/order/result");
        } catch (error) {
            alert("Order failed");
        }
    };

    const totalAmount = cartItems?.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    if (!cartItems || cartItems.length === 0) {
        return (
            <Layout>
                <div className="text-center py-20">Cart is empty</div>
            </Layout>
        );
    }

    return (
        <AuthGuard>
            <Layout>
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                    {/* Steps Indicator */}
                    <div className="flex mb-8">
                        <div className={`flex-1 border-b-4 pb-2 ${step >= 1 ? "border-blue-600 text-blue-600" : "border-gray-200 text-gray-400"}`}>
                            1. Shipping
                        </div>
                        <div className={`flex-1 border-b-4 pb-2 ${step >= 2 ? "border-blue-600 text-blue-600" : "border-gray-200 text-gray-400"}`}>
                            2. Payment
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <input
                                        {...register("address", { required: "Address is required" })}
                                        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="123 Main St"
                                    />
                                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Detail Address</label>
                                    <input
                                        {...register("detailAddress")}
                                        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Apt 4B"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        {...register("phone", { required: "Phone is required" })}
                                        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="010-1234-5678"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="card"
                                            {...register("paymentMethod", { required: true })}
                                        />
                                        Credit Card
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="vbank"
                                            {...register("paymentMethod", { required: true })}
                                        />
                                        Virtual Bank Account
                                    </label>
                                </div>

                                {formData.paymentMethod === "card" && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Card Number</label>
                                        <input
                                            {...register("cardNumber", { required: "Card number is required" })}
                                            className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            placeholder="0000-0000-0000-0000"
                                        />
                                        {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span>{totalAmount?.toLocaleString()} KRW</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {step === 1 ? "Next to Payment" : "Place Order"}
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </AuthGuard>
    );
}
