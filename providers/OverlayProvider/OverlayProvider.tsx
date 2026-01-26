'use client'

import { createContext, useState } from 'react'
import Overlay from '@/components/Overlay/Overlay'

export interface IOverlayState {
  isOpen: boolean
  title: string
  onClose?: () => void
}

export interface IOverlayContext {
  state: IOverlayState
  setState: (state: IOverlayState) => void
}

export const initialState: IOverlayState = {
  isOpen: false,
  title: '',
  onClose: () => {},
}

export const OverlayContext = createContext<IOverlayContext>({
  state: initialState,
  setState: () => {},
})

export const OverlayProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, setState] = useState<IOverlayState>(initialState)

  const props = {
    state,
    setState,
  }

  return (
    <OverlayContext.Provider value={props}>
      <Overlay {...props.state} />
      {children}
    </OverlayContext.Provider>
  )
}
