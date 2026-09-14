import { defineStore } from "pinia";

const STORAGE_KEY = "chatSystem.theme";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: false,
  }),
  actions: {
    applyToDom() {
      if (this.isDark) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    },
    init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.isDark = saved === "dark";
      this.applyToDom();
    },
    toggle() {
      this.isDark = !this.isDark;
      localStorage.setItem(STORAGE_KEY, this.isDark ? "dark" : "light");
      this.applyToDom();
    },
  },
});