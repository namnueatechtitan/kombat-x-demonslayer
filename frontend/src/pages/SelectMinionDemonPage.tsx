import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import AnimatedBackground from "../components/AnimatedBackground"
import bg from "../assets/images/demonsetup.png"
import logo from "../assets/images/logo.png"
import BackButton from "../components/BackButton"
import fighterImg from "../assets/images/minions/Demon/fighterdemon.png"
import tankImg from "../assets/images/minions/Demon/tankdemon.png"
import dpsImg from "../assets/images/minions/Demon/dpsdemon.png"
import assassinImg from "../assets/images/minions/Demon/assassindemon.png"
import supportImg from "../assets/images/minions/Demon/supportdemon.png"
import { demonMinions } from "../data/demonMinions"
import fighterPreview from "../assets/images/minions/Demon/demon_fighter_preview.png"
import tankPreview from "../assets/images/minions/Demon/demon_tank_preview.png"
import dpsPreview from "../assets/images/minions/Demon/demon_dps_preview.png"
import assassinPreview from "../assets/images/minions/Demon/demon_assassin_preview.png"
import supportPreview from "../assets/images/minions/Demon/demon_support_preview.png"

import type { MinionData, MinionType } from "../types/MinionData"

interface ConfiguredMinion extends MinionData {
  strategy: string
  defenseFactor: number
}

interface Props {
  minionTypeCount: number
  minions: ConfiguredMinion[]
  onBack: () => void
  onSelect: (minion: ConfiguredMinion | MinionData) => void
  onRemove: (type: MinionType) => void
  onNext: () => void
}

export default function SelectMinionDemonPage({
  minionTypeCount,
  minions,
  onBack: _onBack,
  onSelect,
  onRemove,
  onNext,
}: Props) {
  const [selectedMinion, setSelectedMinion] =
    useState<MinionType | null>(null)

  const [isFinalConfirmOpen, setIsFinalConfirmOpen] =
    useState(false)

  const createdCount = minions.length
  const isLimitReached =
    minionTypeCount > 0 && createdCount >= minionTypeCount

  const isConfigured = (type: MinionType) =>
    minions.some((m) => m.type === type)

  const minionList = [
    { key: "FIGHTER" as MinionType, image: fighterImg },
    { key: "ASSASSIN" as MinionType, image: assassinImg },
    { key: "DPS" as MinionType, image: dpsImg },
    { key: "TANK" as MinionType, image: tankImg },
    { key: "SUPPORT" as MinionType, image: supportImg },
  ]

  const colorMap: Record<MinionType, string> = {
    FIGHTER: "#310500",
    ASSASSIN: "#720066",
    DPS: "#001311",
    TANK: "#D42828",
    SUPPORT: "#372026",
  }

  const previewMap: Record<MinionType, string> = {
    FIGHTER: fighterPreview,
    ASSASSIN: assassinPreview,
    DPS: dpsPreview,
    TANK: tankPreview,
    SUPPORT: supportPreview,
  }

  const configuredNames = minions.map((minion) =>
    (minion.name ?? "").trim() || minion.type
  )

  function handleConfirmClick() {
    if (!selectedMinion) return

    const minionData = demonMinions.find(
      (m) => m.type === selectedMinion
    )

    if (!minionData) return

    onSelect(minionData)
    setSelectedMinion(null)
  }

  return (
    <AnimatedBackground
      src={bg}
      alt="background"
      overlayClassName="bg-black/40"
      className="min-h-screen"
    >
      <div className="w-full h-full min-h-screen">
        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-6">
            <img src={logo} alt="logo" className="w-[90px]" draggable={false} />
            <h1 className="text-5xl font-extrabold tracking-wide bg-[linear-gradient(90deg,#FFD54F,#FF9800)] bg-clip-text text-transparent">
              Select Minion Demon Type
            </h1>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <div className="relative w-[80%] max-w-[1400px]">
            <div className="relative aspect-[13/7] w-full overflow-hidden rounded-[28px] border border-[#8f552f]/70 bg-[linear-gradient(180deg,rgba(31,8,10,0.96),rgba(17,7,11,0.97))] shadow-[0_0_0_1px_rgba(255,226,180,0.06)_inset,0_24px_54px_rgba(0,0,0,0.34)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,184,92,0.14),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(68,22,14,0.2),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
              <div className="pointer-events-none absolute inset-[14px] rounded-[22px] border border-[#c78655]/55" />
              <div className="pointer-events-none absolute inset-[24px] rounded-[18px] border border-[#5c2414]/75 shadow-[inset_0_0_28px_rgba(0,0,0,0.28)]" />
              <div className="pointer-events-none absolute inset-x-[38px] top-[56px] h-px bg-gradient-to-r from-transparent via-[#ffd08a]/80 to-transparent shadow-[0_0_12px_rgba(255,180,90,0.35)]" />
              <div className="pointer-events-none absolute inset-x-[38px] bottom-[275px] h-px bg-gradient-to-r from-transparent via-[#8a4f32]/60 to-transparent" />

              <div className="pointer-events-none absolute left-4 top-4 h-9 w-9 rounded-tl-md border-l-2 border-t-2 border-[#8f552f]/85" />
              <div className="pointer-events-none absolute right-4 top-4 h-9 w-9 rounded-tr-md border-r-2 border-t-2 border-[#8f552f]/85" />
              <div className="pointer-events-none absolute left-4 bottom-4 h-9 w-9 rounded-bl-md border-l-2 border-b-2 border-[#8f552f]/85" />
              <div className="pointer-events-none absolute right-4 bottom-4 h-9 w-9 rounded-br-md border-r-2 border-b-2 border-[#8f552f]/85" />
            </div>

            <div className="absolute inset-0 flex flex-col">
              <div className="flex justify-between px-16 pt-8 text-white text-sm tracking-widest">
                <span>
                  Step {createdCount}/{minionTypeCount}
                </span>
                <span>
                  Created Minion Types: {createdCount}/{minionTypeCount}
                </span>
              </div>

              <div className="flex justify-center gap-10 mt-8">
                {minionList.map((minion) => {
                  const configured = isConfigured(minion.key)
                  const isSelected = selectedMinion === minion.key
                  const selectedColor = colorMap[minion.key]

                  return (
                    <div key={minion.key}>
                      <div
                        onClick={() => {
                          if (!configured && !isLimitReached) {
                            setSelectedMinion(minion.key)
                          }
                        }}
                        style={
                          configured || isSelected
                            ? {
                                boxShadow: `0 0 40px ${selectedColor}`,
                                border: `3px solid ${selectedColor}`,
                              }
                            : {}
                        }
                        className={`relative w-[230px] h-[350px] rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
                          configured || isSelected
                            ? "scale-105"
                            : "hover:scale-105 hover:-translate-y-2"
                        } ${
                          isLimitReached && !configured
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <img
                          src={minion.image}
                          alt={minion.key}
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                        />

                        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                          <h2 className="text-white text-xl font-semibold">
                            {minion.key}
                          </h2>

                          {!configured && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isLimitReached)
                                  setSelectedMinion(minion.key)
                              }}
                              style={{
                                backgroundColor:
                                  isSelected
                                    ? colorMap[minion.key]
                                    : "#3B82F6",
                                boxShadow: isSelected
                                  ? `0 0 12px ${colorMap[minion.key]}`
                                  : "none",
                              }}
                              className="
                                w-20
                                h-8
                                flex
                                items-center
                                justify-center
                                text-sm
                                rounded-full
                                text-white
                                transition-all
                                duration-300
                              "
                            >
                              Select
                            </button>
                          )}

                          {configured && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const existing = minions.find(
                                    (m) => m.type === minion.key
                                  )
                                  if (existing) onSelect(existing)
                                }}
                                className="px-2 py-1 text-sm rounded-full bg-blue-500 text-white"
                              >
                                Edit
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRemove(minion.key)
                                }}
                                style={{
                                  backgroundColor: selectedColor,
                                }}
                                className="px-3 py-1 text-sm rounded-full text-white"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedMinion && !isLimitReached && (
                <div className="mt-auto mb-8 flex justify-center">
                  <img
                    src={previewMap[selectedMinion]}
                    alt="preview"
                    className="w-[650px] object-contain"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-16">
        <BackButton onClick={() => setSelectedMinion(null)} />

        {!isLimitReached ? (
          <ConfirmButton
            onClick={handleConfirmClick}
            disabled={!selectedMinion}
          />
        ) : (
          <ConfirmButton
  onClick={() => setIsFinalConfirmOpen(true)}
  label="Final Confirm"
/>
        )}
      </div>

      {isFinalConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-[620px]">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[40px] blur-3xl opacity-90"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(168,85,247,0.45), rgba(0,0,0,0))",
              }}
            />

            <div className="relative overflow-hidden rounded-3xl border border-violet-300/45 bg-[linear-gradient(180deg,rgba(28,7,34,0.96),rgba(18,4,24,0.98))] shadow-[0_0_65px_rgba(168,85,247,0.3)]">
              <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,rgba(244,208,255,0.24),transparent_38%),radial-gradient(circle_at_80%_75%,rgba(194,132,252,0.2),transparent_40%)]" />

              <div className="relative px-6 py-5 border-b border-violet-300/25 bg-black/25">
                <div className="absolute top-2 left-4 text-violet-200/65 text-xs tracking-[0.22em]">
                  FINAL CONFIRMATION
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-[0.12em] text-center text-[#F4E7FF] drop-shadow-[0_0_16px_rgba(208,160,255,0.45)]">
                  DEMON LEGION READY
                </h2>
                <div className="mx-auto mt-3 h-[3px] w-48 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-violet-300 shadow-[0_0_18px_rgba(180,110,255,0.5)]" />
              </div>

              <div className="relative px-6 py-8 text-center">
                <p className="text-sm tracking-[0.22em] text-violet-200/75">MINION SETUP COMPLETE</p>
                <p className="mt-2 text-4xl sm:text-5xl font-black tracking-[0.05em] text-white drop-shadow-[0_0_24px_rgba(180,120,255,0.4)]">
                  {createdCount}/{minionTypeCount}
                </p>
                <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-violet-300/45 bg-violet-500/15 px-4 py-1 text-xs tracking-[0.16em] text-violet-100">
                  <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
                  READY FOR PRE-BATTLE
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left">
                  <p className="text-xs tracking-[0.22em] text-violet-200/65">SELECTED MINIONS</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {configuredNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-sm font-semibold tracking-wide text-violet-100"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative px-6 pb-7 pt-1 flex flex-col sm:flex-row gap-3 sm:justify-center">
                <button
                  type="button"
                  onClick={() => setIsFinalConfirmOpen(false)}
                  className="w-full sm:w-[220px] h-[55px] rounded-full text-white font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 hover:scale-105 shadow-md hover:shadow-xl"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="w-full sm:w-[220px] h-[55px] rounded-full text-white font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 shadow-md hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                >
                  Confirm
                </button>
              </div>

              <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-violet-200/45 rounded-tl-md" />
              <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-violet-200/45 rounded-tr-md" />
              <div className="pointer-events-none absolute left-4 bottom-4 h-6 w-6 border-l-2 border-b-2 border-violet-200/45 rounded-bl-md" />
              <div className="pointer-events-none absolute right-4 bottom-4 h-6 w-6 border-r-2 border-b-2 border-violet-200/45 rounded-br-md" />
            </div>
          </div>
        </div>
      )}
    </AnimatedBackground>
  )
}
