import { useState } from "react"

// Components
import ConfirmButton from "../components/ConfirmButton"
import AnimatedBackground from "../components/AnimatedBackground"

// API
import { setCharacter } from "../api/gameApi.ts"

// Assets
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import humanImg from "../assets/images/ui-human.png"
import demonImg from "../assets/images/ui-demon.png"

interface Props {
  setupPlayer: 1 | 2
  onBack: () => void
  onConfirm: (uiType: "HUMAN" | "DEMON") => void
}

export default function SelectCharacterPage({
  setupPlayer,
  onConfirm
}: Props) {

  const [selected, setSelected] =
    useState<"HUMAN" | "DEMON" | null>(null)

  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const triggerSelect = (type: "HUMAN" | "DEMON") => {
    setSelected(type)
    setShake(true)

    setTimeout(() => {
      setShake(false)
    }, 200)
  }

  const handleConfirm = async () => {
  if (!selected || loading) return

  try {
    setLoading(true)

  
    await setCharacter(setupPlayer, selected)

    onConfirm(selected)

  } catch (err) {
    console.error("Failed to set character:", err)
    alert("Failed to save character selection")
  } finally {
    setLoading(false)
  }
}

  const isPlayer1 = setupPlayer === 1

  const playerBadgeClass = isPlayer1
    ? "border-red-300/70 text-red-100 bg-[linear-gradient(90deg,rgba(110,14,20,0.78),rgba(180,30,42,0.72),rgba(110,14,20,0.78))] shadow-[0_0_18px_rgba(255,80,80,0.45)]"
    : "border-violet-300/70 text-violet-100 bg-[linear-gradient(90deg,rgba(52,18,82,0.78),rgba(106,33,168,0.72),rgba(52,18,82,0.78))] shadow-[0_0_18px_rgba(192,132,252,0.45)]"

  return (
    <AnimatedBackground
      src={bg}
      alt="background"
      overlayClassName="bg-black/30"
      className={shake ? "animate-shake" : ""}
    >
      <style>
        {`
          @keyframes shake-soft {
            0%   { transform: translate(0px, 0px); }
            25%  { transform: translate(-0.5px, 0.5px); }
            50%  { transform: translate(0.5px, -0.5px); }
            75%  { transform: translate(-0.5px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          .animate-shake {
            animation: shake-soft 0.2s ease-out;
          }
        `}
      </style>
      <div className="flex flex-col items-center w-full h-full">

        <img
          src={logo}
          alt="logo"
          draggable={false}
          className="mt-[50px] w-[100px] select-none"
        />

        <h1
          className="
            text-4xl md:text-5xl
            font-extrabold tracking-widest
            bg-[linear-gradient(90deg,_#ffd6e2_0%,_#ff6b7a_28%,_#ffe7b3_50%,_#c7b6ff_72%,_#a78bfa_100%)]
            bg-clip-text text-transparent
            drop-shadow-[0_0_14px_rgba(188,120,255,0.42)]
            mt-6
          "
        >
          SELECT CHARACTER
        </h1>

        <div className="mt-4 flex flex-col items-center gap-2">
          <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border ${playerBadgeClass}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isPlayer1 ? "bg-red-300" : "bg-violet-300"} animate-pulse`} />
            <span className="text-2xl font-extrabold tracking-[0.18em] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              PLAYER {setupPlayer}
            </span>
          </div>
          <div className="text-[11px] tracking-[0.28em] text-white/70">
            SELECT YOUR FACTION
          </div>
        </div>

        <div className="flex gap-16 items-center justify-center mt-10">

          {/* HUMAN */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => triggerSelect("HUMAN")}
              className={`
                w-[350px] md:w-[400px]
                rounded-full p-2 cursor-pointer
                transition-all duration-300
                ${
                  selected === "HUMAN"
                    ? "scale-110 ring-4 ring-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]"
                    : "hover:scale-105"
                }
              `}
            >
              <img
                src={humanImg}
                alt="human-ui"
                draggable={false}
                className="rounded-full select-none"
              />
            </div>

            <button
              onClick={() => triggerSelect("HUMAN")}
              className={`
                mt-6 px-10 py-2 rounded-full
                font-semibold tracking-wide
                transition-all duration-200
                ${
                  selected === "HUMAN"
                    ? "bg-gradient-to-r from-red-500 to-orange-400 text-white scale-105"
                    : "bg-blue-400 text-white hover:scale-105"
                }
              `}
            >
              {selected === "HUMAN" ? "Selected" : "Select"}
            </button>
          </div>

          {/* DEMON */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => triggerSelect("DEMON")}
              className={`
                w-[350px] md:w-[400px]
                rounded-full p-2 cursor-pointer
                transition-all duration-300
                ${
                  selected === "DEMON"
                    ? "scale-110 ring-4 ring-purple-500 shadow-[0_0_50px_rgba(180,0,255,0.8)]"
                    : "hover:scale-105"
                }
              `}
            >
              <img
                src={demonImg}
                alt="demon-ui"
                draggable={false}
                className="rounded-full select-none"
              />
            </div>

            <button
              onClick={() => triggerSelect("DEMON")}
              className={`
                mt-6 px-10 py-2 rounded-full
                font-semibold tracking-wide
                transition-all duration-200
                ${
                  selected === "DEMON"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white scale-105"
                    : "bg-blue-400 text-white hover:scale-105"
                }
              `}
            >
              {selected === "DEMON" ? "Selected" : "Select"}
            </button>
          </div>

        </div>

        <div className="mt-12">
          <ConfirmButton
            onClick={handleConfirm}
            disabled={!selected || loading}
          />
        </div>

      </div>
    </AnimatedBackground>
  )
}
