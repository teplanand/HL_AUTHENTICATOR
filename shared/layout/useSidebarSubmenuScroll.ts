// utils/useSidebarSubmenuScroll.ts
import { useEffect } from "react";

export function useSidebarSubmenuScroll() {
  useEffect(() => {
    const applyScroll = () => {
      document
        .querySelectorAll("nav .css-1njlo2q")
        .forEach((container: any) => {
          if (!container) return;

          container.style.maxHeight = "25vh";
          container.style.overflow = "visible";

          const paper = container.querySelector(".MuiPaper-root");
          if (paper) {
            paper.style.maxHeight = "25vh";
            paper.style.overflow = "hidden";
          }

          const list = container.querySelector(".MuiList-root");
          if (list) {
            list.style.maxHeight = "25vh";
            list.style.overflowY = "auto";
            list.style.overflowX = "hidden";
          }
        });
    };

    applyScroll();

    // 👇 submenu hover / open pe dobara apply
    document.addEventListener("mouseover", applyScroll);
    window.addEventListener("resize", applyScroll);

    return () => {
      document.removeEventListener("mouseover", applyScroll);
      window.removeEventListener("resize", applyScroll);
    };
  }, []);
}
