// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

import { useConfirmation } from '../../hooks/useConfirmation'

import { useTranslation } from 'react-i18next'
 import { Box } from '@mui/system'
import TextField from '@mui/material/TextField'

const DialogConfirmation = () => {

  const { t } = useTranslation()

  const {
    closeConfirmation,
    confirmation,
  } = useConfirmation()

  const {
    action,
    message,
    title,
    positiveButtonProps,
    negativeButtonProps,
    isDoubleConfirm,
  } = confirmation

  const [confirm, setConfirm] = useState(isDoubleConfirm ? '' : 'DELETE')

  useEffect(()=>{
    setConfirm(isDoubleConfirm ? '' : 'DELETE')
  },[isDoubleConfirm])

  const handleClose = () => {
    closeConfirmation()
  }

  return (
    <Fragment>
      <Dialog
        open={confirmation.visible}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        sx={{
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: 512,
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">{t(title)}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t(message)}
          </DialogContentText>
          {
            isDoubleConfirm && <Box sx={{
              mt: 4,
            }}>
              <TextField
                placeholder={t('Type DELETE to confirm')}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                }}
              />
            </Box>
          }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant={'outlined'}
            color={'secondary'}
            {...negativeButtonProps} >
            {t('Disagree')}
          </Button>
          <Button
            onClick={action}
            variant={'contained'}
            color={'error'}
            disabled={confirm !== 'DELETE'}
            {...positiveButtonProps}>
            {t('Agree')}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DialogConfirmation
