import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import AnimatedBackground from "../components/AnimatedBackground"
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"

import duelImg from "../assets/images/mode-duel.png"
import solitaireImg from "../assets/images/mode-solitaire.png"
import autoImg from "../assets/images/mode-auto.png"

interface Props {
  onBack: () => void
  onConfirm: (mode: ModeType) => void
}

type ModeType = "DUEL" | "SOLITAIRE" | "AUTO"

export default function ModePage({ onConfirm }: Props) {
  const [selectedMode, setSelectedMode] = useState<ModeType | null>(null)
  const [shake, setShake] = useState(false)

  const modes = [
    { key: "DUEL" as ModeType, image: duelImg, label: "Player vs Player" },
    { key: "SOLITAIRE" as ModeType, image: solitaireImg, label: "Player vs AI" },
    { key: "AUTO" as ModeType, image: autoImg, label: "Bot vs Bot" },
  ]

  const theme = {
    DUEL: {
      glow: "radial-gradient(circle, rgba(255,120,0,0.9), transparent 70%)",
      button: "from-orange-600 via-amber-500 to-yellow-400"
    },
    SOLITAIRE: {
      glow: "radial-gradient(circle, rgba(59,130,246,0.9), transparent 70%)",
      button: "from-blue-600 via-cyan-500 to-blue-400"
    },
    AUTO: {
      glow: "radial-gradient(circle, rgba(168,85,247,0.9), transparent 70%)",
      button: "from-purple-600 via-fuchsia-500 to-purple-400"
    }
  }

  const handleSelect = (mode: ModeType) => {
    setSelectedMode(mode)
    setShake(true)
    setTimeout(() => setShake(false), 350)
  }

  return (
    <AnimatedBackground
      src={bg}
      alt="background"
      overlayClassName="bg-black/50"
      className={shake ? "animate-shake" : ""}
    >
      <div className="flex flex-col items-center w-full h-full">

        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          className="mt-[50px] w-[100px] select-none"
          draggable={false}
        />

        {/* Title */}
        <h1
          className="
            text-4xl md:text-5xl
            font-extrabold
            tracking-widest
            bg-[radial-gradient(circle,#FFFFFF_0%,#FFB300_60%,#FFB300_100%)]
            bg-clip-text
            text-transparent
            drop-shadow-[0_0_12px_rgba(255,179,0,0.6)]
            mt-6 mb-14
          "
        >
          SELECT MODE
        </h1>

        {/* Cards */}
        <div className="flex gap-12 flex-wrap justify-center max-w-6xl px-6">

          {modes.map((mode) => {
            const isSelected = selectedMode === mode.key
            const isDimmed = selectedMode && !isSelected

            return (
              <div key={mode.key} className="flex flex-col items-center">

                <div
                  className="relative w-[300px] cursor-pointer transition-all duration-300"
                  onClick={() => handleSelect(mode.key)}
                >
                  {/* Glow */}
                  {isSelected && (
                    <div
                      className="absolute -inset-10 rounded-[40px] blur-[80px] opacity-90 animate-pulse transition-all duration-500"
                      style={{
                        background: theme[mode.key].glow
                      }}
                    />
                  )}

                  {/* Card Image */}
                  <img
                    src={mode.image}
                    alt={mode.key}
                    draggable={false}
                    className={`
                      relative z-10 w-full rounded-2xl select-none
                      transition-all duration-300
                      ${isSelected ? "scale-110" : "hover:scale-105"}
                      ${isDimmed ? "opacity-40" : ""}
                    `}
                  />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm text-white text-center py-3 rounded-b-2xl text-sm tracking-wide z-20">
                    {mode.label}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelect(mode.key)}
                  className={`
                    mt-6 px-8 py-2 rounded-full
                    text-white font-semibold
                    transition-all duration-300
                    ${
                      isSelected
                        ? `bg-gradient-to-r ${theme[mode.key].button} shadow-xl`
                        : "bg-gray-700 hover:bg-gray-600"
                    }
                  `}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>

              </div>
            )
          })}

        </div>

        {/* Confirm */}
        <div className="mt-16">
          <ConfirmButton
            onClick={() => {
              if (!selectedMode) {
                alert("Please select a mode first.")
                return
              }
              onConfirm(selectedMode)
            }}
          />
        </div>

      </div>
    </AnimatedBackground>
  )
}
