import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setConfirmation } from '../redux/components'

export const useConfirmation = () => {

  const dispatch = useAppDispatch()
  const confirmation = useAppSelector((state) => state.components.confirmation)

  const openConfirmation = (params: any) => {
    dispatch(setConfirmation({ visible: true, ...params }))
  }
  const closeConfirmation = () => {
    dispatch(setConfirmation({
      visible: false,
      title: 'Delete Confirmation',
      message: 'Are you sure want to delete?',
      isDoubleConfirm: false,
    }))
  }

  return {
    openConfirmation,
    closeConfirmation,
    confirmation,
  }
}
