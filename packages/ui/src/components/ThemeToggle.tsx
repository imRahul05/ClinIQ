"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../lib/utils";

export interface ThemeToggleProps {
  className?: string;
  theme?: "light" | "dark" | "system";
  onToggle?: () => void;
}

export function ThemeToggle({ className, theme: propTheme, onToggle }: ThemeToggleProps) {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkIsDark = () => {
      if (typeof document !== "undefined") {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };

    checkIsDark();

    // Observe changes on class attribute of <html>
    const observer = new MutationObserver(() => {
      checkIsDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("cliniq_theme_toggle", checkIsDark);

    return () => {
      observer.disconnect();
      window.removeEventListener("cliniq_theme_toggle", checkIsDark);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggle) {
      onToggle();
      return;
    }

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const currentlyDark = root.classList.contains("dark");
      if (currentlyDark) {
        root.classList.remove("dark");
        localStorage.setItem("cliniq_theme", "light");
        setIsDark(false);
      } else {
        root.classList.add("dark");
        localStorage.setItem("cliniq_theme", "dark");
        setIsDark(true);
      }
      window.dispatchEvent(new Event("cliniq_theme_toggle"));
    }
  };

  const showDark = propTheme ? propTheme === "dark" : isDark;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "rounded border border-[var(--line)] bg-[var(--paper-raised)] text-[var(--ink)] hover:bg-[var(--paper-sunken)] size-8 p-0 transition-colors relative cursor-pointer",
        className
      )}
      title={mounted && showDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {mounted && showDark ? (
        <Moon className="size-4 text-sky-400 transition-transform duration-200" />
      ) : (
        <Sun className="size-4 text-amber-500 transition-transform duration-200" />
      )}
    </Button>
  );
}

