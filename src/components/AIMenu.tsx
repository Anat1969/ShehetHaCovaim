import { DEV_CHAT_URL } from "@/lib/hats";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "ai-menu": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string; research?: string };
    }
  }
}

/** The A&I logo button (https://appofapp-gh.vercel.app/ai-menu.js): copy link, development chat and install live inside it. */
export function AIMenu() {
  return <ai-menu chat={DEV_CHAT_URL} />;
}
