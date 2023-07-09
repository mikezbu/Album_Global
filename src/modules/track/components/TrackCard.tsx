import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import PauseIcon from '@mui/icons-material/Pause'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ShareIcon from '@mui/icons-material/Share'
import { Box, Button, Chip } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { TrackModel } from '../store'
import { ActionType } from './TrackGrid'
import { generateRandomColor } from 'src/common/styles/SharedStyles'
import { AppState } from 'src/common/store'
import Router from 'next/router'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import clsx from 'clsx'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import TagModel from 'src/modules/tag/store/model/TagModel'
import { TrackStatus } from '../store/model/TrackModel'

export interface ITrackCard {
  appState?: AppState
  track: TrackModel
  actionType: ActionType
  handleClick: (id: number) => void
  onOpenShareModal: (id: number) => void
  onPriceClick: (id: number) => void
  playbackControl: (state: number) => void
  isSelected: boolean
  showStatus?: boolean
}

const TrackCard = inject('appState')(
  observer((props: ITrackCard) => {
    const [expanded, setExpanded] = React.useState(false)
    const [hovered, setHovered] = React.useState(false)

    const handleExpandClick = () => {
      setExpanded(!expanded)
    }

    const onPlay = () => {
      props.handleClick(props.track.id)
      props.playbackControl(2)
    }

    const onPause = () => {
      props.playbackControl(1)
    }

    const isSelected = (): boolean => {
      return props.isSelected
    }

    const onOpenShareModal = () => {
      props.onOpenShareModal(props.track.id)
    }

    const onPriceClick = () => {
      props.onPriceClick(props.track.id)
    }

    const onArtistClick = () => {
      Router.push('/artists/[slug]', `/artists/${props.track.artistUrlAlias}`)
    }

    const onTrackClick = () => {
      Router.push(`/tracks/${props.track.id}`)
    }

    const canExpand = () => {
      return (
        props.track.genres?.length > 0 ||
        props.track.key?.name != '' ||
        props.track.instruments?.length > 0
      )
    }

    const getStatusColor = (status: number) => {
      switch (status) {
        case TrackStatus.Unpublished:
          return 'bg-yellow-600'
        case TrackStatus.Published:
          return 'bg-green-600'
        case TrackStatus.Archived:
          return 'bg-red-600'
        default:
          return 'N/A'
      }
    }

    return (
      <div className="group flex h-full w-full min-w-[100px] max-w-[250px] flex-col overflow-hidden rounded-sm bg-background-dark transition-all hover:shadow-sm hover:shadow-background-light">
        <div className="relative">
          <div className="absolute bottom-0 hidden w-full justify-between p-2.5 transition duration-500 ease-in group-hover:flex">
            {/* <IconButton aria-label="add to favorites">
              <FavoriteIcon />
            </IconButton> */}
            <IconButton
              aria-label="share"
              onClick={onOpenShareModal}
              size="small"
              className="h-full bg-slate-700/[.6] pr-[7px] hover:bg-slate-700/[.8]"
            >
              <ShareIcon />
            </IconButton>

            {props.actionType === ActionType.PlayPause &&
              isSelected() &&
              props.appState.isTrackPlaying && (
                <IconButton
                  className="bg-slate-700/[.6] hover:bg-slate-700/[.9]"
                  onClick={onPause}
                  size="small"
                >
                  <PauseIcon />
                </IconButton>
              )}
            {props.actionType === ActionType.PlayPause &&
              (!isSelected() || !props.appState.isTrackPlaying) && (
                <IconButton
                  className="bg-slate-700/[.6] hover:bg-slate-700/[.9]"
                  onClick={onPlay}
                  size="small"
                >
                  <PlayArrowIcon />
                </IconButton>
              )}
          </div>
          {props.showStatus && (
            <div className="absolute top-0 flex w-full p-2.5">
              <Chip
                label={props.track.statusLabel}
                size="small"
                className={`text-xs font-bold ${getStatusColor(props.track.status)}`}
              />
            </div>
          )}
          {props.track.artworkUrl ? (
            <div
              className="h-0 bg-cover bg-center bg-no-repeat pt-16/9"
              style={{ backgroundImage: `url(${props.track.artworkUrl})` }}
            />
          ) : (
            <div
              className="h-0 pt-16/9"
              style={{ background: generateRandomColor(props.track.id) }}
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-2 py-4 px-4">
          <div className="grid">
            <div
              className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-semibold hover:text-primary-main"
              onClick={onTrackClick}
            >
              {props.track.title}
            </div>
            <div
              onClick={onArtistClick}
              className="cursor-pointer text-sm text-secondary-main hover:text-primary-main"
            >
              {props.track.artistName}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Button variant="outlined" onClick={onPriceClick} className="m-0 p-0" size="small">
              <Typography variant="subtitle1">{props.track.price.formattedPrice}</Typography>
            </Button>
            {/* {canExpand() ? (
              <IconButton
                className={clsx('transition p-0 m-0', {
                  'rotate-180': expanded,
                })}
                onClick={handleExpandClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onTouchStart={() => setHovered(false)}
                aria-expanded={expanded}
                aria-label="show more details"
              >
                <ExpandMoreIcon />
              </IconButton>
            ) : (
              <div style={{ width: 1, height: 1 }} />
            )} */}
          </div>
        </div>

        {/* <Collapse in={expanded} timeout="auto" unmountOnExit>
          <div className="p-4 pt-0 bg-background-dark shadow-inner flex flex-col">
            {props.track.instruments?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <div className="mr-0.5 text-sm">Instruments:</div>
                {props.track?.instruments.map((instrument: InstrumentModel) => (
                  <Chip
                    key={instrument.id}
                    label={instrument.name}
                    size="small"
                    className="text-sm cursor-pointer bg-slate-700/[.6] hover:bg-slate-900/"
                    onClick={() => {
                      Router.push('/instrument/[instrumentName]', `/instrument/${instrument.name}`)
                    }}
                  />
                ))}
              </div>
            )}

            {props.track.genres?.length > 0 && (
              <div className="flex flex-wrap items-center pt-4 gap-1">
                <div className="mr-0.5 text-sm">Genre:</div>
                {props.track?.genres.map((genre: GenreModel) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    size="small"
                    className="text-sm cursor-pointer bg-slate-700/[.6] hover:bg-slate-900/"
                    onClick={() => {
                      Router.push('/genre/[genreName]', `/genre/${genre.name}`)
                    }}
                  />
                ))}
              </div>
            )}

            {props.track.key && props.track.key.name !== '' && (
              <div className="flex flex-wrap items-center pt-4 gap-1">
                <div className="mr-0.5 text-sm">Key:</div>
                <Chip
                  label={props.track?.key.name}
                  size="small"
                  className="mr-1 text-sm bg-slate-700/[.6]"
                />
              </div>
            )}

            {props.track.tags?.length > 0 && (
              <div className="flex flex-wrap items-center pt-4 gap-1">
                <div className="mr-0.5 text-sm">Tags:</div>
                {props.track?.tags.map((tag: TagModel) => (
                  <Chip
                    key={tag.id}
                    label={'#' + tag.name}
                    size="small"
                    className="text-sm cursor-pointer bg-slate-700/[.6] hover:bg-slate-900/"
                    onClick={() => {
                      Router.push('/tag/[tagName]', `/tag/${tag.name}`)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Collapse> */}
      </div>
    )
  })
)

export default TrackCard
