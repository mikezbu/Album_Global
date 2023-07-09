import { observer } from 'mobx-react'
import React from 'react'
import ReactPlayer from 'react-player'

import { getStore } from 'src/common/store'
import { SampleModel } from 'src/modules/sample/store'

interface ISamplePlayer {
  isSamplePlaying: boolean
  sample: SampleModel
  onEnded: () => void
  onPause: () => void
  onPlay: () => void
  incrementPlayCount?: (sampleId: number) => void
}

const SamplePlayer = observer(
  class SamplePlayer extends React.Component<ISamplePlayer> {
    public state = {
      ready: false,
      currentTime: 0,
      player: null,
      countUpdated: false,
    }

    componentDidUpdate() {
      if (getStore().appState.isTrackPlaying && this.props.isSamplePlaying) {
        this.onEnded()
      }
    }

    public render() {
      const { isSamplePlaying, onPause, sample } = this.props

      if (!sample) {
        return <React.Fragment></React.Fragment>
      }

      return (
        <React.Fragment>
          {getStore().appState.isTrackPlaying && <></>}
          <ReactPlayer
            ref={this.ref}
            url={sample.url}
            playing={isSamplePlaying}
            width="0px"
            height="0px"
            onReady={this.onReady}
            onPause={onPause}
            onPlay={this.onPlay}
            onEnded={this.onEnded}
            onProgress={this.onProgress}
            onError={this.onError}
            volume={0.7}
          />
        </React.Fragment>
      )
    }

    private ref = (player: any) => {
      this.setState({ player })
    }

    private onReady = () => {
      this.setState({ ready: true, countUpdated: false })
    }

    private onError = () => {
      this.setState({ ready: false, countUpdated: false })
    }

    private onEnded = () => {
      this.setState({ countUpdated: false })
      this.props.onEnded()
    }

    private onPlay = () => {
      if (getStore().appState.onStop) {
        getStore().appState.onStop()
      }

      this.props.onPlay()
    }

    private onProgress = (stats: any) => {
      if (this.state.ready && this.state.player && this.props.incrementPlayCount) {
        const percentPlayed = (stats.playedSeconds / this.state.player.getDuration()) * 100
        if (percentPlayed > 60 && !this.state.countUpdated && this.props.isSamplePlaying) {
          this.setState({ countUpdated: true })
          if (this.props.incrementPlayCount) {
            this.props.incrementPlayCount(this.props.sample.id)
          }
        }
      }
    }
  }
)

export default SamplePlayer
