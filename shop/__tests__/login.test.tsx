import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/auth/login/index";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

// Mock Layout
jest.mock("@/components/Layout", () => {
    return function MockLayout({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    };
});

// Mock AuthContext
jest.mock("@/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

// Mock useRouter
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

describe("LoginPage", () => {
    const mockLogin = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            query: {},
        });
    });

    it("renders login form", () => {
        render(<LoginPage />);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    });

    it("submits form with valid data", async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "user@example.com" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123!" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({ id: 1, email: "user@example.com", name: "Demo User" });
            expect(mockPush).toHaveBeenCalledWith("/");
        }, { timeout: 3000 });
    });

    it("shows error on invalid credentials", async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "wrong@example.com" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpass" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => {
            expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
