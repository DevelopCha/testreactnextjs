import { render, screen } from "@testing-library/react";
import Home from "@/pages/index";

// Mock Layout to avoid complex context requirements if any
jest.mock("@/components/Layout", () => {
    return function MockLayout({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    };
});

// Mock IntersectionObserver
beforeAll(() => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
});

describe("Home Page", () => {
    it("renders the hero section", () => {
        render(<Home />);
        expect(screen.getByText("Commerce-Lab")).toBeInTheDocument();
        expect(screen.getByText(/A "Live Textbook" project/i)).toBeInTheDocument();
    });

    it("renders links to main features", () => {
        render(<Home />);
        expect(screen.getByRole("link", { name: /Explore Products/i })).toHaveAttribute("href", "/product");
        expect(screen.getByRole("link", { name: /Try it in Cart/i })).toHaveAttribute("href", "/cart");
    });
});
