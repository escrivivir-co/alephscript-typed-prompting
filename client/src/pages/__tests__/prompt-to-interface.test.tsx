import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PromptToInterface from "../prompt-to-interface";

// Mock components and hooks
vi.mock("wouter", () => ({
    useLocation: () => ["/prompt-to-interface", vi.fn()],
    Link: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

vi.mock("@/hooks/use-toast", () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

// Mock API responses
const mockAIConfigs = [{ id: 1, name: "Dummy Model" }];

const mockLibraries = [{ id: 1, name: "Test Library" }];

const mockSchemas = [
    { id: 1, name: "Test Schema", typeScript: "interface Test {}" },
];

const mockStoredPrompts = [
    {
        id: 1,
        name: "Test Prompt",
        content: "Test content",
        modelId: 1,
        modelName: "Dummy Model",
    },
];

describe("PromptToInterface", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        // Mock fetch responses
        global.fetch = vi
            .fn()
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAIConfigs),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockLibraries),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockSchemas),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockStoredPrompts),
                })
            );
    });

    it("renders correctly", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PromptToInterface />
            </QueryClientProvider>
        );

        expect(screen.getByText("Prompt to Interface")).toBeInTheDocument();
    });

    it("loads initial data", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PromptToInterface />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Dummy Model")).toBeInTheDocument();
            expect(screen.getByText("Test Library")).toBeInTheDocument();
        });
    });

    it("handles prompt input", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PromptToInterface />
            </QueryClientProvider>
        );

        const input = screen.getByPlaceholderText(
            "Describe your data structure in natural language..."
        );
        fireEvent.change(input, { target: { value: "Test prompt" } });

        expect(input).toHaveValue("Test prompt");
    });

    it("handles model selection", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PromptToInterface />
            </QueryClientProvider>
        );

        await waitFor(() => {
            const select = screen.getByText("Select a model");
            fireEvent.click(select);
            const option = screen.getByText("Dummy Model");
            fireEvent.click(option);
            expect(screen.getByText("Dummy Model")).toBeInTheDocument();
        });
    });

    it("handles generation", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PromptToInterface />
            </QueryClientProvider>
        );

        const generateButton = screen.getByText("Generate Interfaces");
        fireEvent.click(generateButton);

        await waitFor(() => {
            expect(screen.getByText("Generating...")).toBeInTheDocument();
        });
    });

    it("handles stored prompts", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PromptToInterface />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Test Prompt")).toBeInTheDocument();
        });
    });
});
