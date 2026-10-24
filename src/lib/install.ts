import { create } from "zustand";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export const useInstall = create<{ event: BIPEvent | null; installed: boolean }>(() => ({
  event: null,
  installed: typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches,
}));

export function initInstall() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    useInstall.setState({ event: e as BIPEvent });
  });
  window.addEventListener("appinstalled", () => useInstall.setState({ event: null, installed: true }));
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
}

export async function promptInstall() {
  const e = useInstall.getState().event;
  if (!e) return;
  await e.prompt();
  await e.userChoice.catch(() => null);
  useInstall.setState({ event: null });
}
