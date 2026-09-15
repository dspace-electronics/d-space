"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { DspaceLogo } from "@/components/ui/dspace-logo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to convert any CSS color to rgba
export const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(180, 180, 180)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    // Handle CSS variables
    if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }

    return Color.formatRGBA(Color.parse(cssColor));
  } catch (e) {
    console.error("Color parsing failed:", e);
    return fallback;
  }
};

// Helper function to add opacity to an RGB color string
export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

export const focusInput = [
  "focus:ring-2",
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  "focus:border-blue-500 focus:dark:border-blue-700",
];

export const focusRing = [
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  "outline-blue-500 dark:outline-blue-500",
];

export const hasErrorInput = [
  "ring-2",
  "border-red-500 dark:border-red-700",
  "ring-red-200 dark:ring-red-700/30",
];

export const Icons = {
  logo: ({ className }: { className?: string }) => (
    <svg
      width="42"
      height="24"
      viewBox="0 0 42 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 fill-[var(--secondary)]", className)}
    >
      <g clipPath="url(#clip0_322_9172)">
        <path
          d="M22.3546 0.96832C22.9097 0.390834 23.6636 0.0664062 24.4487 0.0664062C27.9806 0.0664062 31.3091 0.066408 34.587 0.0664146C41.1797 0.0664284 44.481 8.35854 39.8193 13.2082L29.6649 23.7718C29.1987 24.2568 28.4016 23.9133 28.4016 23.2274V13.9234L29.5751 12.7025C30.5075 11.7326 29.8472 10.0742 28.5286 10.0742H13.6016L22.3546 0.96832Z"
          fill="currentColor"
        />
        <path
          d="M19.6469 23.0305C19.0919 23.608 18.338 23.9324 17.5529 23.9324C14.021 23.9324 10.6925 23.9324 7.41462 23.9324C0.821896 23.9324 -2.47942 15.6403 2.18232 10.7906L12.3367 0.227022C12.8029 -0.257945 13.6 0.0855283 13.6 0.771372L13.6 10.0754L12.4265 11.2963C11.4941 12.2662 12.1544 13.9246 13.473 13.9246L28.4001 13.9246L19.6469 23.0305Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_322_9172">
          <rect width="42" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  soc2: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200", className)}>
      SOC2 TYPE II
    </div>
  ),
  soc2Dark: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-200 border border-neutral-700", className)}>
      SOC2 TYPE II
    </div>
  ),
  hipaa: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200", className)}>
      ESD SAFE
    </div>
  ),
  hipaaDark: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-200 border border-neutral-700", className)}>
      ESD SAFE
    </div>
  ),
  gdpr: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200", className)}>
      ISO 9001
    </div>
  ),
  gdprDark: ({ className }: { className?: string }) => (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-200 border border-neutral-700", className)}>
      ISO 9001
    </div>
  ),
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.25,
  color = "#e51e2b",
  width,
  height,
  className,
  maxOpacity = 0.6,
  text = "",
  fontSize = 100,
  fontWeight = 900,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    return getRGBA(color);
  }, [color]);

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
      textMask: Uint8Array,
      time: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const cellPitch = (squareSize + gridGap) * dpr;
      const squareWidth = squareSize * dpr;
      const squareHeight = squareSize * dpr;

      for (let i = 0; i < cols; i++) {
        const x = i * cellPitch;
        for (let j = 0; j < rows; j++) {
          const y = j * cellPitch;
          const idx = i * rows + j;
          const isText = textMask[idx] === 1;

          if (isText) {
            // Text dots: High-intensity LED crimson/red with vivid flickering
            const raw = squares[idx];
            const wave = Math.sin(time * 4 + i * 0.08 + j * 0.05) * 0.08;
            const textOpacity = Math.min(
              1,
              Math.max(0.75, 0.88 + wave + (raw > 0.4 ? 0.12 : -0.06))
            );

            ctx.fillStyle = colorWithOpacity(memoizedColor, textOpacity);
            ctx.fillRect(x, y, squareWidth, squareHeight);
          } else {
            // Ambient matrix dots: subtle faint background grid
            const ambientOpacity = squares[idx] * 0.18 + 0.03;
            ctx.fillStyle = colorWithOpacity(memoizedColor, ambientOpacity);
            ctx.fillRect(x, y, squareWidth, squareHeight);
          }
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const cols = Math.ceil(width / (squareSize + gridGap));
      const rows = Math.ceil(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      // Pre-rasterize text mask ONCE per resize/setup
      const textMask = new Uint8Array(cols * rows);

      if (text && typeof document !== "undefined") {
        try {
          const offscreen = document.createElement("canvas");
          offscreen.width = canvas.width;
          offscreen.height = canvas.height;
          const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

          if (offCtx) {
            offCtx.scale(dpr, dpr);
            offCtx.fillStyle = "#ffffff";
            offCtx.textAlign = "center";
            offCtx.textBaseline = "middle";

            const isNarrow = width < 768;
            if (isNarrow && text.includes(" ")) {
              const parts = text.split(" ");
              const line1 = parts[0];
              const line2 = parts.slice(1).join(" ");
              const responsiveFontSize = Math.min(
                Math.floor((width / Math.max(line1.length, line2.length)) * 0.9),
                Math.floor(height * 0.35),
                32
              );
              offCtx.font = `900 ${responsiveFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
              offCtx.fillText(line1, width / 2, height * 0.34);
              offCtx.fillText(line2, width / 2, height * 0.68);
            } else {
              const responsiveFontSize = Math.min(
                Math.floor((width / text.length) * 1.15),
                Math.floor(height * 0.50),
                58
              );
              offCtx.font = `900 ${responsiveFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
              offCtx.fillText(text, width / 2, height / 2);
            }

            const imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;
            const cellPitch = (squareSize + gridGap) * dpr;

            for (let i = 0; i < cols; i++) {
              for (let j = 0; j < rows; j++) {
                const sampleX = Math.min(canvas.width - 1, Math.floor((i + 0.5) * cellPitch));
                const sampleY = Math.min(canvas.height - 1, Math.floor((j + 0.5) * cellPitch));
                const alphaIdx = (sampleY * canvas.width + sampleX) * 4 + 3;

                // Check alpha threshold to identify text dots
                if (imgData[alphaIdx] > 40) {
                  textMask[i * rows + j] = 1;
                }
              }
            }
          }
        } catch (e) {
          console.error("Text mask rasterization error:", e);
        }
      }

      return { cols, rows, squares, dpr, textMask };
    },
    [squareSize, gridGap, maxOpacity, text],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const seconds = time / 1000;
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
        gridParams.textMask,
        seconds,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div
      ref={containerRef}
      className={cn(`h-full w-full ${className}`)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function checkQuery() {
      const result = window.matchMedia(query);
      setValue(result.matches);
    }

    checkQuery();
    window.addEventListener("resize", checkQuery);
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", checkQuery);

    return () => {
      window.removeEventListener("resize", checkQuery);
      mediaQuery.removeEventListener("change", checkQuery);
    };
  }, [query]);

  return value;
}

export const siteConfig = {
  hero: {
    badgeIcon: null,
    badge: "Bengaluru Hardware Dispatch",
    title: "Dspace Electronics Labs",
    description:
      "Engineering-grade electronic components, genuine microcontrollers, precision sensors, and lab tools dispatched across Bengaluru in 60 minutes.",
    cta: {
      primary: {
        text: "Shop All",
        href: "/shop",
      },
      secondary: {
        text: "Delivery SLA",
        href: "/delivery",
      },
    },
  },
  footerLinks: [
    {
      title: "Hardware",
      links: [
        { id: 1, title: "Microcontrollers", url: "/shop?category=microcontrollers" },
        { id: 2, title: "Precision Sensors", url: "/shop?category=sensors" },
        { id: 3, title: "Power & Battery", url: "/shop?category=power" },
        { id: 4, title: "Lab Tools & Probes", url: "/shop?category=tools" },
      ],
    },
    {
      title: "Logistics",
      links: [
        { id: 5, title: "Few-Hour Bengaluru SLA", url: "/delivery" },
        { id: 6, title: "Porter Courier Tracking", url: "/tracking" },
        { id: 7, title: "ESD Packaging Policy", url: "/delivery" },
        { id: 8, title: "Bulk Lab Procurement", url: "/delivery" },
      ],
    },
    {
      title: "Company",
      links: [
        { id: 9, title: "New Thippasandra Hub", url: "/delivery" },
        { id: 10, title: "Account & Orders", url: "/account" },
        { id: 11, title: "Lab Sign In", url: "/signin" },
        { id: 12, title: "Precision Catalog", url: "/shop" },
      ],
    },
  ],
};

export const Component = () => {
  const tablet = useMediaQuery("(max-width: 1024px)");

  return (
    <footer id="footer" className="w-full pb-0 bg-[#f8f9fa] dark:bg-[#050608] text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between p-8 sm:p-12 gap-10">
        <div className="flex flex-col items-start justify-start gap-y-5 max-w-sm mx-0">
          <Link href="/" className="flex items-center gap-3">
            <DspaceLogo size="lg" />
          </Link>
          <p className="tracking-tight text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            {siteConfig.hero.description}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
              SOC2 TYPE II
            </div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
              ESD SAFE
            </div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
              ISO 9001
            </div>
          </div>
        </div>
        <div className="pt-2 md:w-2/3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-10">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-2.5">
                <li className="mb-2 text-xs font-mono uppercase tracking-wider text-neutral-950 dark:text-white font-bold">
                  {column.title}
                </li>
                {column.links.map((link) => (
                  <li
                    key={link.id}
                    className="group inline-flex cursor-pointer items-center justify-start gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                  >
                    <Link href={link.url} className="hover:underline">
                      {link.title}
                    </Link>
                    <div className="flex size-3.5 items-center justify-center rounded translate-x-0 transform opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 text-[#e51e2b]">
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-36 sm:h-40 md:h-44 relative mt-8 z-0 overflow-hidden bg-[#f8f9fa] dark:bg-[#050608]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa] dark:from-[#050608] from-0% via-transparent via-15% via-85% to-[#f8f9fa] dark:to-[#050608] to-100% opacity-60 z-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto h-full px-4">
          <FlickeringGrid
            text="DSPACE ELECTRONICS"
            className="h-full w-full"
            squareSize={2.5}
            gridGap={2.5}
            color="#e51e2b"
            maxOpacity={0.55}
            flickerChance={0.22}
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 border-t border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
        <p>© 2026 Dspace Electronics · Bengaluru, India</p>
        <p className="flex items-center gap-3">
          <span>Rapid Dispatch</span>
          <span>·</span>
          <span>Genuine Silicon</span>
        </p>
      </div>
    </footer>
  );
};

export default Component;
