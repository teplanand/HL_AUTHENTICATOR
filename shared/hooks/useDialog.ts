import { useDispatch, useSelector } from 'react-redux'
import { removeDialog, setDialog } from '../redux/components'
import moment from 'moment'

export const useDialog = () => {
  // Removed blankLayout due to JSX in .ts file

  const dispatch = useDispatch()
  const dialog = useSelector((state: any) => state.components.dialog)

  const openDialogOld = (params: any) => {
    dispatch(setDialog({ visible: true, ...params }))
  }
  const closeDialogOld = () => {
    dispatch(setDialog({
      ...dialog,
      visible: false,
      title: '',
    }))
  }

  const openDialog = (params: any) => {
    dispatch(setDialog([
      ...dialog, {
        visible: true,
        dialogKey: moment().unix(), ...params,
      },
    ]))
  }

  const closeDialog = () => {
    const lastDialog = dialog[dialog?.length - 1]
    dispatch(removeDialog(lastDialog?.dialogKey))
  }

  return {
    openDialog,
    closeDialog,
    dialog,
  }
}
