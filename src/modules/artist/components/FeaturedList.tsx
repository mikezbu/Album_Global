import React from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import SwipeableViews from 'react-swipeable-views'
import { autoPlay } from 'react-swipeable-views-utils'
import { ExploreArtistsStore } from 'src/common/store'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import Loading from 'src/common/components/layout/Loading'
import { ArtistModel } from '../store'
import { Box, CircularProgress, IconButton, Pagination } from '@mui/material'
import Router from 'next/router'

const PREFIX = 'FeaturedList'

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  wrapper: `${PREFIX}-wrapper`,
  featuredContainer: `${PREFIX}-featuredContainer`,
  pointer: `${PREFIX}-pointer`,
  metadataContainer: `${PREFIX}-metadataContainer`,
  stepper: `${PREFIX}-stepper`,
  buttonsContainer: `${PREFIX}-buttonsContainer`,
  buttons: `${PREFIX}-buttons`,
}

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {
    width: '100%',
    flexGrow: 1,
    position: 'relative',
    borderRadius: '2px',
  },

  [`& .${classes.header}`]: {},

  [`& .${classes.wrapper}`]: {
    display: 'flex',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '2px',

    '@media screen and (max-width: 600px)': {
      height: '275px',
    },

    '@media screen and (min-width: 600px)': {
      height: '327px',
    },
  },

  [`& .${classes.featuredContainer}`]: {
    padding: '1em 0',
    borderRadius: '2px',
  },

  [`& .${classes.pointer}`]: {
    cursor: 'pointer',
  },

  [`& .${classes.metadataContainer}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '1em',
    paddingLeft: '3em',
  },

  [`& .${classes.stepper}`]: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0.5em',

    '@media screen and (max-width: 600px)': {
      display: 'none',
    },
  },

  [`& .${classes.buttonsContainer}`]: {
    position: 'absolute',
    top: '50%',
    left: '-2.5em',
    right: '-2.5em',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',

    '@media screen and (max-width: 600px)': {
      display: 'none',
    },
  },

  [`& .${classes.buttons}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
    alignItems: 'center',
  },
}))

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

interface IFeaturedList {
  exploreArtistsStore?: ExploreArtistsStore
}

interface IState {
  activeStep: number
}

const FeaturedList = inject('exploreArtistsStore')(
  observer(
    class FeaturedList extends React.Component<IFeaturedList, IState> {
      public state: IState = {
        activeStep: 0,
      }

      private readonly _exploreArtistsStore: ExploreArtistsStore

      constructor(props: IFeaturedList) {
        super(props)

        this._exploreArtistsStore = props.exploreArtistsStore
        this._exploreArtistsStore.setPageSize(5)
        this._exploreArtistsStore.fetchArtists()
      }

      private handleNext = () => {
        this.setState({ activeStep: this.state.activeStep + 1 })
      }

      private handleBack = () => {
        this.setState({ activeStep: this.state.activeStep - 1 })
      }

      private handleStepChange = (step: number) => {
        this.setState({ activeStep: step })
      }

      private handleStepClick = (event, step: number) => {
        this.setState({ activeStep: step - 1 })
      }

      private getMaxSteps = () => {
        return this._exploreArtistsStore.artists.size
      }

      private goToArtist = (urlAlias: string) => () => {
        Router.push('/artists/[slug]', `/artists/${urlAlias}`)
      }

      render() {
        const artists = values(this._exploreArtistsStore.artists)

        return (
          <div className="relative rounded-sm">
            {this._exploreArtistsStore.loading && (
              <div className="flex h-56 w-full items-center justify-center overflow-hidden bg-black/70 sm:h-80">
                <CircularProgress />
              </div>
            )}

            {!this._exploreArtistsStore.loading && (
              <>
                <AutoPlaySwipeableViews
                  axis="x"
                  index={this.state.activeStep}
                  onChangeIndex={this.handleStepChange}
                  enableMouseEvents
                  interval={5000}
                  style={{ borderRadius: '2px' }}
                >
                  {artists.map((artist: ArtistModel) => (
                    <Box
                      key={artist.id}
                      className="cursor-pointer rounded-sm"
                      display="flex"
                      justifyContent="center"
                      onClick={this.goToArtist(artist.urlAlias)}
                      style={
                        artist.heroImageUrl.length > 0
                          ? {
                              backgroundImage: `url(${artist.heroImageUrl})`,
                              backgroundSize: 'cover',
                            }
                          : {}
                      }
                    >
                      <div
                        className="flex h-56 w-full items-end justify-center overflow-hidden bg-black/60 pb-16 sm:h-80 sm:pb-28"
                        style={
                          artist.heroImageUrl && artist.heroImageUrl.length > 0
                            ? { color: 'white', justifyContent: 'flex-start' }
                            : { color: 'black', justifyContent: 'flex-start' }
                        }
                      >
                        <div className="flex cursor-pointer pl-6 text-2xl font-semibold text-primary-light sm:pl-6 sm:text-3xl">
                          {artist.name}
                        </div>
                      </div>
                    </Box>
                  ))}
                </AutoPlaySwipeableViews>

                {/* <div className="hidden sm:flex flex-col flex-grow absolute top-[40%] left-0 right-0">
                  <div className="flex justify-between items-center h-full">
                    <IconButton
                      size="small"
                      onClick={this.handleBack}
                      disabled={this.state.activeStep === 0}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={this.handleNext}
                      disabled={this.state.activeStep === this.getMaxSteps() - 1}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </div>
                </div>
                <Pagination
                  variant="outlined"
                  size="small"
                  page={this.state.activeStep + 1}
                  onChange={this.handleStepClick}
                  count={this.getMaxSteps()}
                  className="hidden sm:flex justify-center mt-4"
                  hideNextButton
                  hidePrevButton
                /> */}
              </>
            )}
          </div>
        )
      }
    }
  )
)

export default FeaturedList
