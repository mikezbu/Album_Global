import React from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from '@mui/material'

let openConfirmDialogFn

class Confirm extends React.Component {
  public state = {
    open: false,
    title: 'Are you sure?',
    message: '',
    successMessage: '',
    confirmActionText: 'Ok',
    onAnswer: (answer: boolean) => answer,
  }

  public render() {
    if (this.state.open) {
      return (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" className="bg-background-main">
            {this.state.title}
          </DialogTitle>
          <Divider variant="fullWidth" />
          <DialogContent
            className="bg-background-main p-4"
            style={{ minWidth: '530px', minHeight: '100px' }}
          >
            <DialogContentText id="alert-dialog-description">
              {this.state.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions className="bg-background-main py-3 px-3">
            <Button
              onClick={this.handleClose}
              variant="contained"
              autoFocus
              size="small"
              className="mr-3"
            >
              Cancel
            </Button>
            <Button onClick={this.handleYes} variant="text" size="small" className="mr-2">
              {this.state.confirmActionText}
            </Button>
          </DialogActions>
        </Dialog>
      )
    }

    return <div></div>
  }

  public componentDidMount() {
    openConfirmDialogFn = this.openConfirmDialog
  }

  public handleClose = () => {
    this.setState({ open: false })
    this.state.onAnswer(false)
  }

  public handleYes = () => {
    this.setState({ open: false })
    this.state.onAnswer(true)
  }

  public openConfirmDialog = ({ title, message, onAnswer, confirmActionText }) => {
    this.setState({ open: true, title, message, onAnswer, confirmActionText })
  }
}

export function openConfirmDialog({
  title,
  message,
  onAnswer,
  confirmActionText,
}: {
  title: string
  message: string
  onAnswer: (answer: boolean) => void
  confirmActionText?: string
}) {
  openConfirmDialogFn({ title, message, onAnswer, confirmActionText })
}

export default Confirm
