// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Icon Imports
import { useModal } from '../../hooks/useModal'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConfirmation } from '../../hooks/useConfirmation'
import Icon from '@mui/material/Icon'
import Close from '@mui/icons-material/Close'
import { DialogActions } from '@mui/material'

const Header = styled(Box)<BoxProps>(({ theme }) => (
  {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(6),
    justifyContent: 'space-between',
  }
))
const Footer = styled(Box)<BoxProps>(({ theme }) => (
  {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    justifyContent: 'space-between',
  }
))

const SingleDrawer = memo((props: any) => {

  const { t } = useTranslation()

  const {
    visible,
    title,
    action,
    action2,
    action3,
    action4,
    width: widthprops,
    widthprops: legacyWidthProps,
    hideactions: hideactionprops = false,
    modalkey,
    askDataChangeConfirm,
    hideCloseButton,
    hideFooter: hideFooterProps = false,
    showCloseButton,
    defaultActionButtonLoading,
    dialogContentProps,
    checkCloseEvent,
  } = props

  const {
    closeModal,
  } = useModal()

  const Component = props?.component

  const [scroll, setScroll] = useState<any['scroll']>('paper')

  const {
    openConfirmation,
    closeConfirmation,
  } = useConfirmation()

  const [dataChanged, setDataChanged] = useState<boolean>(false)
  const [displayTitle, setDisplayTitle] = useState(title)
  const [actionButtonLoading, setActionButtonLoading] = useState<boolean>(defaultActionButtonLoading || false)

  const [hideactions, setHideActions] = useState<boolean>(hideactionprops || false)
  const [hideFooter, setHideFooter] = useState<boolean>(hideFooterProps || false)
  const explicitWidth = widthprops ?? legacyWidthProps
  const [width, setWidth] = useState(explicitWidth)
  const [drawerAction, setDrawerAction] = useState(action)
  const [drawerAction2, setDrawerAction2] = useState(action2)
  const [drawerAction3, setDrawerAction3] = useState(action3)
  const [drawerAction4, setDrawerAction4] = useState(action4)

  useEffect(() => {
    setDrawerAction(action)
    setDrawerAction2(action2)
    setDrawerAction3(action3)
    setDrawerAction4(action4)
  }, [action, action2, action3, action4])

  const handleSetWidth = (nextWidth: number | string) => {
    if (explicitWidth !== undefined && explicitWidth !== null) {
      return
    }

    setWidth(nextWidth)
  }

  const [hideAnyAction, setHideAnyAction] = useState({
    action: true,
    action2: true,
    action3: true,
    action4: true,
    action5: true,
    action6: true,
    action7: true,
  })

  const [closeEventCall, setCloseEventCall] = useState<boolean>(false)

  const handleClose = (param: any, event?: any) => {

    if (checkCloseEvent) {
      setCloseEventCall(true)
      setTimeout(() => {
        if (dataChanged && askDataChangeConfirm) {
          openConfirmation({
            title: 'Confirm discard changes',
            message: 'Your changes have not been saved. Discard changes?',
            action: () => {
              closeModal()
              closeConfirmation()
            },
          })
        } else {
          closeModal()
        }
      }, 50)
    } else {
      if (dataChanged && askDataChangeConfirm) {
        openConfirmation({
          title: 'Confirm discard changes',
          message: 'Your changes have not been saved. Discard changes?',
          action: () => {
            closeModal()
            closeConfirmation()
          },
        })
      } else {
        closeModal()
      }
    }
  }

  return <Drawer
    key={modalkey}
    open={visible}
    anchor="right"
    variant="temporary"
    onClose={handleClose.bind(this, { 'aria-labelledby': modalkey })}
    ModalProps={{ keepMounted: true }}
    sx={{
      '& .MuiDrawer-paper': {
        width: {
          xs: '100%',
          sm: width || 400,
          md: width || 400,
        },
        maxWidth: '100%',

      },
    }}
    className='drawer-modal'
  >
    <Box className={'drawer-header no-print p-2'} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {typeof displayTitle == 'string' ? <Typography variant="h6">{t(displayTitle)}</Typography> : displayTitle}
      <IconButton
        size="small"
        onClick={handleClose.bind(this, {})}
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
    <DialogContent
      dividers={scroll === 'paper'}
      className={`drawer-body ${hideactions ? 'hide-actions' : ''} drawer-body-print`}
      {...dialogContentProps}
    >

      <Component
        setDisplayTitle={setDisplayTitle}
        setDataChanged={setDataChanged}
        setActionButtonLoading={setActionButtonLoading}
        setHideActions={setHideActions}
        setHideFooter={setHideFooter}
        setAction={setDrawerAction}
        setAction2={setDrawerAction2}
        setAction3={setDrawerAction3}
        setAction4={setDrawerAction4}
        setWidth={handleSetWidth}
        closeEventCall={closeEventCall}
        setHideAnyAction={setHideAnyAction}
      />

    </DialogContent>

    <DialogActions className={`drawer-footer no-print ${hideFooter ? 'hidden' : ''}`}>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        overflow: 'auto',
      }}>
        <Box sx={{ display: 'flex', gap: 1, }}>

          {Boolean(drawerAction) && drawerAction}
          {Boolean(drawerAction3) && drawerAction3}
          {Boolean(drawerAction4) && drawerAction4}
          {
            Boolean(showCloseButton) && <Button variant='outlined'
              onClick={handleClose.bind(this, {})}>{t('Close')}</Button>
          }
        </Box>
        <Box>
          {Boolean(drawerAction2) && drawerAction2}
        </Box>
      </Box>
    </DialogActions>

  </Drawer>
}, (oldProps, newProps) => {
  return oldProps?.modalkey == newProps.modalkey
})

const Index = (props: any) => {

  const {
    closeModal,
    modal,
  } = useModal()

  return (
    <div>
      {modal.map((modalItem: any) => <SingleDrawer key={modalItem?.modalkey} {...modalItem} />)}
    </div>
  )
}

export default Index
