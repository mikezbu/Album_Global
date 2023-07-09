import { Alert, Box, Button, Divider, Grid, Typography } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import FacebookIcon from '@mui/icons-material/Facebook'
import RedditIcon from '@mui/icons-material/Reddit'
import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  EmailShareButton,
  FacebookShareButton,
  RedditShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share'

import Modal from 'src/common/components/modal/Modal'
import { getStore } from '../store'
import { MessageVariant } from '../store/AppState'
import ImagePreview from './image/ImagePreview'

interface IShareModal {
  open: boolean
  onClose: () => void
  url: string
  id?: number
  imgUrl?: string
  header?: string
  subheader?: string
}

class ShareModal extends React.Component<IShareModal> {
  public render() {
    const { id, open, url, header, subheader, imgUrl } = this.props

    return (
      <Modal
        content={
          <>
            <Box marginBottom="1em" display="flex" justifyContent="center" flexDirection="column">
              {header ||
                (subheader && (
                  <div className="mb-4 flex w-full flex-col justify-center p-2">
                    <div className="flex items-center">
                      <div className="mr-4 flex flex-col items-center">
                        {id && (
                          <ImagePreview id={id} src={imgUrl} className="h-[100px] w-[100px]" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        {header && <div className="text-lg font-semibold">{header}</div>}
                        {subheader && <div className="text-base opacity-80">{subheader}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              <Alert
                severity="info"
                icon={<></>}
                style={{ wordBreak: 'break-word' }}
                classes={{ message: 'text-center w-full', root: 'my-4' }}
                variant="outlined"
              >
                {url}
              </Alert>
              <CopyToClipboard text={url} onCopy={this.copyToClipboardSuccess}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  style={{ marginTop: '1em' }}
                >
                  Copy
                </Button>
              </CopyToClipboard>
            </Box>
            <Divider style={{ marginBottom: '1em' }} />
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              <Grid item>
                <FacebookShareButton url={url}>
                  <div className="hover:pointer flex flex-col items-center hover:text-primary-main">
                    <FacebookIcon fontSize="large" style={{ color: '#3b5998' }} />
                    Facebook
                  </div>
                </FacebookShareButton>
              </Grid>
              <Grid item>
                <TwitterShareButton url={url}>
                  <div className="hover:pointer flex flex-col items-center hover:text-primary-main">
                    <TwitterIcon fontSize="large" style={{ color: '#00acee' }} />
                    Twitter
                  </div>
                </TwitterShareButton>
              </Grid>
              <Grid item>
                <RedditShareButton url={url}>
                  <div className="hover:pointer flex flex-col items-center hover:text-primary-main">
                    <RedditIcon fontSize="large" style={{ color: '#FF4301' }} />
                    Reddit
                  </div>
                </RedditShareButton>
              </Grid>
              <Grid item>
                <WhatsappShareButton url={url}>
                  <div className="hover:pointer flex flex-col items-center hover:text-primary-main">
                    <WhatsAppIcon fontSize="large" style={{ color: '#4FCE5D' }} />
                    WhatsApp
                  </div>
                </WhatsappShareButton>
              </Grid>
              <Grid item>
                <TelegramShareButton url={url}>
                  <div className="hover:pointer flex flex-col items-center hover:text-primary-main">
                    <TelegramIcon fontSize="large" style={{ color: '#0088CC' }} />
                    Telegram
                  </div>
                </TelegramShareButton>
              </Grid>
            </Grid>
          </>
        }
        onClose={this.onCloseModal}
        onBackdropClick={this.onCloseModal}
        open={open}
        maxWidth="xs"
        fullWidth
        title="Share"
      />
    )
  }

  private onCloseModal = () => {
    this.props.onClose()
  }

  private copyToClipboardSuccess = () => {
    getStore().appState.setMessage(MessageVariant.Info)
    getStore().appState.setMessage('Copied to clipboard')
    getStore().appState.setShowMessage(true)

    this.onCloseModal()
  }
}

export default ShareModal
