import { render, screen, fireEvent } from "@testing-library/react";
import ProductDetailPage from "@/pages/product/[id]/index";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

// Mock Layout
jest.mock("@/components/Layout", () => {
    return function MockLayout({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    };
});

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
    useQuery: jest.fn(),
}));

// Mock useRouter
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock("@/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

describe("ProductDetailPage", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { id: "1" },
            push: jest.fn(),
        });
        (useAuth as jest.Mock).mockReturnValue({
            state: { user: { id: 1, name: "Test User" }, isAuthenticated: true },
        });
    });

    it("renders loading state", () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: true,
            data: null,
        });

        render(<ProductDetailPage />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders product details", () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: {
                id: 1,
                name: "Test Product",
                price: 10000,
                image: "/img.jpg",
                category: "test",
                stock: 10,
            },
        });

        render(<ProductDetailPage />);
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("10,000 KRW")).toBeInTheDocument();
    });
});
