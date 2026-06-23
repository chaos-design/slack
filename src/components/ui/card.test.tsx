import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card components", () => {
  it("renders the composed card sections with custom classes", () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="card-header">
          <CardTitle>Theme controls</CardTitle>
          <CardDescription>Pick a colour mood.</CardDescription>
        </CardHeader>
        <CardContent className="custom-content">Palette content</CardContent>
        <CardFooter className="custom-footer">Footer action</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card")).toHaveClass("rounded-lg", "custom-card");
    expect(screen.getByTestId("card-header")).toHaveClass("custom-header");
    expect(screen.getByText("Theme controls")).toHaveClass("text-2xl");
    expect(screen.getByText("Pick a colour mood.")).toHaveClass("text-muted-foreground");
    expect(screen.getByText("Palette content")).toHaveClass("custom-content");
    expect(screen.getByText("Footer action")).toHaveClass("custom-footer");
  });

  it("forwards refs to the underlying card element", () => {
    const ref = createRef<HTMLDivElement>();

    render(<Card ref={ref}>Ref target</Card>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent("Ref target");
  });
});
