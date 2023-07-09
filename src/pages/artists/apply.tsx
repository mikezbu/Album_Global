import { Divider, Step, StepLabel, Stepper } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import Loading from 'src/common/components/layout/Loading'
import { AuthenticationStore, getStore, UserStore } from 'src/common/store'
import ArtistModifyContainer from 'src/modules/artist/components/ArtistModifyContainer'
import ArtistRevShare from 'src/modules/artist/components/ArtistRevShare'
import ArtistSignUpConfirmation from 'src/modules/artist/components/ArtistSignUpConfirmation'
import ArtistTerms from 'src/modules/artist/components/ArtistTerms'

interface IArtistApply {
  authenticationStore?: AuthenticationStore
  userStore?: UserStore
}

const ArtistApply = inject(
  'authenticationStore',
  'userStore'
)(
  observer((props: IArtistApply) => {
    const [isPreCheckInFlight, setIsPreCheckInFlight] = useState(true)

    useEffect(() => {
      if (props.authenticationStore.authenticated) {
        props.userStore.getUserForUpdate()
      } else {
        props.authenticationStore.checkTokenAccess()
      }

      getStore().appState.hideDrawer()

      return getStore().appState.showDrawer
    }, [props.authenticationStore, props.authenticationStore.authenticated, props.userStore])

    useEffect(() => {
      if (
        !props.authenticationStore.authenticated &&
        !props.authenticationStore.authenticationInProgress
      ) {
        props.authenticationStore.setRedirectUrl('/artists/apply')
        Router.push('/sign-up')
        return
      }

      setActiveStep(props.userStore.userUpdate.artistSignUpOnBoardingStep)

      if (
        props.userStore.user.artistSignUpOnBoardingStep === 4 ||
        props.userStore.userUpdate.artistSignUpOnBoardingStep === 4
      ) {
        Router.push('/artists/[slug]', `/artists/my-profile?userId=${props.userStore.user.id}`)
        return
      }

      setIsPreCheckInFlight(false)
    }, [
      props.authenticationStore,
      props.userStore.user.artistSignUpOnBoardingStep,
      props.userStore.user.id,
      props.userStore.userUpdate.artistSignUpOnBoardingStep,
    ])

    const [activeStep, setActiveStep] = useState(0)

    const handleNext = async () => {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
      await props.userStore.updateArtistSignUpOnBoardingStep(activeStep + 1)
      if (activeStep + 1 === 4) {
        Router.push('/artists/[slug]', `/artists/my-profile?userId=${props.userStore.user.id}`)
      }
    }

    const handleBack = () => {
      setActiveStep(prevActiveStep => prevActiveStep - 1)
    }

    const steps = [
      { label: 'Terms & Conditions', component: <ArtistTerms onComplete={handleNext} /> },
      {
        label: 'Your Profile',
        component: (
          <ArtistModifyContainer onComplete={handleNext} createArtist onBack={handleBack} />
        ),
      },
      {
        label: 'Revenue Share Agreement',
        component: <ArtistRevShare onComplete={handleNext} onBack={handleBack} />,
      },
      { label: 'Complete', component: <ArtistSignUpConfirmation onComplete={handleNext} /> },
    ]

    const getCurrentStepComponent = () => {
      return steps[activeStep] ? steps[activeStep].component : <></>
    }

    if (props.userStore.loading || isPreCheckInFlight) {
      return <Loading />
    }

    return (
      <>
        <Head>
          <title key="title">Join Bevios</title>
        </Head>
        <div className="h-full w-full px-6 pt-8 pb-32 sm:px-16">
          <div className="pb-6 text-center text-2xl font-bold text-primary-light">
            Create your artist profile
          </div>
          <Divider className="mb-8" />

          <Stepper activeStep={activeStep} className="pb-6">
            {steps.map(({ label }) => {
              const stepProps: { completed?: boolean } = {}

              return (
                <Step
                  key={label}
                  {...stepProps}
                  completed={activeStep === 3 || stepProps.completed}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              )
            })}
          </Stepper>

          {getCurrentStepComponent()}
        </div>
      </>
    )
  })
)

const ApplyComponent: any = ArtistApply
ApplyComponent.Layout = AuthenticationTemplate

export default ApplyComponent
