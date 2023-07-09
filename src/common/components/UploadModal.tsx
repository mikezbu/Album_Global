/* eslint-disable no-empty-pattern */
import { Alert, Box, Button, Divider, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import React, { ChangeEvent } from 'react'

import Loading from 'src/common/components/layout/Loading'
import Modal from 'src/common/components/modal/Modal'

const getDurationForAudio = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const audio: HTMLAudioElement = document.createElement('audio')

    reader.onload = (progressEvent: ProgressEvent<FileReader>) => {
      audio.src = progressEvent.target.result.toString()
      audio.addEventListener(
        'loadedmetadata',
        () => {
          resolve(Math.round(audio.duration))
        },
        false
      )
      audio.addEventListener('error', err => {
        reject(err)
      })
    }

    reader.onerror = err => {
      reject(err)
    }

    reader.readAsDataURL(file)
  })
}

interface IUploadModal {
  open: boolean
  onClose: () => void
  onUpload: ([]) => void
  fileSizeLimitMB?: number
  label?: string
  acceptedFileTypes?: string
  multipleFileUpload?: boolean
  maxNumberOfFiles?: number
  uploading?: boolean
}
interface ISelectedFile {
  filename: string
  file: File
  duration?: number
}

interface IState {
  selectedFiles: ISelectedFile[]
  error: string[]
}

class UploadModal extends React.Component<IUploadModal, IState> {
  public static defaultProps = {
    label: 'files',
    acceptedFileTypes: '*',
    multipleFileUpload: false,
    fileSizeLimitMB: 25,
    maxNumberOfFiles: 10,
    uploading: false,
  }

  public state: IState = {
    selectedFiles: new Array<ISelectedFile>(),
    error: new Array<string>(),
  }

  public render() {
    const { open, acceptedFileTypes, fileSizeLimitMB, multipleFileUpload, label } = this.props
    return (
      <Modal
        content={
          <>
            <Box component="div" marginBottom="1em">
              <Alert variant="outlined" severity="info">
                <div>
                  Maximum file size per file is <b>{fileSizeLimitMB} MB</b>
                </div>
                {acceptedFileTypes.indexOf('*') < 0 && (
                  <div>
                    Supported file types are <b>{acceptedFileTypes.replace(/,/g, ' ')}</b>
                  </div>
                )}
                <div>
                  You may upload up to <b>{this.props.maxNumberOfFiles}</b> files
                </div>
              </Alert>
            </Box>

            <input
              accept={acceptedFileTypes}
              id="contained-button-file"
              type="file"
              onChange={this.onChangeUpload}
              multiple={multipleFileUpload}
              disabled={!multipleFileUpload && this.state.selectedFiles.length > 0}
              style={{ display: 'none' }}
            />

            {this.state.selectedFiles.length < this.props.maxNumberOfFiles && (
              <label htmlFor="contained-button-file">
                <Button
                  component="span"
                  id="select-file-button"
                  variant="contained"
                  color="primary"
                  aria-label="select files"
                  disabled={!multipleFileUpload && this.state.selectedFiles.length > 0}
                >
                  {this.getLabelForSelectFile()}
                </Button>
              </label>
            )}

            {this.state.selectedFiles.length > 0 && <Divider style={{ marginTop: '1em' }} />}

            {this.props.uploading && <Loading size={40} message="Uploading files... please wait" />}

            {this.state.selectedFiles.map((selectedFile, i) => (
              <div key={i} className="flex py-2">
                <IconButton
                  aria-label="Delete"
                  color="inherit"
                  onClick={() => this.deleteUploadedFile(selectedFile.filename)}
                  size="large"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography variant="caption">{selectedFile.filename}</Typography>
                  <div>
                    <Typography variant="caption">
                      {(selectedFile.file.size / 1000000).toFixed(2)} MB
                    </Typography>
                  </div>
                </div>
              </div>
            ))}

            {this.state.selectedFiles.length > 0 && <Divider className="my-2" />}

            {this.state.selectedFiles.length > 0 && (
              <div className="py-2">
                <Typography
                  variant="subtitle2"
                  color={
                    this.state.selectedFiles.length === this.props.maxNumberOfFiles
                      ? 'error'
                      : 'inherit'
                  }
                >
                  {`${this.state.selectedFiles.length} out of ${this.props.maxNumberOfFiles} files selected`}
                </Typography>
              </div>
            )}

            {this.state.error.length > 0 &&
              this.state.error.map((error, i) => (
                <div key={i}>
                  <Typography key={i} variant="caption" color="error">
                    {error}
                  </Typography>
                </div>
              ))}
          </>
        }
        actions={
          <Button
            aria-label="upload"
            variant="contained"
            color="primary"
            disabled={this.state.selectedFiles.length === 0 || this.props.uploading}
            onClick={this.uploadFiles}
          >
            Upload
          </Button>
        }
        onClose={this.onCloseModal}
        open={open}
        maxWidth="sm"
        fullWidth
        title={`Upload ${label}`}
      />
    )
  }

  private onCloseModal = () => {
    this.setState({
      selectedFiles: new Array<ISelectedFile>(),
      error: new Array<string>(),
    })

    this.props.onClose()
  }

  private getLabelForSelectFile = () => {
    if (
      this.props.multipleFileUpload &&
      this.state.selectedFiles.length > 0 &&
      this.state.selectedFiles.length < this.props.maxNumberOfFiles
    ) {
      return 'Add more files'
    } else if (this.props.multipleFileUpload && this.state.selectedFiles.length === 0) {
      return 'Select files'
    }

    return 'Select a file'
  }

  private deleteUploadedFile = (filename: string) => {
    const selectedFiles = this.state.selectedFiles.filter(
      selectedFile => selectedFile.filename !== filename
    )

    this.setState({ selectedFiles, error: new Array<string>() })
  }

  private onChangeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files)

    files.forEach(async file => {
      if (file.size / 1000000 <= this.props.fileSizeLimitMB) {
        let duration = 0

        await getDurationForAudio(file).then((resp: number) => {
          duration = resp
        })

        if (this.state.selectedFiles.length < this.props.maxNumberOfFiles) {
          const selectedFiles = this.state.selectedFiles
          selectedFiles.push({ filename: file.name, file, duration })
          this.setState({ selectedFiles })
        }
      } else {
        const error = this.state.error
        error.push(`File size greater than ${this.props.fileSizeLimitMB} MB for ${file.name}`)
        this.setState({ error })
      }
    })

    event.target.value = null
  }

  private uploadFiles = () => {
    this.props.onUpload(this.state.selectedFiles)
  }
}

export default UploadModal
