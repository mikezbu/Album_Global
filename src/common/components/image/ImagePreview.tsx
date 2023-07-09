import React from 'react' 
import { generateRandomColor } from 'src/common/styles/SharedStyles'
import { twMerge } from 'tailwind-merge'

export interface IImagePreview { //exports interface with different characteristics
  src?: string
  className?: string
  id: number
  alt?: string
}

export default function ImagePreview(props: IImagePreview) { //generates background color based upon props.id, creates img element with the sourcing
  return (
    <div
      className={twMerge('flex h-full w-full items-center justify-center', props.className)}
      style={{ background: generateRandomColor(props.id) }}
    >
      {props.src && <img src={props.src} className="h-auto w-full" alt={props.alt || ''} />}
    </div>
  )
}
