import { useDispatch, useSelector, useStore } from 'react-redux'
import { removeModal, setModal } from '../redux/components'
 import moment from 'moment'
import { Box } from 'framer-motion'
 
export const useModal = () => {

  // Removed blankLayout due to JSX in .ts file

  const dispatch = useDispatch()
  const store = useStore() as any
   const modal = useSelector((state: any) => state.components.modal)

  const lastmodalopen = modal[modal?.length - 1]

  const openModal = (params: any) => {
    const currentModal = store.getState()?.components?.modal || []
    dispatch(setModal([
      ...currentModal, {
        visible: true,
        modalkey: moment().unix(), ...params,
      },
    ]))
  }
  const closeModal = (modalKey?: number) => {
    const currentModal = store.getState()?.components?.modal || []
    const lastmodal = modalKey
      ? currentModal.find((item: any) => item?.modalkey === modalKey)
      : currentModal[currentModal?.length - 1]

    if (!lastmodal?.modalkey) {
      return
    }

    dispatch(removeModal(lastmodal?.modalkey))
  }

  return {
    openModal,
    closeModal,
    modal,
    lastmodal: lastmodalopen,
    isOpen: lastmodalopen?.visible || false,
  }
}
