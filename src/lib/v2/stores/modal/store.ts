import { createStoreContext } from '../../utils/context'
import { useState, useCallback } from 'react'
import { ModalsContext, ModalOpeningOptions, ModalElement } from './types'
export * from './types'

function useModalStore(): ModalsContext {
  const [modals, setModals] = useState<ModalElement[]>([])

  const openModal = useCallback(
    (content: React.ReactNode, options: ModalOpeningOptions = {}) => {
      const modal: ModalElement = {
        content,
        size: options.size || 'default',
      }
      if (!options.keepAll) {
        setModals([modal])
      } else {
        setModals((prev) => {
          const newArray = prev.slice()
          newArray.push(modal)
          return newArray
        })
      }
    },
    []
  )

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  const closeModal = useCallback((index: number, collapse?: boolean) => {
    setModals((modals) =>
      collapse ? modals.slice(0, index - 1) : modals.splice(index, 1)
    )
  }, [])

  const closeLastModal = useCallback(() => {
    setModals((prev) => {
      const arr = prev.slice()
      arr.pop()
      return arr
    })
  }, [])

  return {
    modals,
    closeModal,
    closeAllModals,
    closeLastModal,
    openModal,
  }
}

export const {
  StoreProvider: V2ModalProvider,
  useStore: useModal,
} = createStoreContext(useModalStore, 'modal')