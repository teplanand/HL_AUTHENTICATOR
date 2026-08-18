// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Icon Imports

import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useDialog } from '../../hooks/useDialog'
import { useConfirmation } from '../../hooks/useConfirmation'
import Close from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'



const SingleDialog = (props: any) => {

  const { t } = useTranslation()

  const {
    title,
    action,
    action2,
    width,
    visible,
    askDataChangeConfirm,
    showCloseButton,
  } = props

  const Component = props?.component

  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')

  const { closeDialog } = useDialog()

  const {
    openConfirmation,
    closeConfirmation,
  } = useConfirmation()

  const [dataChanged, setDataChanged] = useState<boolean>(false)

  const handleClose = () => {
    closeDialog()
  }

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))


  return <Dialog
    open={Boolean(visible)}
    onClose={handleClose}
    maxWidth={width || 'lg'}
    fullWidth={true}
    fullScreen={fullScreen}
    aria-labelledby="customized-dialog-title"
    sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
  >
    <Box className={'drawer-header no-print p-2'} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {typeof title == 'string' ? <Typography variant="h6">{t(title)}</Typography> : title}
      <IconButton
        size="small"
        onClick={handleClose}
        sx={{
          p: '0.438rem',
          borderRadius: 1,
          color: 'text.primary',
          backgroundColor: 'action.selected',

        }}
      >
        <Close fontSize="medium" />
      </IconButton>
    </Box>
    <DialogContent dividers={scroll === 'paper'}>
      <Component setDataChanged={setDataChanged} />
    </DialogContent>

    <DialogActions className={`drawer-footer no-print`}>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        overflow: 'auto',
      }}>
        <Box sx={{ display: 'flex', gap: 1, }}>

          {Boolean(action) && action}

          {
            Boolean(showCloseButton) && <Button variant='outlined'
              onClick={handleClose.bind(this, {})}>{t('Close')}</Button>
          }
        </Box>
        <Box>
          {Boolean(action2) && action2}
        </Box>
      </Box>
    </DialogActions>

  </Dialog>
}

const DialogCustomized = () => {

  const { t } = useTranslation()
  const {
    closeDialog,
    dialog,
  } = useDialog()
  // const {title,action,action2,width} = dialog
  // const Component = dialog?.component
  const handleClose = () => {
    closeDialog()
  }
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')

  return (
    <div>
      {dialog?.map((value: any) => <SingleDialog {...value} key={value?.dialogKey} />)}
    </div>
  )
}

export default DialogCustomized
