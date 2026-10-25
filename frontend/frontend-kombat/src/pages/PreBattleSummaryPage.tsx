import { useEffect, useMemo, useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import BackButton from "../components/BackButton"
import ConfigBoard from "../components/ConfigBoard"
import AnimatedBackground from "../components/AnimatedBackground"
import { getSetupSummary, startGame } from "../api/gameApi"
import type { RoomState } from "./GameLobbyPage"

import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"

interface Props {
  onBack: () => void
  onConfirm: () => void
  wsRoomState?: RoomState | null
  isRoomMode?: boolean
}

export default function PreBattlePage({ onBack, onConfirm, wsRoomState, isRoomMode = false }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(!isRoomMode)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isRoomMode) {
      setLoading(false)
      return
    }

    getSetupSummary()
      .then(setData)
      .catch(() => setError("Failed to load setup"))
      .finally(() => setLoading(false))
  }, [isRoomMode])

  const roomData = useMemo(() => {
    if (!isRoomMode || !wsRoomState) return null
    return {
      mode: wsRoomState.mode,
      config: wsRoomState.config ?? {
        initBudget: 2000,
        turnBudget: 120,
        spawnCost: 200,
        hexPurchaseCost: 300,
        maxBudget: 10000,
        maxTurns: 40,
        maxSpawns: 10,
        interestPct: 3,
        initHp: 500,
      },
      players: {
        player1: {
          character: wsRoomState.player1Character,
          definedMinions:
            wsRoomState.mode === "DUEL"
              ? (wsRoomState.sharedConfiguredMinions ?? [])
              : (wsRoomState.player1ConfiguredMinions ?? []),
        },
        player2: {
          character: wsRoomState.player2Character,
          definedMinions:
            wsRoomState.mode === "DUEL"
              ? (wsRoomState.sharedConfiguredMinions ?? [])
              : (wsRoomState.player2ConfiguredMinions ?? []),
        },
      },
    }
  }, [isRoomMode, wsRoomState])

  async function handleConfirm() {
    try {
      if (!isRoomMode) {
        await startGame()
      }
      onConfirm()
    } catch {
      alert("Failed to start game")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-2xl bg-black">
        Loading...
      </div>
    )
  }

  const source = isRoomMode ? roomData : data

  if (error || !source) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl bg-black">
        {error ?? "Failed to load setup"}
      </div>
    )
  }

  const { mode, config, players } = source
  const player1 = players?.player1
  const player2 = players?.player2

  return (
    <AnimatedBackground
      src={bg}
      alt="background"
      overlayClassName="bg-black/40"
      className="min-h-screen"
    >
      <div className="w-full min-h-screen flex flex-col">
        <div className="flex flex-col items-center pt-6 px-4 pb-10 md:pb-12 flex-1 overflow-y-auto">
          <img src={logo} alt="logo" className="w-[120px] md:w-[160px]" draggable={false} />

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest bg-[radial-gradient(circle,#FFFFFF_0%,#FFB300_60%,#FFB300_100%)] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,179,0,0.6)] mt-4 mb-6">
            PRE-BATTLE
          </h1>

          <div className="w-full max-w-[980px] mb-6 md:mb-8 scale-[0.94] md:scale-100 origin-top">
            <ConfigBoard>
              <div className="text-base md:text-lg font-medium space-y-8">
                <div className="text-center">
                  <h2 className="text-white text-xl font-semibold mb-2">Game Mode</h2>
                  <p className="text-yellow-400">Mode: {mode}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-white text-xl font-semibold mb-4 text-center">
                      PLAYER 1 ({player1?.character ?? "-"})
                    </h2>

                    <div className="custom-scroll h-[100px] overflow-y-auto snap-y snap-mandatory scroll-smooth">
                      {(player1?.definedMinions ?? []).map((m: any, i: number) => (
                        <div
                          key={i}
                          className="snap-start h-[100px] flex flex-col justify-center items-center bg-black/40 border border-yellow-500/30 rounded-xl"
                        >
                          <p className="text-yellow-300 text-lg font-bold">{m.kindName ?? m.name ?? m.type}</p>
                          <p className="text-white">DEF {m.defenseFactor}</p>
                          <p className="text-white">Strategy Length: {(m.rawStrategy ?? m.strategy ?? "").length}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-white text-xl font-semibold mb-4 text-center">
                      PLAYER 2 ({player2?.character ?? "-"})
                    </h2>

                    <div className="custom-scroll h-[100px] overflow-y-auto snap-y snap-mandatory scroll-smooth">
                      {(player2?.definedMinions ?? []).map((m: any, i: number) => (
                        <div
                          key={i}
                          className="snap-start h-[100px] flex flex-col justify-center items-center bg-black/40 border border-yellow-500/30 rounded-xl"
                        >
                          <p className="text-yellow-300 text-lg font-bold">{m.kindName ?? m.name ?? m.type}</p>
                          <p className="text-white">DEF {m.defenseFactor}</p>
                          <p className="text-white">Strategy Length: {(m.rawStrategy ?? m.strategy ?? "").length}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-white text-xl font-semibold mb-6 text-center">Economy Rules</h2>
                  <div className="max-w-[760px] mx-auto grid grid-cols-2 gap-x-20 text-lg md:text-xl">
                    <div className="space-y-3">
                      <p className="text-white">Initial Budget: <span className="text-yellow-400 font-mono">{config.initBudget}</span></p>
                      <p className="text-white">Turn Budget: <span className="text-yellow-400 font-mono">{config.turnBudget}</span></p>
                      <p className="text-white">Spawn Cost: <span className="text-yellow-400 font-mono">{config.spawnCost}</span></p>
                      <p className="text-white">Hex Cost: <span className="text-yellow-400 font-mono">{config.hexPurchaseCost}</span></p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-white">Max Budget: <span className="text-yellow-400 font-mono">{config.maxBudget}</span></p>
                      <p className="text-white">Max Turns: <span className="text-yellow-400 font-mono">{config.maxTurns}</span></p>
                      <p className="text-white">Max Spawns: <span className="text-yellow-400 font-mono">{config.maxSpawns}</span></p>
                      <p className="text-white">Interest: <span className="text-yellow-400 font-mono">{config.interestPct}%</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </ConfigBoard>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 w-full shrink-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-4pt md:pb-16 flex justify-center gap-6 md:gap-10 backdrop-blur-sm">
          <BackButton onClick={onBack} />
          <ConfirmButton onClick={handleConfirm} />
        </div>
      </div>
    </AnimatedBackground>
  )
}
