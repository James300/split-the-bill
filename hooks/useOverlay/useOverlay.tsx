import { useCallback, useContext } from 'react'
import { OverlayContext, initialState } from '@/providers/OverlayProvider/OverlayProvider'

function useOverlay() {
  const { state, setState } = useContext(OverlayContext)

  const createOverlay = useCallback((
    title: string,
    onClose?: () => void,
  ) => {
    setState({
      isOpen: true,
      title,
      onClose,
    })
  }, [])

  const closeOverlay = useCallback(() => {
    state.onClose?.()

    setState(initialState)
  }, [state])

  return {
    isOpen: state.isOpen,
    createOverlay,
    closeOverlay,
  }
}

export default useOverlay
