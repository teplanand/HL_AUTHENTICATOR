// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import {useTranslation} from "react-i18next";
import { useAlert } from '../../hooks/useAlert'

const AlertMessage = () => {

    const {t} = useTranslation()
    const {closeAlert, alert} = useAlert()
    const {action,message,title} = alert

    const handleClose = () => {
        closeAlert()
    }


    return (
        <Fragment>
            <Dialog
                open={alert.visible}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose()
                    }
                }}
                className='[&_.MuiPaper-root]:w-full [&_.MuiPaper-root]:max-w-[512px]'
            >
                <DialogTitle id='alert-dialog-title'>{t(title)}</DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>

                        {t(message)}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant={'contained'}  color={'primary'}>{t('OK')}</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}

export default AlertMessage
