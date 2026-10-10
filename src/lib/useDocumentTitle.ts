import { useEffect } from 'react'

const BASE = 'Moss — Digital Garden'

/** Cada página fija su título: ayuda a lectores de pantalla, pestañas del navegador e historial. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Moss` : BASE
  }, [title])
}
