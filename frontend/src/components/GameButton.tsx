import { playClickSfx } from "../utils/sfx"

interface Props {
  label: string
  color: "orange" | "green" | "blue"
  onClick?: () => void
  enableClickSfx?: boolean
  enableHoverSfx?: boolean
}

export default function GameButton({
  label,
  color,
  onClick,
  enableClickSfx = false,
  enableHoverSfx = false,
}: Props) {
  const palette =
    color === "orange"
      ? {
          ring: "#b1202b",
          glow: "rgba(177,32,43,0.32)",
          edge: "#e05b64",
          accent: "#ffc3c8",
          tint: "linear-gradient(90deg,rgba(88,14,22,0.52),rgba(132,27,39,0.28))",
          core: "linear-gradient(180deg,rgba(36,8,12,0.97),rgba(16,5,7,0.94))",
          slash: "rgba(255,195,200,0.82)",
        }
      : color === "green"
        ? {
            ring: "#297960",
            glow: "rgba(41,121,96,0.32)",
            edge: "#63c0a0",
            accent: "#c2f2e2",
            tint: "linear-gradient(90deg,rgba(15,56,44,0.52),rgba(41,121,96,0.28))",
            core: "linear-gradient(180deg,rgba(8,24,19,0.97),rgba(4,11,9,0.94))",
            slash: "rgba(194,242,226,0.82)",
          }
        : {
            ring: "#0139c9",
            glow: "rgba(1,57,201,0.32)",
            edge: "#5d8fff",
            accent: "#c5d6ff",
            tint: "linear-gradient(90deg,rgba(8,26,88,0.54),rgba(1,57,201,0.28))",
            core: "linear-gradient(180deg,rgba(7,16,38,0.97),rgba(3,6,18,0.94))",
            slash: "rgba(197,214,255,0.82)",
          }

  function handleClick() {
    if (enableClickSfx) {
      playClickSfx()
    }
    console.log("GameButton clicked:", label)
    if (onClick) onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="group relative h-[84px] w-[330px] overflow-hidden rounded-[26px] border text-[2rem] font-black tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: palette.ring,
        background: palette.core,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 18px 38px rgba(0,0,0,0.5), 0 0 24px ${palette.glow}`,
      }}
      onMouseEnter={() => {
        if (enableHoverSfx) {
          playClickSfx(0.35)
        }
      }}
    >
      <span
        className="pointer-events-none absolute inset-[3px] rounded-[22px] opacity-95 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: palette.tint }}
      />
      <span
        className="pointer-events-none absolute -left-3 top-[15px] h-[2px] w-[126px] rotate-[10deg] opacity-95 blur-[0.3px]"
        style={{
          background: `linear-gradient(90deg,transparent,${palette.slash},transparent)`,
          boxShadow: `0 0 18px ${palette.slash}`,
        }}
      />
      <span
        className="pointer-events-none absolute -right-3 bottom-[18px] h-[2px] w-[118px] -rotate-[8deg] opacity-85 blur-[0.3px]"
        style={{
          background: `linear-gradient(90deg,transparent,${palette.slash},transparent)`,
          boxShadow: `0 0 16px ${palette.slash}`,
        }}
      />
      <span
        className="pointer-events-none absolute left-5 right-5 top-[12px] h-px opacity-80"
        style={{
          background: `linear-gradient(90deg,transparent,${palette.accent},transparent)`,
        }}
      />
      <span
        className="pointer-events-none absolute inset-y-[14px] left-[16px] w-12 rounded-[16px] opacity-90"
        style={{
          background: `linear-gradient(180deg,${palette.edge},transparent)`,
          clipPath: "polygon(0 0,100% 0,65% 100%,0 100%)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-y-[14px] right-[16px] w-12 rounded-[16px] opacity-90"
        style={{
          background: `linear-gradient(180deg,${palette.edge},transparent)`,
          clipPath: "polygon(35% 0,100% 0,100% 100%,0 100%)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-x-8 bottom-0 h-10 opacity-80 blur-xl transition-all duration-300 group-hover:h-14 group-hover:opacity-100"
        style={{ background: palette.glow }}
      />
      <span
        className="pointer-events-none absolute inset-x-12 top-1/2 h-[24px] -translate-y-1/2 opacity-50 blur-lg animate-menu-energy"
        style={{ background: palette.glow }}
      />
      <span
        className="pointer-events-none absolute inset-x-6 inset-y-[14px] rounded-[18px] border opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ borderColor: palette.edge }}
      />
      <span className="relative z-10 drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]">{label}</span>
    </button>
  )
}
