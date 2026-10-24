import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { useGame } from "@/store/game";
import { TopBar } from "@/components/TopBar";
import { Toaster } from "@/components/toast";
import Home from "@/pages/Home";
import Hats from "@/pages/Hats";
import Start from "@/pages/Start";
import JourneyMap from "@/pages/JourneyMap";
import Room from "@/pages/Room";
import Summary from "@/pages/Summary";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

export default function App() {
  const theme = useGame((s) => s.theme);
  const loc = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "chalk" ? "#f3f1ec" : "#0a0a0b");
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <TopBar />
      <motion.div
        key={loc.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      >
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/hats" element={<Hats />} />
            <Route path="/start" element={<Start />} />
            <Route path="/map" element={<JourneyMap />} />
            <Route path="/room/:hat" element={<Room />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/palette" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </motion.div>
      <Toaster />
    </MotionConfig>
  );
}
