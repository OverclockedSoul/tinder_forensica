import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

const createJsonFile = (payload: unknown, name = "data.json") =>
  new File([JSON.stringify(payload)], name, { type: "application/json" });

describe("App", () => {
  it("shows an unsupported-file error for malformed uploads", async () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("file-input"), {
      target: {
        files: [createJsonFile({ nope: true })],
      },
    });

    expect(await screen.findByTestId("error-state")).toHaveTextContent("Unsupported file");
  });

  it("renders the insights tree after a valid upload", async () => {
    render(<App />);

    fireEvent.change(screen.getByTestId("file-input"), {
      target: {
        files: [
          createJsonFile({
            Usage: {
              swipes_likes: { "2026-01-01": 5 },
              swipes_passes: { "2026-01-01": 3 },
            },
            Messages: [{ messages: [] }, { messages: [{ message: "hey" }] }],
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("success-state")).toHaveTextContent("Loaded data.json");
    });

    expect(screen.getByTestId("insights-tree")).toBeInTheDocument();
    expect(screen.getByText("You swiped 8 times")).toBeInTheDocument();
    expect(screen.getByText("no chats")).toBeInTheDocument();
  });
});
