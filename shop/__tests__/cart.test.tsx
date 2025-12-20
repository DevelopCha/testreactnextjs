import { render, screen, fireEvent } from "@testing-library/react";
import CartPage from "@/pages/cart/index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Mock Layout
jest.mock("@/components/Layout", () => {
    return function MockLayout({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    };
});

// Mock AuthGuard
jest.mock("@/components/AuthGuard", () => {
    return function MockAuthGuard({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    };
});

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
    useQueryClient: jest.fn(),
}));

describe("CartPage", () => {
    const mockInvalidateQueries = jest.fn();

    beforeEach(() => {
        (useQueryClient as jest.Mock).mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
        });
        (useMutation as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
        });
    });

    it("renders empty cart", () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        });

        render(<CartPage />);
        expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });

    it("renders cart items and total", () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: [
                { id: 1, productId: 101, name: "Test Product", price: 1000, quantity: 2, image: "/img.jpg" },
            ],
            isLoading: false,
        });

        render(<CartPage />);
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        const prices = screen.getAllByText("2,000 KRW");
        expect(prices.length).toBeGreaterThan(0); // Item total and Subtotal
        expect(screen.getByText("5,000 KRW")).toBeInTheDocument(); // Total (2000 + 3000 shipping)
    });
});
