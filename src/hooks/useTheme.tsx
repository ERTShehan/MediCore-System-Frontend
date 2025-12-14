import { useEffect, useState } from "react";

export function useTheme() {
  // local storage eken theme eka ganna
  const getInitialTheme = (): "light" | "dark" => {
    const savedTheme = localStorage.getItem("medicore-theme") as "light" | "dark";
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    // Initial Load: DOM ekata class eka add karanawa
    const currentTheme = getInitialTheme();
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Listener: button eke thema change karoth update wenna
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem("medicore-theme") as "light" | "dark";
      setTheme(newTheme || "light");
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // State update
    setTheme(newTheme);
    
    // LocalStorage update
    localStorage.setItem("medicore-theme", newTheme);
    
    // DOM update (CSS classes)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Event ekak dispatch karanawa to notify other components
    window.dispatchEvent(new Event("theme-change"));
  };

  return { theme, toggleTheme };
}