import { Button, IconButton } from '@mui/material'
import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import { useEffect } from 'react'
import { numDaysBetween } from 'src/util/DateUtil'

export enum BannerType {
  Info = 1,
  Warning = 2,
  Error = 3,
}

interface IBanner {
  id: number
  type?: BannerType
  ctaLabel?: string
  ctaAction?: () => void
  message: string
  dismissible: boolean
}

const Banner = ({ id, type, ctaLabel, ctaAction, message, dismissible }: IBanner) => {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem(`${id}-banner-dismissed`) === 'true'
  )

  useEffect(() => {
    if (localStorage.getItem(`${id}-banner-dismissed-date`)) {
      const dismissedDate = new Date(localStorage.getItem(`${id}-banner-dismissed-date`))

      if (numDaysBetween(dismissedDate, new Date()) >= 14) {
        setDismissed(false)
        localStorage.removeItem(`${id}-banner-dismissed`)
        localStorage.removeItem(`${id}-banner-dismissed-date`)
      }
    }
  }, [dismissed, id])

  const getBannerBackground = () => {
    switch (type) {
      case BannerType.Info:
        return 'bg-gray-300'
      case BannerType.Warning:
        return 'bg-amber-300'
      case BannerType.Error:
        return 'bg-red-400'
      default:
        return 'bg-gray-300'
    }
  }

  const dismissBanner = () => {
    setDismissed(true)
    localStorage.setItem(`${id}-banner-dismissed`, 'true')
    localStorage.setItem(`${id}-banner-dismissed-date`, new Date().toString())
  }

  if (dismissed) return <div></div>

  return (
    <div className={`flex w-full ${getBannerBackground()}`}>
      <div className="flex-1 p-4 text-base font-medium text-gray-900">{message}</div>
      <div className="flex flex-col-reverse items-center pt-2 sm:flex-row sm:pt-0">
        {ctaLabel && ctaAction && (
          <Button
            variant="outlined"
            className="my-4 mr-4 border-gray-900 bg-gray-900 text-white hover:border-black hover:bg-black hover:text-primary-main sm:my-0 sm:mr-0"
            size="small"
            onClick={() => ctaAction()}
          >
            {ctaLabel}
          </Button>
        )}

        {dismissible && (
          <IconButton onClick={dismissBanner}>
            <CloseIcon className="text-gray-900 hover:text-primary-dark" />
          </IconButton>
        )}
      </div>
    </div>
  )
}

Banner.defaultProps = {
  type: BannerType.Info,
  dismissible: true,
}

export default Banner
