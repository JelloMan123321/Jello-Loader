import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const BACKENDS = ["ScramJet", "Ultraviolet"] as const;

type Backend = (typeof BACKENDS)[number];

function normalizeUrl(input: string) {
  const raw = input.trim();
  if (!raw) return "";

  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;

  return raw;
}

function backendToPrefix(backend: Backend) {
  return backend === "ScramJet" ? "/scramjet" : "/ultraviolet";
}

export default function Home() {
  const [backend, setBackend] = useState<Backend>("ScramJet");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "loading"; url: string } | { type: "error"; message: string }
  >({ type: "idle" });

  function submit(raw: string) {
    const url = normalizeUrl(raw);
    if (!url) {
      setStatus({ type: "error", message: "Enter a URL to load." });
      return;
    }

    setStatus({ type: "loading", url });

    // Frontend-only prototype behavior:
    // attempt to open a URL using a pseudo-loader prefix.
    // If that path doesn't exist in a real proxy setup, we fall back to opening the URL directly.
    const target = `${backendToPrefix(backend)}/${encodeURIComponent(url)}`;

    // Use a short delay to make the UI feel intentional.
    window.setTimeout(() => {
      const opened = window.open(target, "_blank", "noopener,noreferrer");
      if (!opened) {
        // Popup blocked: fall back to same tab.
        window.location.href = target;
        return;
      }

      setStatus({ type: "idle" });
    }, 450);
  }

  const isUv = backend === "Ultraviolet";

  return (
    <div className="min-h-dvh jl-grid jl-noise">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-5 py-14">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="mb-10 text-center">
            <h1
              className={cn(
                "jl-title jl-float select-none text-balance font-black tracking-tight",
                "text-5xl sm:text-6xl md:text-7xl",
                "text-[hsl(var(--primary))]",
              )}
              data-testid="text-title"
            >
              Jello Loader
            </h1>
          </div>

          <div className="jl-glow rounded-[28px] border border-border/60 bg-card/45 p-5 sm:p-6 backdrop-blur-xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/8 to-transparent" />

              <div className="relative rounded-[22px] border border-border/60 bg-background/25 p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <ExternalLink className="h-4 w-4 text-muted-foreground/80" />
                    </div>

                    <input
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        if (status.type === "error") setStatus({ type: "idle" });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submit(value);
                      }}
                      placeholder="Enter a website URL (example.com or https://example.com)"
                      className={cn(
                        "jl-input-glow w-full rounded-2xl border border-border/70 bg-black/30",
                        "px-11 py-4 text-base text-foreground outline-none",
                        "placeholder:text-muted-foreground/80",
                        "transition-all duration-300",
                        "focus:border-[hsl(var(--primary))]/70 focus:bg-black/38",
                      )}
                      data-testid="input-url"
                      inputMode="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {status.type === "loading" ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                            data-testid="status-loading"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="hint"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="hidden select-none text-xs text-muted-foreground sm:block"
                            data-testid="text-hint"
                          >
                            Press Enter
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-sm",
                          backend === "ScramJet" ? "text-foreground" : "text-muted-foreground",
                        )}
                        data-testid="text-backend-scramjet"
                      >
                        ScramJet
                      </span>

                      <Switch
                        checked={isUv}
                        onCheckedChange={(checked) => setBackend(checked ? "Ultraviolet" : "ScramJet")}
                        data-testid="switch-backend"
                      />

                      <span
                        className={cn(
                          "text-sm",
                          backend === "Ultraviolet" ? "text-foreground" : "text-muted-foreground",
                        )}
                        data-testid="text-backend-ultraviolet"
                      >
                        Ultraviolet
                      </span>
                    </div>


                    <AnimatePresence initial={false}>
                      {status.type === "error" ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.25 }}
                          className="mt-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                          data-testid="status-error"
                        >
                          {status.message}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
