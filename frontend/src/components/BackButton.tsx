import type { ReactNode } from "react"

import { playClickSfx } from "../utils/sfx"

interface Props {
  onClick?: () => void
  disabled?: boolean
  children?: ReactNode
}

export default function BackButton({
  onClick,
  disabled,
  children = "Back",
}: Props) {
  function handleClick() {
    if (disabled) return
    playClickSfx()
    onClick?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        mt-1
        w-[220px]
        h-[55px]
        rounded-full
        text-white
        font-semibold
        text-lg
        transition-all
        duration-300
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : `
              bg-gradient-to-r 
              from-blue-500 
              to-blue-400
              hover:from-blue-600 
              hover:to-blue-500
              hover:scale-105
              shadow-md
              hover:shadow-xl
            `
        }
      `}
    >
      {children}
    </button>
  )
}

