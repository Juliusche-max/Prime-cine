import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Regarder</Button>);
    expect(screen.getByRole("button", { name: "Regarder" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ajouter</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Indisponible
      </Button>
    );
    await userEvent.click(screen.getByRole("button", { name: "Indisponible" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the primary variant by default", () => {
    render(<Button>Défaut</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-prime");
  });

  it("applies the outline variant when specified", () => {
    render(<Button variant="outline">Contour</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-mist/40");
  });
});
