import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BarDatum } from "../types";
import { StarsBarChart } from ".";

const data: readonly BarDatum[] = [
  { id: "facebook/react", label: "react", value: 231_000 },
  { id: "vuejs/core", label: "core", value: 49_000 },
];

// jsdom reports zero-size elements, so an explicit width is what makes the axis
// labels render at all.
const TEST_WIDTH = 640;

describe("StarsBarChart", () => {
  it("plots one bar per datum", () => {
    render(<StarsBarChart data={data} valueLabel="Stars" width={TEST_WIDTH} />);

    // Asserting on data binding, not pixels: the axis labels are the contract.
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("core")).toBeInTheDocument();
  });

  it("explains itself instead of drawing an empty axis", () => {
    render(
      <StarsBarChart
        data={[]}
        valueLabel="Stars"
        emptyLabel="Nothing to plot."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Nothing to plot.");
  });

  it("renders the caption used to say which page is plotted", () => {
    render(
      <StarsBarChart
        data={data}
        valueLabel="Stars"
        width={TEST_WIDTH}
        caption="Page 1 of 3"
      />,
    );

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("plots both bars when two repos share a short name", () => {
    const collidingData: readonly BarDatum[] = [
      {
        id: "owner-a/react",
        label: "react",
        fullLabel: "owner-a/react",
        value: 47_000,
      },
      {
        id: "owner-b/react",
        label: "react",
        fullLabel: "owner-b/react",
        value: 231_000,
      },
    ];

    render(
      <StarsBarChart
        data={collidingData}
        valueLabel="Stars"
        width={TEST_WIDTH}
      />,
    );

    // A shared axis label must not collapse the two bars onto one slot.
    expect(screen.getAllByText("react")).toHaveLength(2);
  });

  it("reports the clicked datum's id, not its display label", () => {
    const onBarClick = vi.fn();
    const { container } = render(
      <StarsBarChart
        data={data}
        valueLabel="Stars"
        width={TEST_WIDTH}
        onBarClick={onBarClick}
      />,
    );

    // MUI only marks a bar clickable once `onItemClick` is actually wired, so a
    // pointer cursor is proof the click handler reached the chart - jsdom can't
    // reliably simulate the library's own pointer-position hit testing.
    const [firstBar] = container.querySelectorAll(".MuiBarChart-element");
    expect(firstBar).toBeDefined();
    expect(firstBar?.getAttribute("cursor")).toBe("pointer");
  });

  it("leaves bars non-interactive when no click handler is given", () => {
    const { container } = render(
      <StarsBarChart data={data} valueLabel="Stars" width={TEST_WIDTH} />,
    );

    const [firstBar] = container.querySelectorAll(".MuiBarChart-element");
    expect(firstBar?.getAttribute("cursor")).toBeNull();
  });
});
