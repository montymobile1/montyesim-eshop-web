import { useEffect } from "react";
import { toast } from "react-toastify";

export const useVisibleToastPosition = () => {
  useEffect(() => {
    if (!window.visualViewport) return;

    const updateToastPosition = () => {
      const container = document.querySelector(
        ".Toastify__toast-container--top-center"
      );
      if (container && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const topOffset = window.visualViewport.offsetTop + 16;
        container.style.top = `${topOffset}px`;
      }
    };

    // Update when keyboard opens/closes
    window.visualViewport.addEventListener("resize", updateToastPosition);
    window.visualViewport.addEventListener("scroll", updateToastPosition);

    updateToastPosition(); // Initial position

    return () => {
      window.visualViewport.removeEventListener("resize", updateToastPosition);
      window.visualViewport.removeEventListener("scroll", updateToastPosition);
    };
  }, []);
};
