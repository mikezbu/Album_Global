//This code defines a React component called 'ImageCropper' that crops images.

import { Box, Button, IconButton } from '@mui/material' //mui is material ui
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import React, { useState } from 'react'
import ReactCrop from 'react-image-crop'
import EditIcon from '@mui/icons-material/Edit'

import Loading from 'src/common/components/layout/Loading'
import { uuidV4 } from 'src/util/UuidGenerator'
import Bugsnag from '@bugsnag/js' //this helps diagnose errors in applications. Used in mobile apps, backend services. Uses JavaScript

export interface IImageCropper {
  src?: string
  className?: string
  filename: string
  onCropComplete: (image) => void
  aspect: number
  circularCrop?: boolean
  forceEdit?: boolean
}

export default function ImageCropper(props: IImageCropper) {
  const [crop, setCrop] = useState(null)
  const [image, setImage] = useState(null)
  const [edit, setEdit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [forceEdit, setForceEdit] = useState(props.forceEdit)

  const getCroppedImg = () => {
    // Get the scale factor of the image
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const canvas = document.createElement('canvas')

    // Set the canvas dimension according to scale of the original picture
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    // Draw the image by calculating in terms of the scale factor
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    return new Promise(resolve => {
      canvas.toBlob(
        (blob: any) => {
          if (!blob) {
            console.error('Canvas is empty')
            return
          }
          if (props.filename) {
            blob.name = props.filename
          } else {
            blob.name = uuidV4() + '.jpg'
          }
          resolve(blob)
        },
        'image/jpeg',
        0.7
      )
    })
  }

  const onCropImageClick = async () => {
    try {
      setLoading(true)
      const croppedImgUrl = await getCroppedImg()
      setLoading(false)
      props.onCropComplete(croppedImgUrl)
      setEdit(false)
      setForceEdit(false)
    } catch (e) {
      Bugsnag.notify(e)
    }
  }

  const onImageLoaded = image => {
    setCrop({
      aspect: props.aspect,
      unit: '%',
      width: 100,
      x: 0,
      y: 0,
    })
    setImage(image)
    setEdit(true)
    return false // Return false when setting crop state in here.
  }

  const onChange = crop => {
    setCrop(crop)
  }

  return (
    <div
      className={[
        'relative flex w-full flex-col items-center justify-center p-2',
        props.className && props.className,
      ].join(' ')}
    >
      {loading && <Loading size={40} position="absolute" message="Cropping..." />}
      {props.src && (
        <>
          {edit && (
            <>
              <ReactCrop
                src={props.src}
                crossorigin="anonymous"
                crop={crop}
                circularCrop={props.circularCrop}
                disabled={!edit}
                onChange={onChange}
                onImageLoaded={onImageLoaded}
              />
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                paddingTop="1.5em"
                paddingBottom="1em"
              >
                {!forceEdit ? (
                  <Button
                    onClick={() => {
                      setEdit(false)
                    }}
                    variant="text"
                    size="small"
                    autoFocus
                  >
                    Cancel
                  </Button>
                ) : (
                  <div style={{ width: '1px' }}></div>
                )}
                <Button onClick={onCropImageClick} variant="contained" color="primary" size="small">
                  Crop
                </Button>
              </Box>
            </>
          )}
          {!edit && (
            <>
              <img alt="crop preview" src={props.src} width="100%" height="auto" />
              <Box width="100%" display="flex" justifyContent="flex-end">
                <IconButton
                  onClick={() => {
                    setCrop({
                      aspect: props.aspect,
                      unit: '%',
                      width: 100,
                      x: 0,
                      y: 0,
                    })
                    setEdit(true)
                  }}
                  size="small"
                  color="primary"
                  className="absolute left-5 top-5"
                >
                  <EditIcon color="primary" />
                </IconButton>
              </Box>
            </>
          )}
        </>
      )}
      {!props.src && <ImageOutlinedIcon fontSize="large" />}
    </div>
  )
}

ImageCropper.defaultProps = {
  circularCrop: false,
  forceEdit: true,
}
