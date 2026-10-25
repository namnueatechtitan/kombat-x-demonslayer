import { playClickSfx } from "../utils/sfx"

interface Props {
  onClick?: () => void
  disabled?: boolean
  label?: string
}

export default function ConfirmButton({
  onClick,
  disabled,
  label = "Confirm",
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
        transform
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : `
              bg-gradient-to-r
              from-[#FF3D00]
              to-[#ECDB46]
              hover:scale-105
              hover:shadow-xl
              shadow-md
              hover:shadow-[0_0_25px_rgba(255,120,0,0.7)]
            `
        }
      `}
    >
      {label}
    </button>
  )
}
