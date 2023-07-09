import { IconButton, Slide, Slider, Typography } from '@mui/material'
import PauseIcon from '@mui/icons-material/PauseCircleFilled'
import PlayIcon from '@mui/icons-material/PlayCircleFilled'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import Bugsnag from '@bugsnag/js'
import WaveSurfer from 'wavesurfer.js'
import tailwind from '../../../../tailwind.config'

import Loading from 'src/common/components/layout/Loading'
import { AppState } from 'src/common/store'
import { event } from 'src/util/gtag'
import { getFormattedTimeFromSeconds } from 'src/util/Time'
import ImagePreview from 'src/common/components/image/ImagePreview'

const formWaveSurferOptions = ref => ({
  container: ref,
  waveColor: '#eee',
  progressColor: tailwind.theme.extend.colors.primary.main,
  cursorColor: tailwind.theme.extend.colors.primary.dark,
  barWidth: 3,
  barRadius: 3,
  responsive: true,
  height: 64,
  // If true, normalize by the maximum peak instead of 1.0.
  normalize: true,
  // Use the PeakCache to improve rendering speed of large waveforms.
  partialRender: true,
  scrollParent: true,
})
interface IMediaPlayer {
  appState?: AppState
}

const MediaPlayer = inject('appState')(
  observer((props: IMediaPlayer) => {
    const [ready, setReady] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [wave, setWave] = useState<any>(null)
    const [countUpdated, setCountUpdated] = useState(false)

    const wavesurfer = useRef(null)

    useEffect(() => {
      setReady(false)
      if (props.appState.track?.url && wave) {
        const options = formWaveSurferOptions(wave)
        wavesurfer.current = WaveSurfer.create(options)

        wavesurfer.current.load(props.appState.track.url)

        wavesurfer.current.on('ready', () => {
          event({
            action: 'Play',
            category: 'Track',
            label: props.appState.track.title,
            value: '',
          })
          setReady(true)
          setCountUpdated(false)
        })

        wavesurfer.current.on('error', (error: any) => {
          Bugsnag.notify(error)
        })

        wavesurfer.current.on('finish', () => {
          props.appState.onNext()
        })

        wavesurfer.current.on('seek', () => {
          setCurrentTime(wavesurfer.current.getCurrentTime())
        })

        return () => wavesurfer.current.destroy()
      }
    }, [props.appState, props.appState.track?.title, props.appState.track?.url, wave])

    useEffect(() => {
      if (ready) {
        wavesurfer.current.on('audioprocess', (playedSeconds: number) => {
          setCurrentTime(playedSeconds)

          if (!countUpdated && props.appState.incrementAndUpdatePlayCount) {
            const percentPlayed = (playedSeconds / wavesurfer.current.getDuration()) * 100
            if (percentPlayed > 60) {
              setCountUpdated(true)
            }
          }
        })
      }
    }, [countUpdated, ready, props.appState.incrementAndUpdatePlayCount])

    useEffect(() => {
      if (countUpdated) {
        props.appState.incrementAndUpdatePlayCount()
      }
    }, [countUpdated, props.appState, props.appState.incrementAndUpdatePlayCount])

    useEffect(() => {
      if (ready) {
        if (props.appState.isTrackPlaying) {
          wavesurfer.current.play()
        } else {
          wavesurfer.current.pause()
        }
      }
    }, [ready, props.appState.isTrackPlaying])

    const onNext = () => {
      setCurrentTime(0)

      if (props.appState.onNext) {
        props.appState.onNext()
      }
    }

    const onPrevious = () => {
      setCurrentTime(0)

      if (wavesurfer.current && wavesurfer.current.getCurrentTime() < 3) {
        props.appState.onPrevious()
      } else if (props.appState.onPrevious) {
        wavesurfer.current.play(0)
      }
    }

    const onPlayClick = () => {
      wavesurfer?.current?.play()
      props.appState.onPlay()
    }

    const onPauseClick = () => {
      wavesurfer?.current?.pause()
      props.appState.onPause()
    }

    const { isTrackPlaying, track } = props.appState

    if (!track) {
      return <div></div>
    }

    return (
      <>
        <Slide direction="up" in mountOnEnter unmountOnExit timeout={500}>
          <div className="flex h-16 w-full bg-gradient-to-r from-black to-blue-900 p-2.5 text-white">
            <div className="flex h-full w-full">
              <div
                className="mr-2.5 flex items-center justify-center"
                style={{ minWidth: '50px', maxWidth: '50px' }}
              >
                <ImagePreview id={track.id} src={track.artworkUrl} className="h-[50px] w-[50px]" />
              </div>
              <div className="mr-2.5 flex w-full max-w-[200px] flex-col justify-center">
                <Typography className="overflow-auto break-all" variant="subtitle1">
                  {track.title}
                </Typography>
                <Typography variant="subtitle2">{track.artistName}</Typography>
              </div>

              <div className="flex w-full flex-row">
                {ready && (
                  <div className="mr-2.5 flex w-40 items-center sm:mr-4">
                    <IconButton onClick={onPrevious} color="inherit" size="large">
                      <SkipPreviousIcon />
                    </IconButton>
                    {isTrackPlaying ? (
                      <IconButton onClick={onPauseClick} color="inherit" size="large">
                        <PauseIcon style={{ fontSize: '1.5em' }} />
                      </IconButton>
                    ) : (
                      <IconButton onClick={onPlayClick} color="inherit" size="large">
                        <PlayIcon style={{ fontSize: '1.5em' }} />
                      </IconButton>
                    )}
                    <IconButton onClick={onNext} color="inherit" size="large">
                      <SkipNextIcon />
                    </IconButton>
                  </div>
                )}
                <div className="mr-2.5 hidden w-full items-center md:flex">
                  {ready && (
                    <Typography variant="subtitle2">
                      {currentTime ? getFormattedTimeFromSeconds(currentTime) : '0:00'}
                    </Typography>
                  )}
                  <div id="waveform" className="mx-5 h-full w-full" ref={re => setWave(re)} />
                  {ready && (
                    <Typography variant="subtitle2">
                      {wavesurfer.current.getDuration() &&
                        getFormattedTimeFromSeconds(wavesurfer.current.getDuration())}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
            {!ready && <Loading position="absolute" />}
          </div>
        </Slide>
      </>
    )
  })
)

export default MediaPlayer
