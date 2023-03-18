import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "../ui/Header";

describe("Header component", () => {
  it("renders header title", () => {
    render(<Header />);
    expect(screen.getByText(/Visual Logic/i)).toBeDefined();
  });
});
