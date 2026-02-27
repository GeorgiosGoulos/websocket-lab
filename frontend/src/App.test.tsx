import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("given the app renders, then displays the heading and base URL input", () => {
    render(<App />);
    expect(screen.getByText("WebSocket Lab")).toBeInTheDocument();
    expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
  });
});
