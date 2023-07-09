import { alpha, Theme } from '@mui/material/styles'
import React from 'react'
import { InputBaseComponentProps, useTheme } from '@mui/material'

const StripeInputComponent = React.forwardRef<any, InputBaseComponentProps>(function StripeInput(
  props,
  ref
) {
  const { component: Component, options, ...other } = props
  const theme: Theme = useTheme()
  const [mountNode, setMountNode] = React.useState<HTMLInputElement | null>(null)

  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (mountNode === null) {
          return
        }

        mountNode.focus()
      },
    }),
    [mountNode]
  )

  return (
    <Component
      onReady={setMountNode}
      options={{
        ...options,
        style: {
          base: {
            color: theme.palette.text.primary,
            fontSize: `${theme.typography.fontSize}px`,
            fontFamily: theme.typography.fontFamily,
            '::placeholder': {
              color: alpha(theme.palette.text.primary, 0.42),
            },
          },
          invalid: {
            color: theme.palette.text.primary,
          },
        },
      }}
      {...other}
    />
  )
})

export default StripeInputComponent
