type MessageHandler = (payload: any) => void

const DEFAULT_WS_URL = "wss://backend-kombat68.onrender.com/ws"

const resolveWsUrl = () => {
  const configured = import.meta.env.VITE_WS_URL?.trim()
  if (configured) {
    return configured
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    return `${protocol}//${window.location.hostname}:8080/ws`
  }

  return DEFAULT_WS_URL
}

class SimpleStompWs {
  private socket: WebSocket | null = null
  private connected = false
  private subscriptions = new Map<string, Set<MessageHandler>>()
  private subscribedDestinations = new Set<string>()
  private subSeq = 0
  private readonly wsUrl = resolveWsUrl()
  private pendingConnectedCallbacks: Array<() => void> = []
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelayMs = 1500

  connect(onConnected?: () => void) {
    if (this.connected) {
      onConnected?.()
      return
    }

    if (onConnected) {
      this.pendingConnectedCallbacks.push(onConnected)
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.socket = new WebSocket(this.wsUrl)

    this.socket.onopen = () => {
      const host = (() => {
        try {
          return new URL(this.wsUrl).host
        } catch {
          return "localhost"
        }
      })()

      this.sendFrame("CONNECT", {
        "accept-version": "1.2",
        host,
      })
    }

    this.socket.onmessage = (event) => {
      const text = String(event.data ?? "")
      const frames = text.split("\u0000").filter(Boolean)
      for (const frame of frames) {
        const parsed = this.parseFrame(frame)
        if (!parsed) continue
        if (parsed.command === "CONNECTED") {
          this.connected = true
          this.reconnectDelayMs = 1500
          for (const destination of this.subscriptions.keys()) {
            this.subscribeFrame(destination)
          }
          const callbacks = this.pendingConnectedCallbacks
          this.pendingConnectedCallbacks = []
          for (const callback of callbacks) {
            callback()
          }
          continue
        }
        if (parsed.command === "MESSAGE") {
          const destination = parsed.headers.destination
          if (!destination) continue
          const handlers = this.subscriptions.get(destination)
          if (!handlers || handlers.size === 0) continue
          for (const handler of handlers) {
            try {
              const payload = parsed.body ? JSON.parse(parsed.body) : null
              handler(payload)
            } catch {
              handler(parsed.body)
            }
          }
        }
      }
    }

    this.socket.onerror = () => {
      this.socket?.close()
    }

    this.socket.onclose = () => {
      this.connected = false
      this.socket = null
      this.subscribedDestinations.clear()
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
      }
      if (this.subscriptions.size > 0 || this.pendingConnectedCallbacks.length > 0) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null
          this.connect()
        }, this.reconnectDelayMs)
        this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 8000)
      }
    }
  }

  subscribe(destination: string, handler: MessageHandler) {
    const handlers = this.subscriptions.get(destination) ?? new Set<MessageHandler>()
    handlers.add(handler)
    this.subscriptions.set(destination, handlers)
    if (!this.connected) return
    this.subscribeFrame(destination)
  }

  unsubscribe(destination: string, handler?: MessageHandler) {
    if (!handler) {
      this.subscriptions.delete(destination)
      this.subscribedDestinations.delete(destination)
      return
    }

    const handlers = this.subscriptions.get(destination)
    if (!handlers) {
      return
    }

    handlers.delete(handler)
    if (handlers.size === 0) {
      this.subscriptions.delete(destination)
      this.subscribedDestinations.delete(destination)
    }
  }

  send(destination: string, body: unknown) {
    if (!this.connected) return
    const payload = JSON.stringify(body)
    this.sendFrame("SEND", {
      destination,
      "content-type": "application/json",
      "content-length": String(payload.length),
    }, payload)
  }

  isConnected() {
    return this.connected
  }

  private subscribeFrame(destination: string) {
    if (this.subscribedDestinations.has(destination)) {
      return
    }
    this.subSeq += 1
    this.sendFrame("SUBSCRIBE", {
      id: `sub-${this.subSeq}`,
      destination,
    })
    this.subscribedDestinations.add(destination)
  }

  private sendFrame(command: string, headers: Record<string, string>, body = "") {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
    const lines = [command]
    for (const [k, v] of Object.entries(headers)) {
      lines.push(`${k}:${v}`)
    }
    lines.push("")
    lines.push(body)
    const frame = `${lines.join("\n")}\u0000`
    this.socket.send(frame)
  }

  private parseFrame(frame: string): { command: string; headers: Record<string, string>; body: string } | null {
    const parts = frame.split("\n\n")
    if (parts.length === 0) return null
    const head = parts[0]
    const body = parts.slice(1).join("\n\n")
    const lines = head.split("\n")
    const command = lines[0]?.trim()
    if (!command) return null
    const headers: Record<string, string> = {}
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const idx = line.indexOf(":")
      if (idx <= 0) continue
      headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    }
    return { command, headers, body }
  }
}

export const stompWs = new SimpleStompWs()
