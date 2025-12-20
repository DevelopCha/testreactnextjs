import { render, screen } from "@testing-library/react";
import ProductListPage from "@/pages/product/index";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

// Mock Layout
jest.mock("@/components/Layout", () => {
    return function MockLayout({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    };
});

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
    useInfiniteQuery: jest.fn(),
}));

// Mock Intersection Observer Hook
jest.mock("@/hooks/useIntersectionObserver", () => ({
    useIntersectionObserver: jest.fn(),
}));

describe("ProductListPage", () => {
    beforeEach(() => {
        (useIntersectionObserver as jest.Mock).mockReturnValue({
            elementRef: { current: null },
            isIntersecting: false,
        });
    });

    it("renders loading state", () => {
        (useInfiniteQuery as jest.Mock).mockReturnValue({
            status: "pending",
            data: null,
            fetchNextPage: jest.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        });

        render(<ProductListPage />);
        // Check for pulse animation classes or structure
        const skeletons = document.getElementsByClassName("animate-pulse");
        expect(skeletons.length).toBe(4);
    });

    it("renders products", () => {
        (useInfiniteQuery as jest.Mock).mockReturnValue({
            status: "success",
            data: {
                pages: [
                    {
                        data: [
                            { id: 1, name: "Product 1", price: 1000, category: "test", image: "/img1.jpg", stock: 10 },
                            { id: 2, name: "Product 2", price: 2000, category: "test", image: "/img2.jpg", stock: 0 },
                        ],
                    },
                ],
            },
            fetchNextPage: jest.fn(),
            hasNextPage: true,
            isFetchingNextPage: false,
        });

        render(<ProductListPage />);
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
        expect(screen.getByText("SOLD OUT")).toBeInTheDocument();
    });
});
