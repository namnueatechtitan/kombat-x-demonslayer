import { useState } from "react"

import ConfirmButton from "../components/ConfirmButton"
import ArrowButton from "../components/ArrowButton"
import AnimatedBackground from "../components/AnimatedBackground"

// Asse
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"

import type1 from "../assets/images/minion-type-1.png"
import type2 from "../assets/images/minion-type-2.png"
import type3 from "../assets/images/minion-type-3.png"
import type4 from "../assets/images/minion-type-4.png"
import type5 from "../assets/images/minion-type-5.png"

interface Props {
  onBack: () => void
  onConfirm: (minionType: number) => void
}

export default function MinionTypePage({ onBack: _onBack, onConfirm }: Props) {
  const minionTypes = [type1, type2, type3, type4, type5]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shake, setShake] = useState(false)

  const triggerChange = (newIndex: number) => {
    setIsAnimating(true)
    setShake(true)
    setCurrentIndex(newIndex)

    setTimeout(() => {
      setIsAnimating(false)
      setShake(false)
    }, 300)
  }

  const handleNext = () => {
    if (isAnimating) return
    const next = (currentIndex + 1) % minionTypes.length
    triggerChange(next)
  }

  const handlePrev = () => {
    if (isAnimating) return
    const prev =
      (currentIndex - 1 + minionTypes.length) % minionTypes.length
    triggerChange(prev)
  }

  // ✅ แก้ตรงนี้: ไม่ยิง backend แล้ว
  const handleConfirm = () => {
    const selectedType = currentIndex + 1
    onConfirm(selectedType)  // เก็บใน React state อย่างเดียว
  }

  return (
    <AnimatedBackground
      src={bg}
      alt="background"
      overlayClassName="bg-black/40"
      className={shake ? "animate-shake" : ""}
    >
      <style>
        {`
          @keyframes shake-soft {
            0%   { transform: translate(0px, 0px); }
            25%  { transform: translate(-1px, 1px); }
            50%  { transform: translate(1px, -1px); }
            75%  { transform: translate(-1px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          .animate-shake {
            animation: shake-soft 0.2s ease-in-out;
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
            bg-[radial-gradient(circle,_#FFFFFF_0%,_#FFB300_60%,_#FFB300_100%)]
            bg-clip-text text-transparent
            drop-shadow-[0_0_12px_rgba(255,179,0,0.6)]
            mt-6 mb-5
          "
        >
          SELECT MINION TYPE
        </h1>

        <div className="relative flex items-center justify-center">
          <ArrowButton
            direction="left"
            onClick={handlePrev}
            className="absolute -left-28 md:-left-36"
          />

          <img
            key={currentIndex}
            src={minionTypes[currentIndex]}
            alt={`minion-type-${currentIndex + 1}`}
            draggable={false}
            className={`
              w-[380px] md:w-[500px] lg:w-[500px]
              rounded-xl select-none
              transition-all duration-300
              ${
                isAnimating
                  ? "scale-110 opacity-0 blur-sm"
                  : "scale-100 opacity-100 blur-0"
              }
            `}
          />

          <ArrowButton
            direction="right"
            onClick={handleNext}
            className="absolute -right-28 md:-right-36"
          />
        </div>

        <div className="mt-6 text-white text-lg tracking-wide">
          Minion Type {currentIndex + 1} / {minionTypes.length}
        </div>

        <div className="mt-8">
          <ConfirmButton onClick={handleConfirm} />
        </div>
      </div>
    </AnimatedBackground>
  )
}
