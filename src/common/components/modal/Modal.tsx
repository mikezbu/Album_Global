import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'
export interface IModal {
  content: React.ReactNode
  actions?: React.ReactNode
  onBackdropClick?: () => void
  onClose: () => void
  open: boolean
  title: string
  fullWidth?: boolean
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal(props: IModal) {
  return (
    <Dialog
      onClose={props.onClose}
      aria-labelledby="custom-dialog-title"
      open={props.open}
      maxWidth={props.maxWidth}
      fullWidth={props.fullWidth}
    >
      <DialogTitle className="flex items-center justify-between bg-background-main p-2 pl-4 print:hidden">
        {props.title}
        {props.onClose ? (
          <IconButton
            aria-label="close"
            className="ml-2 text-gray-500"
            onClick={props.onClose}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent className="bg-background-main px-4" dividers>
        {props.content}
      </DialogContent>
      {props.actions && (
        <DialogActions className="m-0 bg-background-main px-2 py-3 print:hidden">
          {props.actions}
        </DialogActions>
      )}
    </Dialog>
  )
}

Modal.defaultProps = {
  fullWidth: false,
  maxWidth: 'sm',
}
