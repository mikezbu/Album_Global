/* eslint-disable no-empty-pattern */
import { Card, CircularProgress, Divider, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import React, { ChangeEvent } from 'react'

import { uuidV4 } from 'src/util/UuidGenerator'

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

interface IUploader {
  onUpload: (file: any) => Promise<void>
  fileSizeLimitMB?: number
  acceptedFileTypes?: string
  multipleFileUpload?: boolean
  maxNumberOfFiles?: number
  uploading?: boolean
}

interface ISelectedFile {
  id: string
  filename: string
  file: File
  duration?: number
  uploading: boolean
}

interface IState {
  selectedFiles: ISelectedFile[]
  error: string[]
  dragOver: boolean
}

class Uploader extends React.Component<IUploader, IState> {
  public static defaultProps = {
    acceptedFileTypes: '*',
    multipleFileUpload: false,
    fileSizeLimitMB: 25,
    maxNumberOfFiles: 10,
    uploading: false,
  }

  public state: IState = {
    selectedFiles: new Array<ISelectedFile>(),
    error: new Array<string>(),
    dragOver: false,
  }

  public render() {
    const { acceptedFileTypes, fileSizeLimitMB, multipleFileUpload } = this.props
    return (
      <div className="rel py-2">
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
            <Card
              variant="outlined"
              className={`flex w-full cursor-pointer flex-col items-center justify-center px-3 py-5 pb-5 hover:opacity-70 ${
                this.state.dragOver ? 'opacity-70' : ''
              }`}
              onDragOver={this.dragOver}
              onDragEnter={this.dragEnter}
              onDragLeave={this.dragLeave}
              onDrop={this.onDrop}
            >
              <Typography variant="subtitle2" className="mb-7">
                Drag and drop files here
              </Typography>
              <Typography variant="caption">
                {acceptedFileTypes.indexOf('*') < 0 && (
                  <>
                    Supported file types are <b>{acceptedFileTypes.replace(/,/g, ' ')}</b>.{` `}
                  </>
                )}
              </Typography>
              <Typography variant="caption">
                Maximum file size per file is <b>{fileSizeLimitMB} MB.</b>
                You may upload up to <b>{this.props.maxNumberOfFiles}</b> files at a time.
              </Typography>
            </Card>
          </label>
        )}

        {this.state.selectedFiles.length > 0 && <Divider className="mb-3" />}

        {this.state.selectedFiles.map((selectedFile, i) => (
          <div key={i} className="flex items-center">
            {selectedFile.uploading ? (
              <CircularProgress size={30} className="mr-3" />
            ) : (
              <CheckIcon />
            )}

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

        {this.state.error.length > 0 &&
          this.state.error.map((error, i) => (
            <div key={i}>
              <Typography key={i} variant="caption" color="error">
                {error}
              </Typography>
            </div>
          ))}
      </div>
    )
  }

  private dragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  private dragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    this.setState({ dragOver: true })
  }

  private dragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    this.setState({ dragOver: false })
  }

  private onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)

    this.handleFileUpload(files)

    this.setState({ dragOver: false })
  }

  private onChangeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files)
    this.handleFileUpload(files)
    event.target.value = null
  }

  private handleFileUpload = (files: File[]) => {
    files.forEach(async file => {
      if (file.size / 1000000 <= this.props.fileSizeLimitMB) {
        let duration = 0

        await getDurationForAudio(file).then((resp: number) => {
          duration = resp
        })

        if (this.state.selectedFiles.length < this.props.maxNumberOfFiles) {
          const filesToUpload = {
            id: uuidV4(),
            filename: file.name,
            file,
            duration,
            uploading: true,
          }

          this.handleUpload(filesToUpload)
        }
      } else {
        const error = this.state.error
        error.push(`File size greater than ${this.props.fileSizeLimitMB} MB for ${file.name}`)
        this.setState({ error })
      }
    })
  }

  private handleUpload = async (filesToUpload: ISelectedFile) => {
    const selectedFiles = this.state.selectedFiles
    selectedFiles.push(filesToUpload)

    this.setState({ selectedFiles })

    await this.props.onUpload(filesToUpload)

    this.setState({
      selectedFiles: this.state.selectedFiles.filter(d => d.id !== filesToUpload.id),
    })
  }
}

export default Uploader
