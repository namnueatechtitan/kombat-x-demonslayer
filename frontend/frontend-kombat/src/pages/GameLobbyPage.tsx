import { useEffect, useMemo, useState } from "react"
import AnimatedBackground from "../components/AnimatedBackground"
import ConfigBoard from "../components/ConfigBoard"
import bgImg from "../assets/images/background-config.png"
import logoImg from "../assets/images/logo.png"
import { stompWs } from "../ws/stompWs"

type ModeType = "DUEL" | "AUTO"
type Character = "HUMAN" | "DEMON"
type RoomSetupPhase =
  | "LOBBY"
  | "MINION_TYPE_COUNT"
  | "CHARACTER_SELECT"
  | "MINION_SETUP"
  | "PRE_BATTLE"
  | "PLAYING"
  | "FINISHED"

export interface RoomConfiguredMinion {
  type: string
  name: string
  defenseFactor: number
  strategy: string
}

export interface RoomState {
  roomId: string
  mode: ModeType
  config?: {
    initBudget?: number
    turnBudget?: number
    spawnCost?: number
    hexPurchaseCost?: number
    maxBudget?: number
    maxTurns?: number
    maxSpawns?: number
    interestPct?: number
    initHp?: number
  }
  host: string
  players: string[]
  started: boolean
  error?: string
  setupPhase?: RoomSetupPhase
  player1MinionTypeCount?: number
  player2MinionTypeCount?: number
  effectiveMinionTypeCount?: number
  player1Character?: Character
  player2Character?: Character
  sharedConfiguredMinions?: RoomConfiguredMinion[]
  player1SharedSetupConfirmed?: boolean
  player2SharedSetupConfirmed?: boolean
  player1ConfiguredMinions?: RoomConfiguredMinion[]
  player2ConfiguredMinions?: RoomConfiguredMinion[]
}

interface Props {
  onBack: () => void
  onConfig?: () => void
  onRoomConnected: (roomId: string, mode: ModeType, playerName: string, localPlayerId: number | null) => void
  initialRoomId?: string | null
  initialMode?: ModeType | null
  initialPlayerName?: string | null
  initialRoomState?: RoomState | null
}

const PLAYER_NAME_STORAGE_KEY = "kombat:lobby-player-name"
const randomRoomId = (length = 5) =>
  Array.from({ length }, () => Math.floor(Math.random() * 9) + 1).join("")

const resolvePlayerId = (room: RoomState | null, playerName: string): number | null => {
  const humans = (room?.players ?? []).filter(
    (name) => !["BOT", "BOT_A", "BOT_B"].includes(name.toUpperCase()),
  )

  const index = humans.findIndex((name) => name === playerName)
  if (index === 0) return 1
  if (index === 1) return 2
  return null
}

export default function GameLobbyPage({
  onRoomConnected,
  onConfig,
  initialRoomId,
  initialMode,
  initialPlayerName,
  initialRoomState,
}: Props) {
  const [playerName, setPlayerName] = useState("")
  const [pendingPlayerName, setPendingPlayerName] = useState("")
  const [mode, setMode] = useState<ModeType>(initialMode ?? "DUEL")
  const [roomCode, setRoomCode] = useState(() => initialRoomId?.trim() || randomRoomId())
  const [roomState, setRoomState] = useState<RoomState | null>(initialRoomState ?? null)
  const [connected, setConnected] = useState(false)
  const [nameError, setNameError] = useState("")

  useEffect(() => {
    if (initialPlayerName?.trim()) {
      setPlayerName(initialPlayerName.trim())
      setPendingPlayerName(initialPlayerName.trim())
      return
    }

    const savedName = window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY)?.trim() ?? ""
    if (savedName) {
      setPlayerName(savedName)
      setPendingPlayerName(savedName)
      return
    }

    setPendingPlayerName("")
  }, [initialPlayerName])

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode)
    }
  }, [initialMode])

  useEffect(() => {
    if (initialRoomId?.trim()) {
      setRoomCode(initialRoomId.trim())
    }
  }, [initialRoomId])

  useEffect(() => {
    if (initialRoomState) {
      setRoomState(initialRoomState)
    }
  }, [initialRoomState])

  const humanPlayers = (roomState?.players ?? []).filter(
    (name) => !["BOT", "BOT_A", "BOT_B"].includes(name.toUpperCase()),
  )

  const ensureConnected = (onReady: () => void) => {
    if (stompWs.isConnected()) {
      setConnected(true)
      onReady()
      return
    }

    stompWs.connect(() => {
      setConnected(true)
      onReady()
    })
  }

  const subscribeRoom = (roomId: string) => {
    stompWs.subscribe(`/topic/room/${roomId}`, (payload) => {
      if (!payload) return
      const nextRoomState = payload as RoomState
      setRoomState(nextRoomState)
      onRoomConnected(
        nextRoomState.roomId,
        nextRoomState.mode,
        playerName,
        resolvePlayerId(nextRoomState, playerName),
      )
    })
  }

  const handleCreateRoom = () => {
    const roomId = randomRoomId()

    ensureConnected(() => {
      subscribeRoom(roomId)
      stompWs.send("/app/create-room", {
        roomId,
        playerName,
        mode,
      })
      setRoomCode(roomId)
    })
  }

  const handleJoinRoom = () => {
    if (!playerName) return
    if (!roomCode.trim()) return
    const roomId = roomCode.trim()

    ensureConnected(() => {
      subscribeRoom(roomId)
      stompWs.send("/app/join-room", {
        roomId,
        playerName,
      })
    })
  }

  const modeLabel = useMemo(
    () =>
      ({
        DUEL: "Duel",
        AUTO: "Auto",
      })[roomState?.mode ?? mode],
    [mode, roomState?.mode],
  )

  const phaseLabel = roomState?.setupPhase ?? "LOBBY"
  const currentRoomCode = roomState?.roomId ?? (roomCode.trim() || "------")
  const isNameConfirmed = playerName.length > 0
  const canConfigureRoom = !!roomState && roomState.host === playerName && !roomState.started

  const handleConfirmPlayerName = () => {
    const trimmedName = pendingPlayerName.trim()

    if (trimmedName.length < 3) {
      setNameError("Name must be at least 3 characters.")
      return
    }

    if (trimmedName.length > 16) {
      setNameError("Name must be 16 characters or fewer.")
      return
    }

    setPlayerName(trimmedName)
    setPendingPlayerName(trimmedName)
    setNameError("")
    window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmedName)
  }

  return (
    <AnimatedBackground
      src={bgImg}
      alt="Lobby background"
      className="min-h-screen"
      overlayClassName="bg-[linear-gradient(180deg,rgba(0,0,0,0.26),rgba(0,0,0,0.48)),radial-gradient(circle_at_top,rgba(255,170,44,0.12),transparent_26%),radial-gradient(circle_at_50%_24%,rgba(34,119,153,0.18),transparent_34%)]"
      imageClassName="scale-105 saturate-[1.05] brightness-[0.72]"
    >
      <div className="relative mx-auto flex min-h-screen max-w-[980px] flex-col px-4 py-6 text-[#f6edd2]">
        {!isNameConfirmed && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
            <div className="w-full max-w-[420px] rounded-[24px] border border-[#a24a1f]/40 bg-[linear-gradient(180deg,rgba(27,8,7,0.96),rgba(13,3,7,0.92))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <div className="text-center">
                <div className="text-[11px] tracking-[0.34em] text-[#8ecfe4]">PLAYER IDENTITY</div>
                <h2 className="mt-3 text-[2rem] font-black tracking-[0.08em] text-[#f3c637]">Enter Your Name</h2>
                <p className="mt-2 text-[14px] leading-6 text-white/72">
                  Your name will appear in the duel room and stay saved for the next session.
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-[12px] font-medium tracking-[0.08em] text-white/68">Player Name</label>
                <input
                  value={pendingPlayerName}
                  onChange={(e) => {
                    setPendingPlayerName(e.target.value)
                    if (nameError) setNameError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmPlayerName()
                  }}
                  className="mt-2 w-full rounded-[16px] border border-white/12 bg-black/30 px-4 py-3 text-[18px] font-semibold text-[#f9e8bf] outline-none placeholder:text-white/24"
                  placeholder="Player name"
                  maxLength={16}
                  autoFocus
                />
                <div className="mt-2 flex items-center justify-between text-[12px] text-white/42">
                  <span>3-16 characters</span>
                  <span>{pendingPlayerName.trim().length}/16</span>
                </div>
                {nameError && <div className="mt-3 text-[13px] text-red-300">{nameError}</div>}
              </div>

              <button
                type="button"
                onClick={handleConfirmPlayerName}
                className="mt-6 w-full rounded-[16px] bg-gradient-to-r from-[#FF3D00] to-[#ECDB46] px-4 py-3 text-[16px] font-black text-white shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,120,0,0.7)]"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col items-center justify-center">
          <img src={logoImg} alt="Kombat x Demon Slayer" className="mb-2 w-[92px] sm:w-[112px]" />
          <h1 className="bg-[radial-gradient(circle,#fff7d8_0%,#ffbf2f_54%,#d7850d_100%)] bg-clip-text text-center text-[3rem] font-black tracking-[0.14em] text-transparent drop-shadow-[0_0_16px_rgba(255,179,0,0.35)] sm:text-[3.8rem]">
            KOMBAT
          </h1>
          <p className="mt-1 text-center text-[15px] text-white/76">{modeLabel} mode online room setup</p>

          <div className="mt-5 w-full max-w-[860px]">
            <ConfigBoard>
              <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
                <div className="space-y-4 rounded-[20px] border border-[#9c4518]/40 bg-[linear-gradient(180deg,rgba(27,8,7,0.52),rgba(13,3,7,0.34))] p-5 backdrop-blur-sm">
                  <div className="border-b border-white/8 pb-4">
                    <div className="text-[11px] tracking-[0.34em] text-[#8ecfe4]">ONLINE ROOM</div>
                    <div className="mt-2 text-[2.1rem] font-black tracking-[0.11em] text-[#f3c637]">KOMBAT</div>
                    <p className="mt-2 max-w-[34ch] text-[14px] leading-6 text-white/72">
                      Create or join the room, then both players move into setup together.
                    </p>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-3">
                    <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/24 px-3 py-3">
                      <div className="text-[10px] tracking-[0.26em] text-white/44">STATUS</div>
                      <div className="mt-2 break-words text-[13px] font-extrabold leading-5 text-[#f3c637]">
                        {connected ? "Connect" : "Connecting"}
                      </div>
                    </div>
                    <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/24 px-3 py-3">
                      <div className="text-[10px] tracking-[0.26em] text-white/44">MODE</div>
                      <div className="mt-2 text-[13px] font-extrabold leading-5 text-white">{modeLabel}</div>
                    </div>
                    <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/24 px-3 py-3">
                      <div className="text-[10px] tracking-[0.26em] text-white/44">ROOM CODE</div>
                      <div className="mt-2 overflow-hidden text-[13px] font-extrabold leading-5 tracking-[0.08em] text-white">
                        {currentRoomCode}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-[#b76527]/36 bg-[linear-gradient(180deg,rgba(54,10,0,0.24),rgba(18,3,5,0.14))] p-4">
                      <label className="block text-[12px] font-medium tracking-[0.06em] text-white/68">Mode</label>
                      <select
                        value={roomState?.mode ?? mode}
                        onChange={(e) => setMode(e.target.value as ModeType)}
                        disabled={!!roomState || !isNameConfirmed}
                        className="mt-2 w-full rounded-[15px] border border-white/12 bg-black/30 px-4 py-3 text-[16px] font-semibold text-[#f9e8bf] outline-none disabled:opacity-60 [&>option]:bg-[#2a0606] [&>option]:text-[#f9e8bf]"
                      >
                        <option value="DUEL">Duel</option>
                        <option value="AUTO">Auto</option>
                      </select>
                      <button
                        onClick={handleCreateRoom}
                        disabled={!isNameConfirmed}
                        className="mt-3 w-full rounded-[15px] bg-gradient-to-r from-[#FF3D00] to-[#ECDB46] px-4 py-3 text-[15px] font-black leading-[1.05] text-white shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,120,0,0.7)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 disabled:hover:shadow-md"
                      >
                        Create
                      </button>
                    </div>

                    <div className="rounded-[18px] border border-[#356d89]/36 bg-[linear-gradient(180deg,rgba(8,25,37,0.34),rgba(4,10,20,0.18))] p-4">
                      <label className="block text-[12px] font-medium tracking-[0.06em] text-white/68">Room Code</label>
                      <input
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        disabled={!isNameConfirmed}
                        className="mt-2 w-full rounded-[15px] border border-white/12 bg-black/30 px-4 py-3 text-[16px] font-semibold tracking-[0.14em] text-[#f9e8bf] outline-none placeholder:text-white/24 disabled:opacity-60"
                        placeholder="12345"
                      />
                      <button
                        onClick={handleJoinRoom}
                        disabled={!isNameConfirmed}
                        className="mt-3 w-full rounded-[15px] bg-gradient-to-r from-blue-500 to-blue-400 px-4 py-3 text-[15px] font-black leading-[1.05] text-white shadow-md transition duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 disabled:hover:from-blue-500 disabled:hover:to-blue-400 disabled:hover:shadow-md"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[20px] border border-[#9c4518]/40 bg-[linear-gradient(180deg,rgba(27,8,7,0.52),rgba(13,3,7,0.34))] p-5 backdrop-blur-sm">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/8 pb-4">
                    <div>
                      <div className="text-[11px] tracking-[0.34em] text-[#8ecfe4]">PLAYERS IN ROOM</div>
                      <div className="mt-2 text-[2rem] font-black text-white">Combat Assembly</div>
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-[13px] font-semibold tracking-[0.18em] text-cyan-100">
                      {humanPlayers.length}/2 HUMANS
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] border border-white/10 bg-black/24 px-4 py-3.5">
                      <div className="text-[10px] tracking-[0.26em] text-white/44">YOU ARE</div>
                      <div className="mt-2 text-[20px] font-extrabold text-white">{playerName}</div>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-black/24 px-4 py-3.5">
                      <div className="text-[10px] tracking-[0.26em] text-white/44">SETUP PHASE</div>
                      <div className="mt-2 text-[20px] font-extrabold text-[#f3c637]">{phaseLabel}</div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(roomState?.players ?? []).length === 0 ? (
                      <div className="rounded-[16px] border border-dashed border-white/10 bg-black/22 px-4 py-8 text-center text-white/48">
                        No players in room yet.
                      </div>
                    ) : (
                      (roomState?.players ?? []).map((player) => {
                        const playerId = resolvePlayerId(roomState, player)
                        const isCurrent = player === playerName

                        return (
                          <div
                            key={player}
                            className={`rounded-[16px] border px-4 py-3.5 ${
                              isCurrent
                                ? "border-amber-300/26 bg-[linear-gradient(180deg,rgba(188,123,26,0.14),rgba(78,32,10,0.08))]"
                                : "border-white/10 bg-black/18"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[16px] font-extrabold text-white">{player}</div>
                                <div className="mt-1 text-[13px] text-white/52">{roomState?.host === player ? "Host" : "Player"}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {playerId && (
                                  <span className="rounded-full border border-cyan-300/22 bg-cyan-500/10 px-3 py-1 text-[12px] font-semibold text-cyan-100">
                                    P{playerId}
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="rounded-full border border-amber-300/24 bg-amber-500/10 px-3 py-1 text-[12px] font-semibold text-amber-100">
                                    YOU
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="rounded-[16px] border border-white/12 bg-black/24 px-4 py-4 text-[15px] text-white/68">
                    {humanPlayers.length >= 2
                      ? "Room ready. Both players can continue to setup."
                      : "Waiting for the second player to enter the room."}
                  </div>

                  {canConfigureRoom && (
                    <button
                      type="button"
                      onClick={onConfig}
                      className="w-full rounded-[15px] border border-[#3d8d75] px-4 py-3 text-[13px] font-black leading-[1.05] text-white shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-xl"
                      style={{ backgroundColor: "#297960" }}
                    >
                      Room Config
                    </button>
                  )}

                  {roomState?.error && (
                    <div className="rounded-[16px] border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm text-red-200">
                      {roomState.error}
                    </div>
                  )}
                </div>
              </div>
            </ConfigBoard>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
