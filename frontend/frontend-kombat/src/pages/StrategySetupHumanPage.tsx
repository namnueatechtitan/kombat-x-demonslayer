import { useState, useEffect } from "react"
import ConfirmButton from "../components/ConfirmButton"
import AnimatedBackground from "../components/AnimatedBackground"
import type { MinionData, MinionType } from "../types/MinionData"

import bg from "../assets/images/Minion setup.png"
import logo from "../assets/images/logo.png"

import assassinPortrait from "../assets/images/minions/Human/human_assassin_preview_portrait.png"
import fighterPortrait from "../assets/images/minions/Human/human_fighter_preview_portrait.png"
import dpsPortrait from "../assets/images/minions/Human/human_dps_preview_portrait.png"
import tankPortrait from "../assets/images/minions/Human/human_tank_preview_portrait.png"
import supportPortrait from "../assets/images/minions/Human/human_support_preview_portrait.png"

interface Props {
  minion: MinionData & {
    strategy?: string
    defenseFactor?: number
  }
  onBack: () => void
  onConfirm: (name: string, code: string, defenFactor: number) => void
}

type TemplateType = "AGGRESSIVE" | "DEFENSIVE" | "RANDOM"

const portraitMap: Record<MinionType, string> = {
  ASSASSIN: assassinPortrait,
  FIGHTER: fighterPortrait,
  DPS: dpsPortrait,
  TANK: tankPortrait,
  SUPPORT: supportPortrait,
}

const colorMap: Record<MinionType, string> = {
  FIGHTER: "#195A45",
  ASSASSIN: "#6A2834",
  DPS: "#031A54",
  TANK: "#7A120D",
  SUPPORT: "#745531",
}

const clamp = (n: number) => Math.max(0, Math.min(255, n))

const shadeHex = (hex: string, amount: number) => {
  const v = hex.replace("#", "")
  const r = clamp(parseInt(v.slice(0, 2), 16) + amount)
  const g = clamp(parseInt(v.slice(2, 4), 16) + amount)
  const b = clamp(parseInt(v.slice(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}`
}

const hexToRgba = (hex: string, alpha: number) => {
  const v = hex.replace("#", "")
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const defFilterByType: Record<MinionType, string> = {
  FIGHTER: "hue-rotate(120deg) saturate(1.1)",
  ASSASSIN: "none",
  DPS: "hue-rotate(220deg) saturate(1.05)",
  TANK: "brightness(0.68) saturate(0.9)",
  SUPPORT: "hue-rotate(26deg) saturate(0.75) brightness(0.72)",
}

export default function StrategySetupPage({
  minion,
  onBack,
  onConfirm,
}: Props) {

  const [code, setCode] = useState("")
  const [minionName, setMinionName] = useState("")
  const [defenFactor, setDefenFactor] = useState(1)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setCode(minion.strategy ?? "")
    setMinionName(minion.name ?? "")
    setDefenFactor(minion.defenseFactor ?? 1)
  }, [minion])

  const baseColor = colorMap[minion.type]
  const darkColor = shadeHex(baseColor, -48)
  const deeperColor = shadeHex(baseColor, -78)
  const lightColor = shadeHex(baseColor, 44)

  const templates: Record<TemplateType, string> = {
    AGGRESSIVE: `{
  x = 200;

  if (1 / ((((nearby up % 10) - 1) ^ 2) + 1)) then { shoot up x; done; } else
  if (1 / ((((nearby upright % 10) - 1) ^ 2) + 1)) then { shoot upright x; done; } else
  if (1 / ((((nearby downright % 10) - 1) ^ 2) + 1)) then { shoot downright x; done; } else
  if (1 / ((((nearby down % 10) - 1) ^ 2) + 1)) then { shoot down x; done; } else
  if (1 / ((((nearby downleft % 10) - 1) ^ 2) + 1)) then { shoot downleft x; done; } else
  if (1 / ((((nearby upleft % 10) - 1) ^ 2) + 1)) then { shoot upleft x; done; } else {

    o = opponent;
    d = o % 10;

    if (o) then {
      if (1 / (((d - 1) ^ 2) + 1)) then { move up; done; } else
      if (1 / (((d - 2) ^ 2) + 1)) then { move upright; done; } else
      if (1 / (((d - 3) ^ 2) + 1)) then { move downright; done; } else
      if (1 / (((d - 4) ^ 2) + 1)) then { move down; done; } else
      if (1 / (((d - 5) ^ 2) + 1)) then { move downleft; done; } else
      { move upleft; done; }
    } else {

      if (1 / (row ^ 2 + 1)) then { move down; done; } else
      if (1 / (((7 - row) ^ 2) + 1)) then { move up; done; } else
      if (1 / (col ^ 2 + 1)) then { move downright; done; } else
      if (1 / (((7 - col) ^ 2) + 1)) then { move upleft; done; } else {

        r = random % 6;

        if (1 / ((r ^ 2) + 1)) then { move up; done; } else
        if (1 / (((r - 1) ^ 2) + 1)) then { move upright; done; } else
        if (1 / (((r - 2) ^ 2) + 1)) then { move downright; done; } else
        if (1 / (((r - 3) ^ 2) + 1)) then { move down; done; } else
        if (1 / (((r - 4) ^ 2) + 1)) then { move downleft; done; } else
        { move upleft; done; }
      }
    }
  }
}`,

    DEFENSIVE: `o = opponent;

if (o) then {
  d = o % 10;
  dist = o / 10;
  if (dist - 1) then {
    if (1 / ((d - 1) ^ 2 + 1)) then { move up; done; } else
    if (1 / ((d - 2) ^ 2 + 1)) then { move upright; done; } else
    if (1 / ((d - 3) ^ 2 + 1)) then { move downright; done; } else
    if (1 / ((d - 4) ^ 2 + 1)) then { move down; done; } else
    if (1 / ((d - 5) ^ 2 + 1)) then { move downleft; done; } else
    { move upleft; done; }
  } else {
    done;
  }
} else {
  if (1 / (row ^ 2 + 1)) then { move down; done; } else
  if (1 / (((7 - row) ^ 2) + 1)) then { move up; done; } else
  if (1 / (col ^ 2 + 1)) then { move downright; done; } else
  if (1 / (((7 - col) ^ 2) + 1)) then { move upleft; done; } else
  if (1 / ((random % 2) ^ 2 + 1)) then { move up; done; } else { move down; done; }
}

done;`,

    RANDOM: `{
  o = opponent;
  d = o % 10;

  if (o) then {
    if (1 / (((d - 1) ^ 2) + 1)) then { move down; done; } else
    if (1 / (((d - 2) ^ 2) + 1)) then { move downleft; done; } else
    if (1 / (((d - 3) ^ 2) + 1)) then { move upleft; done; } else
    if (1 / (((d - 4) ^ 2) + 1)) then { move up; done; } else
    if (1 / (((d - 5) ^ 2) + 1)) then { move upright; done; } else
    { move downright; done; }
  } else {

    a = ally;
    ad = a % 10;

    if (a) then {
      if (1 / (((ad - 1) ^ 2) + 1)) then { move down; done; } else
      if (1 / (((ad - 2) ^ 2) + 1)) then { move downleft; done; } else
      if (1 / (((ad - 3) ^ 2) + 1)) then { move upleft; done; } else
      if (1 / (((ad - 4) ^ 2) + 1)) then { move up; done; } else
      if (1 / (((ad - 5) ^ 2) + 1)) then { move upright; done; } else
      { move downright; done; }
    } else {
      r = random % 6;

      if (1 / ((r ^ 2) + 1)) then { move up; done; } else
      if (1 / (((r - 1) ^ 2) + 1)) then { move upright; done; } else
      if (1 / (((r - 2) ^ 2) + 1)) then { move downright; done; } else
      if (1 / (((r - 3) ^ 2) + 1)) then { move down; done; } else
      if (1 / (((r - 4) ^ 2) + 1)) then { move downleft; done; } else
      { move upleft; done; }
    }
  }
}`,
  }

  function handleTemplateClick(type: TemplateType) {
    setSelectedTemplate(type)
    setCode(templates[type])
  }

  async function handleConfirm() {
    if (!code.trim() || loading) return

    try {
      setLoading(true)
      setError("")
      onConfirm(minionName.trim() || minion.name, code, defenFactor)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedBackground
      src={bg}
      alt="background"
      overlayClassName="bg-black/60"
      className="min-h-screen"
    >
      <div className="min-h-screen w-full flex flex-col items-center">
        <div className="mt-10 flex flex-col items-center">
          <img src={logo} alt="logo" className="w-[110px] mb-4" draggable={false} />
          <h1 className="text-5xl font-extrabold tracking-wide
            bg-gradient-to-r from-[#f6d27a] to-[#c6932f]
            bg-clip-text text-transparent">
            Minion Strategy Setup
          </h1>
        </div>

      <div
        className="mt-10 w-[1260px] max-w-[96vw] h-[620px] rounded-xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(145deg, ${hexToRgba(darkColor, 0.94)}, ${hexToRgba(
            deeperColor,
            0.98
          )})`,
          border: `1px solid ${hexToRgba(lightColor, 0.7)}`,
          boxShadow: `0 0 35px ${hexToRgba(baseColor, 0.28)}, inset 0 0 40px rgba(0,0,0,0.35)`,
        }}
      >

        <div className="h-[62px]
          flex items-center justify-center gap-4 px-5
          text-[#ffd9be]
          text-base font-bold tracking-[0.26em]
          border-b"
          style={{
            borderColor: hexToRgba(lightColor, 0.45),
            backgroundImage: `linear-gradient(90deg, ${hexToRgba(
              darkColor,
              0.95
            )}, ${hexToRgba(baseColor, 0.88)}, ${hexToRgba(darkColor, 0.95)})`,
          }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#fecaca]/45 bg-black/25 px-4 py-1 text-[13px] tracking-[0.2em] text-[#ffe4d0]">
            <span className="h-2 w-2 rounded-full bg-[#fb7185] shadow-[0_0_10px_rgba(251,113,133,0.9)]" />
            EDITING
          </span>
          <input
            value={minionName}
            onChange={(e) => setMinionName(e.target.value)}
            className="h-10 w-[460px] max-w-[62vw] rounded-lg px-4 text-base font-semibold tracking-[0.08em] text-[#fff6d9] outline-none transition"
            style={{
              border: `1px solid ${hexToRgba(lightColor, 0.55)}`,
              backgroundImage: `linear-gradient(180deg, ${hexToRgba(
                deeperColor,
                0.95
              )}, ${hexToRgba(darkColor, 0.98)})`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 0 14px ${hexToRgba(baseColor, 0.25)}`,
            }}
          />
        </div>

        <div className="flex h-[calc(100%-62px)]">

          {/* LEFT PANEL */}
          <div className="w-[28%] relative p-10 text-[#f1d8a5]">
            <div
              className="absolute right-0 top-0 bottom-0 w-[2px]"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent, ${hexToRgba(
                  lightColor,
                  0.7
                )}, transparent)`,
              }}
            />

            <div className="mb-10 text-center">
              <div
                className="text-2xl font-bold tracking-[0.3em] drop-shadow-[0_0_15px_rgba(0,0,0,0.35)]"
                style={{ color: "#ffe9b5", textShadow: "0 0 10px rgba(255,220,140,0.28)" }}
              >
                {minionName.toUpperCase()}
              </div>
              <div className="flex justify-center mt-4">
                <div
                  className="w-48 h-[2px]"
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent, ${hexToRgba(
                      lightColor,
                      0.8
                    )}, transparent)`,
                  }}
                />
              </div>
            </div>

            <img
              src={portraitMap[minion.type]}
              alt={minionName}
              className="w-[400px] h-[300px] object-contain rounded-lg mb-2 drop-shadow-[0_0_25px_rgba(246,210,122,0.5)]"
              draggable={false}
            />{/* DEFENSE - HUMAN CRIMSON */}
<div className="mt-1 flex justify-center" style={{ filter: defFilterByType[minion.type] }}>
  <div className="relative flex items-center justify-center group">

    {/* 🔴 Outer rotating crimson ring */}
    <div className="
      absolute w-[100px] h-[100px]
      rounded-full
      border border-[#ef4444]/40
      shadow-[0_0_45px_rgba(239,68,68,0.8)]
      animate-spin
      [animation-duration:20s]
    " />

    {/* 🔴 Inner reverse ring */}
    <div className="
      absolute w-[70px] h-[70px]
      rounded-full
      border border-[#f87171]/40
      animate-spin
      [animation-duration:14s]
      [animation-direction:reverse]
    " />

    {/* 🔴 Light particles */}
    <div className="absolute w-[160px] h-[160px] pointer-events-none">
      <div className="absolute top-3 left-1/2 w-2 h-2 bg-[#ef4444] rounded-full animate-ping opacity-80" />
      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-[#fca5a5] rounded-full animate-pulse opacity-70" />
      <div className="absolute top-10 right-4 w-1.5 h-1.5 bg-[#dc2626] rounded-full animate-ping opacity-60" />
      <div className="absolute bottom-8 right-8 w-2 h-2 bg-[#fee2e2] rounded-full animate-pulse opacity-70" />
    </div>

    {/* 🔴 Core DEF Badge */}
    <div
      className="
        relative
        flex items-center gap-3 px-6 py-2
        rounded-full
        bg-gradient-to-r from-[#3b0000] via-[#b91c1c] to-[#3b0000]
        border border-[#f87171]
        text-[#fee2e2]
        shadow-[0_0_35px_rgba(239,68,68,0.9)]
        transition duration-500
        group-hover:shadow-[0_0_70px_rgba(220,38,38,1)]
        z-10
      "
    >
      {/* Shield */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 text-[#fca5a5]"
      >
        <path d="M12 2L4 5v6c0 5.25 3.438 10.125 8 11
        4.563-.875 8-5.75 8-11V5l-8-3z" />
      </svg>

      {/* Minus */}
      <button
        type="button"
        onClick={() => setDefenFactor(p => Math.max(1, p - 1))}
        className="
          w-7 h-7 rounded-full
          bg-gradient-to-b from-[#f87171] to-[#dc2626]
          text-[#3b0000] font-bold text-lg
          flex items-center justify-center
          hover:scale-110
          hover:shadow-[0_0_15px_rgba(239,68,68,1)]
          transition duration-300
        "
      >
        −
      </button>

      {/* Value */}
      <span className="text-2xl font-bold tracking-widest text-[#fff1f1]">
        {defenFactor}
      </span>

      {/* Plus */}
      <button
        type="button"
        onClick={() => setDefenFactor(p => Math.min(1000, p + 1))}
        className="
          w-7 h-7 rounded-full
          bg-gradient-to-b from-[#f87171] to-[#dc2626]
          text-[#3b0000] font-bold text-lg
          flex items-center justify-center
          hover:scale-110
          hover:shadow-[0_0_15px_rgba(239,68,68,1)]
          transition duration-300
        "
      >
        +
      </button>

      <span className="text-sm tracking-[0.3em] text-[#fee2e2]">
        DEF
      </span>
    </div>

  </div>
</div>

            
          </div>

          {/* MIDDLE */}
          <div className="w-[48%] relative p-8">
            <div
              className="absolute right-0 top-0 bottom-0 w-[2px]"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent, ${hexToRgba(
                  lightColor,
                  0.65
                )}, transparent)`,
              }}
            />

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="strategy-editor-scroll w-full h-full
                rounded-lg p-6
                text-[#f6d27a]
                font-mono text-[16px] leading-[1.45] resize-none
                focus:shadow-[0_0_20px_rgba(255,255,255,0.22)]"
              style={{
                backgroundImage: `linear-gradient(180deg, ${hexToRgba(
                  darkColor,
                  0.96
                )}, ${hexToRgba(deeperColor, 0.98)})`,
                border: `1px solid ${hexToRgba(lightColor, 0.62)}`,
                boxShadow: `inset 0 0 24px ${hexToRgba(baseColor, 0.24)}`,
                scrollbarColor: `${baseColor} ${hexToRgba(deeperColor, 0.9)}`,
                // css vars for webkit scrollbar theme
                ["--strategy-scroll-thumb" as string]: `linear-gradient(180deg, ${shadeHex(
                  lightColor,
                  35
                )} 0%, ${lightColor} 48%, ${baseColor} 100%)`,
                ["--strategy-scroll-track" as string]: `linear-gradient(180deg, ${hexToRgba(
                  darkColor,
                  0.9
                )}, ${hexToRgba(deeperColor, 0.96)})`,
              }}
            />
          </div>

        {/* RIGHT PANEL (Human Hero Version) */}
<div className="w-[24%] p-8 text-[#f6e6c4]">

  {/* TITLE + DIVIDER */}
  <div className="mb-8">

    <div
      className="text-base font-bold tracking-[0.24em] bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(0,0,0,0.35)]"
      style={{ backgroundImage: `linear-gradient(90deg, ${shadeHex(lightColor, 35)}, ${lightColor})` }}
    >
      QUICK TEMPLATES
    </div>

    {/* Golden Divider */}
    <div className="mt-4 flex justify-center">
      <div
        className="w-[80%] h-[2px] rounded-full"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${hexToRgba(lightColor, 0.75)}, transparent)`,
          boxShadow: `0 0 6px ${hexToRgba(baseColor, 0.6)}`,
        }}
      />
    </div>

  </div>

  {(["AGGRESSIVE","DEFENSIVE","RANDOM"] as TemplateType[]).map(type => {

    const iconMap = {
      AGGRESSIVE: (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4l6 6-8 8-6-6z" />
          <path d="M10 14l-6 6" />
        </svg>
      ),
      DEFENSIVE: (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4 5v6c0 5.25 3.438 10.125 8 11
            4.563-.875 8-5.75 8-11V5l-8-3z" />
        </svg>
      ),
      RANDOM: (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 7h.01" />
          <path d="M15 17h.01" />
        </svg>
      )
    }

    return (
      <button
        key={type}
        onClick={() => handleTemplateClick(type)}
        className={`
          group
          relative
          w-full h-[54px]
          mb-7 px-7
          rounded-full
          tracking-[0.16em]
          flex items-center justify-between
          overflow-hidden
          transition duration-300

          border
          text-[#f6e6c4]

          shadow-[0_0_20px_rgba(0,0,0,0.2)]
          hover:shadow-[0_0_35px_rgba(255,255,255,0.18)]
          hover:scale-[1.02]

          ${selectedTemplate === type
            ? "shadow-[0_0_45px_rgba(246,210,122,0.6)]"
            : ""}
        `}
        style={{
          backgroundImage: `linear-gradient(90deg, ${deeperColor}, ${baseColor}, ${deeperColor})`,
          borderColor: hexToRgba(lightColor, 0.4),
          boxShadow:
            selectedTemplate === type
              ? `0 0 30px ${hexToRgba(baseColor, 0.55)}`
              : `0 0 16px ${hexToRgba(baseColor, 0.32)}`,
        }}
      >

        {/* LEFT ICON + TEXT */}
        <div className="flex items-center gap-4 z-10">
          <div className="
            w-8 h-8 rounded-full
            flex items-center justify-center
            bg-black/30
          ">
            {iconMap[type]}
          </div>

          <span className="uppercase font-semibold text-[15px]">
            {type}
          </span>
        </div>

        {/* VECTOR (Golden Hero) */}
        <div className="
          w-[22px] h-[22px]
          min-w-[22px] min-h-[22px]
          rounded-full
          flex items-center justify-center
          shadow-[0_0_8px_rgba(0,0,0,0.2)]
          shrink-0
          z-10
        "
        style={{
          backgroundImage: `linear-gradient(180deg, ${shadeHex(lightColor, 40)}, ${lightColor})`,
          boxShadow: `0 0 10px ${hexToRgba(baseColor, 0.5)}`,
        }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b0000"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>

      </button>
    )
  })}
</div>

        </div>
      </div>

      <div className="flex gap-20 mt-10 mb-16">
        <button
          onClick={onBack}
          className="px-16 py-3 rounded-full
            bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]
            text-white">
          Back
        </button>

        <ConfirmButton
          onClick={handleConfirm}
          disabled={!code.trim() || loading}
        />
      </div>

      {error && (
        <div className="fixed bottom-4 left-0 right-0 text-center text-red-500 font-semibold z-50">
          {error}
        </div>
      )}
      </div>
    </AnimatedBackground>
  )
}
