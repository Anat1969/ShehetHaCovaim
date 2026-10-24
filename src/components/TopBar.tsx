import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useGame, useActiveJourney } from "@/store/game";
import { DEV_CHAT_URL } from "@/lib/hats";
import { useInstall, promptInstall } from "@/lib/install";
import { copyText } from "@/lib/plan";
import { toast } from "@/components/toast";

export function TopBar() {
  const theme = useGame((s) => s.theme);
  const setTheme = useGame((s) => s.setTheme);
  const active = useActiveJourney();
  const canInstall = useInstall((s) => !!s.event);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname, loc.search]);

  async function copyLink() {
    const ok = await copyText(window.location.href);
    toast(ok ? "הקישור הועתק" : "ההעתקה נכשלה");
  }
  const toggleTheme = () => setTheme(theme === "obsidian" ? "chalk" : "obsidian");
  const themeLabel = theme === "obsidian" ? "מצב בהיר" : "מצב כהה";

  const links = (
    <>
      {active && <NavLink to="/map">המסע שלי</NavLink>}
      <NavLink to="/profile">פרופיל החשיבה</NavLink>
      <NavLink to="/hats">הכובעים</NavLink>
    </>
  );
  const tools = (
    <>
      <button className="link" onClick={copyLink}>העתקת קישור</button>
      <a href={DEV_CHAT_URL} target="_blank" rel="noreferrer">שיחת הפיתוח</a>
      <button className="link" onClick={toggleTheme} aria-label="החלפת מצב תצוגה">{themeLabel}</button>
      {canInstall && <button className="link" onClick={promptInstall}>התקנת האפליקציה</button>}
    </>
  );

  return (
    <header className="topbar no-print">
      <div className="topbar__in">
        <Link to="/" className="brand" aria-label="ששת הכובעים, לדף הבית">
          <span className="brand__mark"><img src="/icons/icon-192.png" alt="" /></span>
          <span>ששת הכובעים</span>
        </Link>
        <nav className="topnav" aria-label="ניווט ראשי">
          {links}
          <span className="sep" />
          {tools}
        </nav>
        <button className="btn btn--ghost btn--sm topbar__menu" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "סגירה" : "תפריט"}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <Link to="/">דף הבית</Link>
            {links}
            {tools}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
