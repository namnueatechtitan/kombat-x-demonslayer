import fighterDemonImg from "../assets/images/minions/Demon/fighterdemon.png"
import tankDemonImg from "../assets/images/minions/Demon/tankdemon.png"
import dpsDemonImg from "../assets/images/minions/Demon/dpsdemon.png"
import assassinDemonImg from "../assets/images/minions/Demon/assassindemon.png"
import supportDemonImg from "../assets/images/minions/Demon/supportdemon.png"
import fighterHumanImg from "../assets/images/minions/Human/fighterhuman.png"
import tankHumanImg from "../assets/images/minions/Human/tankhuman.png"
import dpsHumanImg from "../assets/images/minions/Human/dpshuman.png"
import assassinHumanImg from "../assets/images/minions/Human/assassinhuman.png"
import supportHumanImg from "../assets/images/minions/Human/supporthuman.png"
import type { MinionData, MinionType } from "../types/MinionData"

interface PlayerTheme {
  border: string
  glow: string
  heading: string
}

interface Props {
  open: boolean
  anchorX: number
  anchorY: number
  playerTheme: PlayerTheme
  currentPlayerCharacter: "HUMAN" | "DEMON"
  selectableMinions: MinionData[]
  onClose: () => void
  onSelectMinion: (type: string) => void
}

const demonImageMap: Record<MinionType, string> = {
  FIGHTER: fighterDemonImg,
  ASSASSIN: assassinDemonImg,
  DPS: dpsDemonImg,
  TANK: tankDemonImg,
  SUPPORT: supportDemonImg,
}

const humanImageMap: Record<MinionType, string> = {
  FIGHTER: fighterHumanImg,
  ASSASSIN: assassinHumanImg,
  DPS: dpsHumanImg,
  TANK: tankHumanImg,
  SUPPORT: supportHumanImg,
}

const colorMap: Record<MinionType, string> = {
  FIGHTER: "#195A45",
  ASSASSIN: "#7B140D",
  DPS: "#031A54",
  TANK: "#D42828",
  SUPPORT: "#745531",
}

export default function SpawnMinionSelectionModal({
  open,
  anchorX,
  anchorY,
  playerTheme,
  currentPlayerCharacter,
  selectableMinions,
  onClose,
  onSelectMinion,
}: Props) {
  if (!open) return null

  const imageMap = currentPlayerCharacter === "HUMAN" ? humanImageMap : demonImageMap

  return (
    <div
      className={`fixed z-[70] w-[520px] max-w-[92vw] rounded-2xl border ${playerTheme.border} ${playerTheme.glow} p-3`}
      style={{
        left: `min(calc(100vw - 540px), ${anchorX + 28}px)`,
        top: `min(calc(100vh - 340px), ${anchorY - 10}px)`,
        background:
          "linear-gradient(145deg, rgba(10,20,35,0.95), rgba(7,10,20,0.95))",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-base font-extrabold tracking-wide ${playerTheme.heading}`}>
          Spawn Minion
        </h3>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {selectableMinions.map((minion) => {
          const minionType = minion.type as MinionType
          return (
            <div
              key={minion.type}
              className="relative h-[180px] rounded-2xl overflow-hidden border border-white/20"
              style={{ boxShadow: `0 0 14px ${colorMap[minionType]}66` }}
            >
              <img
                src={imageMap[minionType]}
                alt={minion.type}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              <div className="relative z-10 p-2 flex flex-col h-full">
                <p className="text-[10px] font-black tracking-[0.18em] text-white leading-none">
                  {minion.type}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectMinion(minion.type)}
                  className="mt-2 w-[58px] h-6 flex items-center justify-center text-[11px] rounded-full text-white bg-[#3B82F6] hover:brightness-110 transition"
                >
                  Select
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
