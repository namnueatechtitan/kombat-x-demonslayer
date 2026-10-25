import { useEffect, useRef, useState } from "react"

import GameWrapper from "./components/GameWrapper"
import ArrowButton from "./components/ArrowButton"

import StartPage from "./pages/StartPage"
import ConfigPage, { type GameConfig } from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import SelectCharacterPage from "./pages/SelectCharacterPage"
import GameLobbyPage, { type RoomConfiguredMinion, type RoomState as LobbyRoomState } from "./pages/GameLobbyPage"

import StrategySetupHumanPage from "./pages/StrategySetupHumanPage"
import StrategySetupDemonPage from "./pages/StrategySetupDemonPage"
import GameplayPage from "./pages/GameplayPage"
import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import SelectMinionDemonPage from "./pages/SelectMinionDemonPage"
import PreBattlePage from "./pages/PreBattleSummaryPage"
import { getConfig, resetGame, setCharacter, setMode, setupFull } from "./api/gameApi"
import { stompWs } from "./ws/stompWs"
import gameStartBgm from "./Soubd_Audio/Game start.mp3"
import gameplayBgm from "./Soubd_Audio/Gameplay.mp3"
import { demonMinions } from "./data/demonMinions"
import { humanMinions } from "./data/humanMinions"

import type { MinionData, MinionType } from "./types/MinionData"

const APP_SESSION_STORAGE_KEY = "kombat:app-session"

type RoomSetupPhase = NonNullable<LobbyRoomState["setupPhase"]>
type AppPage =
  | "start"
  | "config"
  | "mode"
  | "lobby"
  | "minionType"
  | "selectUI"
  | "minionSetupHuman"
  | "minionSetupDemon"
  | "strategy"
  | "preBattle"
  | "game"

interface ConfiguredMinion extends MinionData {
  strategy: string
  defenseFactor: number
}

const waitingPhases: RoomSetupPhase[] = [
  "MINION_TYPE_COUNT",
  "CHARACTER_SELECT",
  "MINION_SETUP",
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function App() {
  const resolveSharedMinionName = (name: string | undefined, type: MinionType) =>
    name?.trim() ? name.trim() : type

  const [page, setPage] = useState<AppPage>("start")
  const [configReturnPage, setConfigReturnPage] = useState<AppPage>("lobby")

  const [setupPlayer, setSetupPlayer] = useState<1 | 2>(1)
  const [currentFaction, setCurrentFaction] =
    useState<"HUMAN" | "DEMON" | null>(null)
  const [selectedMinion, setSelectedMinion] =
    useState<ConfiguredMinion | null>(null)
  const [minionTypeCount, setMinionTypeCount] = useState<number>(0)
  const [selectedMode, setSelectedMode] =
    useState<"DUEL" | "SOLITAIRE" | "AUTO" | null>(null)
  const [wsRoomId, setWsRoomId] = useState<string | null>(null)
  const [wsPlayerName, setWsPlayerName] = useState<string | null>(null)
  const [wsPlayerId, setWsPlayerId] = useState<number | null>(null)
  const [wsRoomState, setWsRoomState] = useState<LobbyRoomState | null>(null)
  const [roomStatusText, setRoomStatusText] = useState<string | null>(null)

  const [minionsByPlayer, setMinionsByPlayer] =
    useState<Record<1 | 2, ConfiguredMinion[]>>({
      1: [],
      2: []
    })
  const [sharedMinions, setSharedMinions] = useState<ConfiguredMinion[]>([])
  const [backendWakeState, setBackendWakeState] = useState<"idle" | "waking" | "ready" | "failed">("idle")
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const hasRestoredSessionRef = useRef(false)

  const clearAppSessionState = () => {
    setPage("start")
    setSetupPlayer(1)
    setCurrentFaction(null)
    setSelectedMinion(null)
    setMinionTypeCount(0)
    setSelectedMode(null)
    setWsRoomId(null)
    setWsPlayerName(null)
    setWsPlayerId(null)
    setWsRoomState(null)
    setRoomStatusText(null)
    setMinionsByPlayer({ 1: [], 2: [] })
    setSharedMinions([])
    window.localStorage.removeItem(APP_SESSION_STORAGE_KEY)
  }

  const wakeBackendAfterReload = async () => {
    setBackendWakeState("waking")

    try {
      await resetGame()
    } catch (error) {
      console.error("Reset game on reload failed:", error)
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        await getConfig()
        setBackendWakeState("ready")
        window.setTimeout(() => {
          setBackendWakeState((current) => (current === "ready" ? "idle" : current))
        }, 1800)
        return
      } catch (error) {
        if (attempt === 7) {
          console.error("Backend wake retry failed:", error)
          setBackendWakeState("failed")
          return
        }
        await delay(1500)
      }
    }
  }

  const activeSetupPlayer = (wsRoomId && wsPlayerId ? wsPlayerId : setupPlayer) as 1 | 2
  const effectiveMode = (wsRoomId ? wsRoomState?.mode : selectedMode) ?? null
  const usesSharedDuelSetup = effectiveMode === "DUEL"
  const isHostManagedRoomMode =
    !!wsRoomId && (wsRoomState?.mode === "DUEL" || wsRoomState?.mode === "AUTO")
  const usesSharedRoomSetup = usesSharedDuelSetup || isHostManagedRoomMode
  const currentMinions = usesSharedRoomSetup ? sharedMinions : minionsByPlayer[activeSetupPlayer]
  const effectiveRoomMinionTypeCount = wsRoomState?.effectiveMinionTypeCount ?? minionTypeCount
  const roomPhase = wsRoomState?.setupPhase
  const isRoomMinionCountTurn = !!wsRoomId && roomPhase === "MINION_TYPE_COUNT"
  const isRoomCharacterTurn = !!wsRoomId && roomPhase === "CHARACTER_SELECT"
  const isRoomMinionSetupTurn = !!wsRoomId && roomPhase === "MINION_SETUP"
  const roomConfig = wsRoomState?.config as GameConfig | undefined
  const isRoomDuelGuest = isHostManagedRoomMode && wsPlayerId === 2

  const openRoomConfig = (returnPage: AppPage = page) => {
    setConfigReturnPage(returnPage)
    setPage("config")
  }

  useEffect(() => {
    if (hasRestoredSessionRef.current) {
      return
    }

    hasRestoredSessionRef.current = true

    try {
      const raw = window.localStorage.getItem(APP_SESSION_STORAGE_KEY)
      if (!raw) {
        return
      }

      const saved = JSON.parse(raw) as {
        page?: AppPage
        setupPlayer?: 1 | 2
        currentFaction?: "HUMAN" | "DEMON" | null
        selectedMinion?: ConfiguredMinion | null
        minionTypeCount?: number
        selectedMode?: "DUEL" | "SOLITAIRE" | "AUTO" | null
        wsRoomId?: string | null
        wsPlayerName?: string | null
        wsPlayerId?: number | null
        roomStatusText?: string | null
        minionsByPlayer?: Record<1 | 2, ConfiguredMinion[]>
        sharedMinions?: ConfiguredMinion[]
      }

      if (saved.page) {
        const normalizedPage =
          saved.page === "strategy"
            ? (saved.currentFaction === "DEMON" ? "minionSetupDemon" : "minionSetupHuman")
            : saved.page
        setPage(normalizedPage)
      }
      if (saved.setupPlayer) setSetupPlayer(saved.setupPlayer)
      if (saved.currentFaction !== undefined) setCurrentFaction(saved.currentFaction)
      if (saved.selectedMinion !== undefined) setSelectedMinion(saved.selectedMinion)
      if (typeof saved.minionTypeCount === "number") setMinionTypeCount(saved.minionTypeCount)
      if (saved.selectedMode !== undefined) setSelectedMode(saved.selectedMode)
      if (saved.wsRoomId !== undefined) setWsRoomId(saved.wsRoomId)
      if (saved.wsPlayerName !== undefined) setWsPlayerName(saved.wsPlayerName)
      if (saved.wsPlayerId !== undefined) setWsPlayerId(saved.wsPlayerId)
      if (saved.roomStatusText !== undefined) setRoomStatusText(saved.roomStatusText)
      if (saved.minionsByPlayer) setMinionsByPlayer(saved.minionsByPlayer)
      if (saved.sharedMinions) setSharedMinions(saved.sharedMinions)
    } catch (error) {
      console.error("Failed to restore app session", error)
      window.localStorage.removeItem(APP_SESSION_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    if (navigationEntry?.type !== "reload") {
      return
    }

    clearAppSessionState()
    void wakeBackendAfterReload()
  }, [])

  useEffect(() => {
    if (!hasRestoredSessionRef.current) {
      return
    }

    const nextPage: AppPage =
      page === "strategy"
        ? (currentFaction === "DEMON" ? "minionSetupDemon" : "minionSetupHuman")
        : page

    window.localStorage.setItem(
      APP_SESSION_STORAGE_KEY,
      JSON.stringify({
        page: nextPage,
        setupPlayer,
        currentFaction,
        selectedMinion,
        minionTypeCount,
        selectedMode,
        wsRoomId,
        wsPlayerName,
        wsPlayerId,
        roomStatusText,
        minionsByPlayer,
        sharedMinions,
      }),
    )
  }, [
    currentFaction,
    minionTypeCount,
    minionsByPlayer,
    page,
    roomStatusText,
    selectedMinion,
    selectedMode,
    setupPlayer,
    sharedMinions,
    wsPlayerId,
    wsPlayerName,
    wsRoomId,
  ])

  useEffect(() => {
    const bgm = new Audio(gameStartBgm)
    bgm.loop = true
    bgm.volume = 0.35
    bgmRef.current = bgm

    const tryPlay = () => {
      void bgm.play().catch(() => {})
    }

    tryPlay()
    const unlockAudio = () => tryPlay()
    window.addEventListener("pointerdown", unlockAudio, { once: true })
    window.addEventListener("keydown", unlockAudio, { once: true })

    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("keydown", unlockAudio)
      bgm.pause()
      bgm.currentTime = 0
      bgmRef.current = null
    }
  }, [])

  useEffect(() => {
    const bgm = bgmRef.current
    if (!bgm) return

    const nextTrack = page === "game" ? gameplayBgm : gameStartBgm

    if (!bgm.src.endsWith(nextTrack)) {
      bgm.pause()
      bgm.src = nextTrack
      bgm.currentTime = 0
      bgm.load()
    }

    void bgm.play().catch(() => {})
  }, [page])

  useEffect(() => {
    if (!wsRoomId) {
      setWsRoomState(null)
      return
    }

    const destination = `/topic/room/${wsRoomId}`
    const handler = (payload: unknown) => {
      if (!payload) return
      setWsRoomState(payload as LobbyRoomState)
    }

    stompWs.connect(() => {
      stompWs.subscribe(destination, handler)
    })

    return () => {
      stompWs.unsubscribe(destination, handler)
    }
  }, [wsRoomId])

  useEffect(() => {
    if (!wsRoomState) {
      return
    }

    if (page === "config") {
      return
    }

    if (!selectedMode || selectedMode !== wsRoomState.mode) {
      setSelectedMode(wsRoomState.mode)
    }

    if (wsRoomState.error) {
      setRoomStatusText(wsRoomState.error)
    }

    if (wsRoomState.started || wsRoomState.setupPhase === "PLAYING") {
      setPage("game")
      setRoomStatusText(null)
      return
    }

    if (isRoomDuelGuest && wsRoomState.setupPhase !== "PRE_BATTLE") {
      setPage("lobby")
      switch (wsRoomState.setupPhase) {
        case "MINION_TYPE_COUNT":
          setRoomStatusText("Waiting for host to choose minion count.")
          break
        case "CHARACTER_SELECT":
          setRoomStatusText("Waiting for host to choose the character alignment.")
          break
        case "MINION_SETUP":
          setRoomStatusText("Waiting for host to finish the room setup.")
          break
        default:
          setRoomStatusText(null)
          break
      }
      return
    }

    if (!wsRoomState.setupPhase) {
      return
    }

    switch (wsRoomState.setupPhase) {
      case "LOBBY":
        setPage("lobby")
        break
      case "MINION_TYPE_COUNT":
        setPage("minionType")
        setRoomStatusText(
          (wsRoomState.mode === "DUEL" || wsRoomState.mode === "AUTO")
            ? "Host chooses minion count. The other player waits for setup to continue."
            : "Both players can choose minion type count now"
        )
        break
      case "CHARACTER_SELECT":
        setPage("selectUI")
        setRoomStatusText(
          (wsRoomState.mode === "DUEL" || wsRoomState.mode === "AUTO")
            ? "Player 1 chooses the character alignment. Player 2 is assigned automatically."
            : "Both players can choose character now"
        )
        break
      case "MINION_SETUP": {
        const localCharacter = wsPlayerId === 1 ? wsRoomState.player1Character : wsRoomState.player2Character
        setCurrentFaction(localCharacter ?? null)
        if (page !== "strategy") {
          setPage(localCharacter === "DEMON" ? "minionSetupDemon" : "minionSetupHuman")
        }
        if (wsRoomState.mode === "DUEL" || wsRoomState.mode === "AUTO") {
          setRoomStatusText(
            wsPlayerId === 1
              ? "Host is configuring the room setup."
              : "Host is configuring the room setup. Please wait."
          )
        } else {
          setRoomStatusText("Both players can configure minions and strategies now")
        }
        break
      }
      case "PRE_BATTLE":
        setPage("preBattle")
        setRoomStatusText(null)
        break
      case "FINISHED":
        break
    }
  }, [isRoomDuelGuest, page, selectedMode, wsPlayerId, wsRoomState])

  useEffect(() => {
    if (!wsRoomId || !usesSharedDuelSetup) {
      return
    }
    const nextShared = (wsRoomState?.sharedConfiguredMinions ?? []).map((minion) => ({
      type: minion.type as MinionType,
      name: minion.name,
      image: humanMinions.find((item) => item.type === minion.type)?.image
        ?? demonMinions.find((item) => item.type === minion.type)?.image
        ?? "",
      preview: humanMinions.find((item) => item.type === minion.type)?.preview
        ?? demonMinions.find((item) => item.type === minion.type)?.preview
        ?? "",
      strategy: minion.strategy,
      defenseFactor: minion.defenseFactor,
    }))
    setSharedMinions(nextShared)
  }, [usesSharedDuelSetup, wsRoomId, wsRoomState?.sharedConfiguredMinions])

  const handleModeConfirm = async (
    mode: "DUEL" | "SOLITAIRE" | "AUTO"
  ) => {
    try {
      await setMode(mode)
      setSelectedMode(mode)
      setPage("minionType")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to connect backend")
    }
  }

  const handleRemove = (type: MinionType) => {
    if (usesSharedRoomSetup) {
      setSharedMinions(prev => prev.filter(m => m.type !== type))
      return
    }
    setMinionsByPlayer(prev => ({
      ...prev,
      [activeSetupPlayer]: prev[activeSetupPlayer].filter(m => m.type !== type)
    }))
  }

  const handleFinalConfirm = async () => {
    const requiredCount = wsRoomId ? effectiveRoomMinionTypeCount : minionTypeCount
    if (currentMinions.length !== requiredCount) {
      alert("Please configure all minions first")
      return
    }

    try {
      const setupPayload = currentMinions.map<RoomConfiguredMinion>(m => ({
        type: m.type,
        name: m.name,
        strategy: m.strategy,
        defenseFactor: m.defenseFactor,
      }))

      if (wsRoomId) {
        if (!isRoomMinionSetupTurn) {
          alert("Not your setup turn yet")
          return
        }
        if ((wsRoomState?.mode === "DUEL" || wsRoomState?.mode === "AUTO") && wsPlayerId !== 1) {
          alert("Only the host can configure this room mode")
          return
        }
        stompWs.send("/app/submit-room-minion-setup", {
          roomId: wsRoomId,
          minions: setupPayload,
        })
        return
      }

      const isPlayer1 = activeSetupPlayer === 1
      if (usesSharedDuelSetup) {
        const playerOnePayload = setupPayload.map((minion) => ({
          ...minion,
          name: resolveSharedMinionName(minion.name, minion.type as MinionType),
        }))
        const playerTwoPayload = playerOnePayload.map((minion) => ({ ...minion }))

        await setupFull(1, playerOnePayload)
        await setupFull(2, playerTwoPayload)
        setPage("preBattle")
        return
      }
      await setupFull(activeSetupPlayer, setupPayload)

      if ((selectedMode === "SOLITAIRE" || selectedMode === "AUTO") && isPlayer1) {
        const mirroredPayload = setupPayload.map((minion) => ({
          ...minion,
          name: resolveSharedMinionName(minion.name, minion.type as MinionType),
        }))

        await setupFull(2, mirroredPayload)
        setCurrentFaction(null)
        setSelectedMinion(null)
        setPage("preBattle")
        return
      }

      if (isPlayer1) {
        setSetupPlayer(2)
        setCurrentFaction(null)
        setSelectedMinion(null)
        setPage("selectUI")
      } else {
        setCurrentFaction(null)
        setSelectedMinion(null)
        setPage("preBattle")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to complete setup")
    }
  }

  const handleBack = () => {
    switch (page) {
      case "config":
        setPage(wsRoomId ? configReturnPage : "start")
        break
      case "mode":
        setPage("start")
        break
      case "lobby":
        setPage("start")
        break
      case "minionType":
        setPage(selectedMode && wsRoomId ? "lobby" : "mode")
        break
      case "selectUI":
        setPage("minionType")
        break
      case "minionSetupHuman":
      case "minionSetupDemon":
        if (selectedMode === "SOLITAIRE" || selectedMode === "AUTO" || wsRoomId) {
          setPage("selectUI")
        } else {
          setPage("selectUI")
        }
        break
      case "strategy":
        if (currentFaction === "DEMON") {
          setPage("minionSetupDemon")
        } else {
          setPage("minionSetupHuman")
        }
        break
      case "preBattle":
        setPage("selectUI")
        break
      case "game":
        setPage("preBattle")
        break
    }
  }

  const handlePlayAgain = () => {
    clearAppSessionState()

    void resetGame().catch((error) => {
      console.error("Reset game failed:", error)
      alert("Failed to reset backend")
    })
  }

  const renderRoomStatus = () => {
    if (!wsRoomId || !roomStatusText || !waitingPhases.includes(roomPhase as RoomSetupPhase)) {
      return null
    }

    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[160] px-4 py-2 rounded-full bg-black/80 text-white text-sm border border-amber-400/40">
        {roomStatusText}
      </div>
    )
  }

  return (
    <GameWrapper
      overlay={
        page !== "start" && page !== "game" && (
          <ArrowButton
            direction="left"
            onClick={handleBack}
            className="absolute top-5 left-2 pointer-events-auto scale-75"
          />
        )
      }
    >
      {renderRoomStatus()}

      {page === "start" && (
        <StartPage
          backendWakeState={backendWakeState}
          onConfig={() => setPage("config")}
          onStart={() => setPage("mode")}
          onLobby={() => setPage("lobby")}
        />
      )}

      {page === "lobby" && (
        <GameLobbyPage
          onBack={handleBack}
          onConfig={() => openRoomConfig("lobby")}
          initialRoomId={wsRoomId}
          initialMode={selectedMode === "SOLITAIRE" ? null : selectedMode}
          initialPlayerName={wsPlayerName}
          initialRoomState={wsRoomState}
          onRoomConnected={(roomId, mode, playerName, playerId) => {
            setWsRoomId(roomId)
            setWsPlayerName(playerName)
            setWsPlayerId(playerId)
            setSelectedMode(mode)
          }}
        />
      )}

      {page === "config" && (
        <ConfigPage
          onBack={handleBack}
          mode={wsRoomId ? "room" : "global"}
          initialConfig={wsRoomId ? roomConfig ?? null : null}
          onConfirm={async (config) => {
            if (wsRoomId) {
              if (wsPlayerId !== 1) {
                throw new Error("Only host can update room config")
              }
              stompWs.connect(() => {
                stompWs.send("/app/update-room-config", {
                  roomId: wsRoomId,
                  config,
                })
              })
              setPage(configReturnPage)
              return
            }
            setPage("mode")
          }}
        />
      )}

      {page === "mode" && (
        <ModePage
          onBack={handleBack}
          onConfirm={handleModeConfirm}
        />
      )}

      {page === "minionType" && (
        <MinionTypePage
          onBack={handleBack}
          onConfirm={async (count) => {
              if (wsRoomId) {
                if (!isRoomMinionCountTurn) {
                  alert("Minion type selection is not available yet")
                  return
                }
                if ((wsRoomState?.mode === "DUEL" || wsRoomState?.mode === "AUTO") && wsPlayerId !== 1) {
                  alert("Only the host can choose minion count in this room mode")
                  return
                }
                setMinionTypeCount(count)
                setSharedMinions([])
                setMinionsByPlayer({ 1: [], 2: [] })
                setSelectedMinion(null)
                stompWs.send("/app/submit-minion-type-count", {
                  roomId: wsRoomId,
                  count,
              })
              return
            }

            setMinionTypeCount(count)
            setMinionsByPlayer({ 1: [], 2: [] })
            setSetupPlayer(1)
            setCurrentFaction(null)
            setSelectedMinion(null)
            setPage("selectUI")
          }}
        />
      )}

      {page === "selectUI" && (
        <SelectCharacterPage
          setupPlayer={activeSetupPlayer}
          onBack={handleBack}
          onConfirm={async (uiType) => {
            try {
              if (wsRoomId) {
                if (!isRoomCharacterTurn) {
                  alert("Character selection is not available yet")
                  return
                }
                if ((wsRoomState?.mode === "DUEL" || wsRoomState?.mode === "AUTO") && wsPlayerId !== 1) {
                  alert("Player 1 chooses the character alignment in this room mode")
                  return
                }
                setCurrentFaction(uiType)
                stompWs.send("/app/select-room-character", {
                  roomId: wsRoomId,
                  character: uiType,
                })
                return
              }

              await setCharacter(activeSetupPlayer, uiType)

              if (selectedMode === "DUEL") {
                const oppositeType: "HUMAN" | "DEMON" = uiType === "HUMAN" ? "DEMON" : "HUMAN"
                await setCharacter(2, oppositeType)
                setCurrentFaction(uiType)
                setSelectedMinion(null)
                setPage(
                  uiType === "DEMON"
                    ? "minionSetupDemon"
                    : "minionSetupHuman"
                )
                return
              }

              if ((selectedMode === "SOLITAIRE" || selectedMode === "AUTO") && activeSetupPlayer === 1) {
                const aiType: "HUMAN" | "DEMON" = uiType === "HUMAN" ? "DEMON" : "HUMAN"
                await setCharacter(2, aiType)
              }
              setCurrentFaction(uiType)
              setPage(
                uiType === "DEMON"
                  ? "minionSetupDemon"
                  : "minionSetupHuman"
              )
            } catch (error) {
              console.error("Failed to set AI character:", error)
              alert("Failed to save character")
            }
          }}
        />
      )}

      {page === "minionSetupHuman" && (
        <SelectMinionHumanPage
          minionTypeCount={effectiveRoomMinionTypeCount}
          minions={currentMinions}
          onBack={handleBack}
          onSelect={(minion) => {
            if (wsRoomId && !isRoomMinionSetupTurn) {
              alert("Minion setup is not available yet")
              return
            }
            if (wsRoomId && (wsRoomState?.mode === "DUEL" || wsRoomState?.mode === "AUTO") && wsPlayerId !== 1) {
              alert("Only the host can configure this room mode")
              return
            }
            setSelectedMinion({
              ...minion,
              strategy: minion.strategy || "",
              defenseFactor: minion.defenseFactor || 1,
            })
            setPage("strategy")
          }}
          onRemove={handleRemove}
          onNext={handleFinalConfirm}
        />
      )}

      {page === "minionSetupDemon" && (
        <SelectMinionDemonPage
          minionTypeCount={effectiveRoomMinionTypeCount}
          minions={currentMinions}
          onBack={handleBack}
          onSelect={(minion) => {
            if (wsRoomId && !isRoomMinionSetupTurn) {
              alert("Minion setup is not available yet")
              return
            }
            if (wsRoomId && (wsRoomState?.mode === "DUEL" || wsRoomState?.mode === "AUTO") && wsPlayerId !== 1) {
              alert("Only the host can configure this room mode")
              return
            }
            setSelectedMinion({
              ...minion,
              strategy: minion.strategy || "",
              defenseFactor: minion.defenseFactor || 1,
            })
            setPage("strategy")
          }}
          onRemove={handleRemove}
          onNext={handleFinalConfirm}
        />
      )}

      {page === "strategy" && selectedMinion && (
        currentFaction === "DEMON" ? (
          <StrategySetupDemonPage
            minion={selectedMinion}
            onBack={handleBack}
            onConfirm={(name, code, defenseFactor) => {
              if (usesSharedRoomSetup) {
                setSharedMinions(prev => [
                  ...prev.filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, name, strategy: code, defenseFactor }
                ])
                setSelectedMinion(null)
                setPage("minionSetupDemon")
                return
              }
              setMinionsByPlayer(prev => ({
                ...prev,
                [activeSetupPlayer]: [
                  ...prev[activeSetupPlayer].filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, name, strategy: code, defenseFactor }
                ]
              }))
              setSelectedMinion(null)
              setPage("minionSetupDemon")
            }}
          />
        ) : (
          <StrategySetupHumanPage
            minion={selectedMinion}
            onBack={handleBack}
            onConfirm={(name, code, defenseFactor) => {
              if (usesSharedRoomSetup) {
                setSharedMinions(prev => [
                  ...prev.filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, name, strategy: code, defenseFactor }
                ])
                setSelectedMinion(null)
                setPage("minionSetupHuman")
                return
              }
              setMinionsByPlayer(prev => ({
                ...prev,
                [activeSetupPlayer]: [
                  ...prev[activeSetupPlayer].filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, name, strategy: code, defenseFactor }
                ]
              }))
              setSelectedMinion(null)
              setPage("minionSetupHuman")
            }}
          />
        )
      )}

      {page === "preBattle" && (
        <PreBattlePage
          onBack={handleBack}
          wsRoomState={wsRoomState}
          isRoomMode={!!wsRoomId}
          onConfirm={() => {
            if (wsRoomId) {
              stompWs.connect(() => {
                stompWs.send("/app/start-game", { roomId: wsRoomId })
              })
              return
            }
            setPage("game")
          }}
        />
      )}

      {page === "game" && (
        <GameplayPage
          onPlayAgain={handlePlayAgain}
          wsRoomId={wsRoomId}
          localPlayerName={wsPlayerName}
          localPlayerId={wsPlayerId}
          roomState={wsRoomState}
        />
      )}
    </GameWrapper>
  )
}

export default App
