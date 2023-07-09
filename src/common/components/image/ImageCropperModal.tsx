//This code defines a React component called 'ImageCropper' that crops images.

import { Box, Button } from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import React, { useState } from 'react'
import ReactCrop from 'react-image-crop'

import Loading from 'src/common/components/layout/Loading'
import { uuidV4 } from 'src/util/UuidGenerator'
import Modal from '../modal/Modal'
import Bugsnag from '@bugsnag/js'

export interface IImageCropper {
  open: boolean
  onClose: () => void // () => void means nothing's returned happens after onClose
  src?: string //? means optional
  className?: string
  filename: string
  onCropComplete: (image) => void // shows image, but does not return anything after onCropComplete
  aspect: number
  circularCrop?: boolean
  forceEdit?: boolean
}

export default function ImageCropper(props: IImageCropper) {
  const [crop, setCrop] = useState(null)
  const [image, setImage] = useState(null)
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

    return new Promise(resolve => { //converts canvas object to Blob and assigns it a name.
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
      setForceEdit(false)
      props.onCropComplete(croppedImgUrl)
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
    return false // Return false when setting crop state in here.
  }

  const onChange = crop => { //onChange, crop is loaded
    setCrop(crop)
  }

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Crop Image"
      content={
        <>
          {loading && <Loading size={40} position="absolute" message="Cropping..." />}
          {props.src && ( //if there is an image, the code below runs.
            <>
              <ReactCrop
                src={props.src} //imageOutlinedIcon rendered with large icon 
                crossorigin="anonymous" //help control image to determine crops 
                crop={crop}
                circularCrop={props.circularCrop}
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
                {!forceEdit ? (   //handles the props.onClose function to close if forceEdit is false
                  <Button onClick={props.onClose} variant="text" autoFocus>
                    Cancel
                  </Button>
                ) : (
                  <div style={{ width: '1px' }}></div>
                )}
                <Button onClick={onCropImageClick} variant="contained" color="primary">
                  Save
                </Button>
              </Box>
            </>
          )}
          {!props.src && <ImageOutlinedIcon fontSize="large" />}
        </>
      }
    />
  )
}

ImageCropper.defaultProps = {
  circularCrop: false,
  forceEdit: true,
}
