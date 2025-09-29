import { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

type Props = {
  onSubmit: (value: string) => void | Promise<void>;
};

export default function SearchTV({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [centerAlive, setCenterAlive] = useState(true);   // центр рендерится?
  const [dockAlive, setDockAlive] = useState(false);      // док справа-верх рендерится?
  const [flashKey, setFlashKey] = useState(0);            // перезапуск вспышки
  const centerCtrl = useAnimationControls();

  // основная последовательность
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    onSubmit(value);

    // 1) TV-OFF: высота -> линия
    setFlashKey(k => k + 1); // запустить вспышку
    await centerCtrl.start({
      scaleY: 0.06,
      transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] }, // fast-in-out
    });
    // 2) линия -> точка и исчезаем
    await centerCtrl.start({
      scaleX: 0.02,
      borderRadius: 999,
      opacity: 0,
      transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
    });

    // 3) размонтируем центр, монтируем док
    setCenterAlive(false);
    setDockAlive(true);
  };

  return (
    <>
      {/* === Центр: поисковая строка до сабмита === */}
      <AnimatePresence>
        {centerAlive && (
          <motion.form
            key="centerBar"
            onSubmit={handleSubmit}
            initial={{ opacity: 1, scaleX: 1, scaleY: 1 }}
            animate={centerCtrl}
            exit={{ opacity: 0 }}
            style={{ originX: 0.5, originY: 0.5 }}
            className="w-full fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              className="w-[70%] pointer-events-auto flex items-center gap-3 rounded-xl
                         border border-cyan-400/40 bg-white/5 backdrop-blur
                         shadow-[0_0_24px_rgba(34,211,238,.25)]
                         px-4 h-14 w-[min(90vw,900px)]"
            >
              <input
                className="flex-1 bg-transparent outline-none text-white/90 text-xl"
                placeholder="Search a coin…"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button
                type="submit"
                className=" px-4 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-100
                           hover:bg-cyan-500/30 transition-colors"
              >
                Search
              </button>
            </motion.div>

            {/* Вспышка в центре (очень короткая) */}
            <Flash key={flashKey} />
          </motion.form>
        )}
      </AnimatePresence>

      {/* === Справа-сверху: после сабмита разворачиваемся обратно и остаёмся === */}
      <AnimatePresence>
        {dockAlive && (
          <motion.form
            key="dockBar"
            // сразу маленькая "точка" (TV-ON в обратную сторону)
            initial={{ opacity: 0, scaleX: 0.02, scaleY: 0.06, borderRadius: 999 }}
            animate={{
              opacity: 1,
              // сначала горизонтально -> затем вертикально
              scaleX: [0.02, 1, 1],
              scaleY: [0.06, 0.06, 1],
              borderRadius: [999, 999, 12],
              transition: {
                duration: 0.48,
                ease: "easeOut",
                times: [0, 0.55, 1],
              },
            }}
            className="fixed right-6 top-6 z-30"
            onSubmit={(e) => {
              e.preventDefault();
              if (!value.trim()) return;
              onSubmit(value);
            }}
          >
            <div
              className="flex items-center gap-3 rounded-xl
                         border border-cyan-400/40 bg-white/5 backdrop-blur
                         shadow-[0_0_20px_rgba(34,211,238,.22)]
                         px-3 h-12 w-[min(60vw,520px)]"
            >
              <input
                className="flex-1 bg-transparent outline-none text-white/90"
                placeholder="Search a coin…"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button
                type="submit"
                className="px-3 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-100
                           hover:bg-cyan-500/30 transition-colors"
              >
                Search
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}


/** короткая неоновая вспышка в центре */
function Flash() {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-3 h-3 rounded-full"
      initial={{ opacity: 0, scale: 0, filter: "blur(0px)" }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.6, 0],
        filter: ["blur(0px)", "blur(6px)", "blur(14px)"],
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background:
          "radial-gradient(circle, rgba(34,211,238,1) 0%, rgba(34,211,238,.6) 40%, rgba(34,211,238,0) 70%)",
      }}
    />
  );
}
