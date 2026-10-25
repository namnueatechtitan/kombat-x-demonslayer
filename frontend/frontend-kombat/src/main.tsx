import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import logoUrl from './assets/images/logo.png'

const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']")

if (favicon) {
  favicon.href = logoUrl
} else {
  const link = document.createElement("link")
  link.rel = "icon"
  link.type = "image/png"
  link.href = logoUrl
  document.head.appendChild(link)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
