import { Box, Button, Divider, Link } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'

import ForgotPassword from 'src/modules/login/component/ForgotPassword'
import LoginForm from 'src/modules/login/component/LoginForm'

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return (
        <>
          <Typography variant="h6" gutterBottom align="center">
            Login
          </Typography>
          <Divider style={{ marginBottom: '1em' }} />
          <LoginForm modal={false} formElementsOnly />
        </>
      )
    case 1:
      return (
        <>
          <Typography variant="h6" gutterBottom align="center">
            Forgot Password
          </Typography>
          <Divider style={{ marginBottom: '1em' }} />
          <ForgotPassword formElementsOnly />
        </>
      )
    default:
      return 'How did you get here!?'
  }
}

export default function Authentication() {
  const [activeStep, setActiveStep] = React.useState(0)

  const handleLogin = () => {
    setActiveStep(0)
  }

  const handleForgotPasswordClick = () => {
    setActiveStep(1)
  }

  return (
    <div className="flex w-full flex-col justify-center">
      {getStepContent(activeStep)}
      {activeStep === 0 && (
        <Box component="div" marginTop="2em" display="flex" justifyContent="center">
          <Button color="primary" size="small" onClick={handleForgotPasswordClick}>
            Forgot password?
          </Button>
        </Box>
      )}
      {activeStep === 1 && (
        <Box component="div" marginTop="2em" display="flex" justifyContent="center">
          <Button color="primary" size="small" onClick={handleLogin}>
            Login
          </Button>
        </Box>
      )}
    </div>
  )
}
