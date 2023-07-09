import {
  Box,
  Button,
  Chip,
  Hidden,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import PauseIcon from '@mui/icons-material/PauseCircleFilled'
import PlayIcon from '@mui/icons-material/PlayCircleFilled'
import { ObservableMap, values } from 'mobx'
import { observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'
import ShareIcon from '@mui/icons-material/Share'

import Loading from 'src/common/components/layout/Loading'
import ShareModal from 'src/common/components/ShareModal'
import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { Order } from 'src/common/store/util/Paginator'
import { APP_URL } from 'src/ApplicationConfiguration'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import { TrackModel } from 'src/modules/track/store'
import { getFormattedTimeFromSeconds } from 'src/util/Time'
import ImagePreview from 'src/common/components/image/ImagePreview'

const PREFIX = 'TrackTable'

const classes = {
  paper: `${PREFIX}-paper`,
  tableWrapper: `${PREFIX}-tableWrapper`,
  pointer: `${PREFIX}-pointer`,
  playButton: `${PREFIX}-playButton`,
  optionButton: `${PREFIX}-optionButton`,
  disableHightlighting: `${PREFIX}-disableHightlighting`,
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    width: '100%',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
    overflowX: 'scroll',
    background: theme.palette.background.default,
  },

  [`& .${classes.tableWrapper}`]: {
    borderStyle: 'none',
    borderCollapse: 'collapse',
    display: 'table',
  },

  [`& .${classes.pointer}`]: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontSize: '35px',
  },

  [`& .${classes.playButton}`]: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  [`& .${classes.optionButton}`]: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  [`& .${classes.disableHightlighting}`]: {
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    KhtmlUserSelect: 'none',
    msUserSelect: 'none',
  },
}))

export interface ITrackColumn {
  id: number
  play: number
  artwork: number
  title: string
  'artist.name': string
  'genres.name': string
  'instruments.name': string
  'key.name': string
  duration: string
  playCount: string
  'price.amount': string
  options: string
}

export enum ActionType {
  Edit = 1,
  PlayPause = 2,
}

const headRows: IHeadRow<ITrackColumn>[] = [
  {
    id: 'play',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
    hideOnMedium: false,
  },
  {
    id: 'artwork',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'Title',
    sortable: true,
    hideOnMobile: false,
    hideOnMedium: false,
  },
  {
    id: 'artist.name',
    numeric: false,
    disablePadding: false,
    label: 'Artist',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'genres.name',
    numeric: false,
    disablePadding: false,
    label: 'Genres',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'instruments.name',
    numeric: false,
    disablePadding: false,
    label: 'Instruments',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'key.name',
    numeric: false,
    disablePadding: false,
    label: 'Key',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'duration',
    numeric: false,
    disablePadding: false,
    label: 'Duration',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'price.amount',
    numeric: false,
    disablePadding: false,
    label: 'Price',
    sortable: true,
    hideOnMobile: false,
    hideOnMedium: false,
  },
  {
    id: 'playCount',
    numeric: false,
    disablePadding: false,
    label: 'Plays',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: false,
  },
  {
    id: 'options',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
    hideOnMedium: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<ITrackColumn>) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headRows.map(row => {
          if (!props.hiddenColumns || !props.hiddenColumns.find(value => value === row.id)) {
            const tableCell = (
              <TableCell
                classes={{
                  root: 'border-b-solid border-b-[1px] border-b-slate-800',
                }}
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === row.id ? order : false}
                style={
                  row.id === 'play' || row.id === 'artwork' || row.id === 'options'
                    ? { minWidth: 50, maxWidth: 50, width: 50 }
                    : row.id === 'price.amount'
                    ? { minWidth: 100, maxWidth: 100, width: 100 }
                    : {}
                }
              >
                {!props.disableSorting && row.sortable ? (
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                ) : (
                  row.label
                )}
              </TableCell>
            )

            if (row.hideOnMedium) {
              return (
                <Hidden key={row.id} mdDown implementation="js">
                  {tableCell}
                </Hidden>
              )
            } else if (row.hideOnMobile) {
              return (
                <Hidden key={row.id} mdDown implementation="js">
                  {tableCell}
                </Hidden>
              )
            }
            return tableCell
          }
        })}
      </TableRow>
    </TableHead>
  )
}

interface ITrackTable {
  onTrackSelect: (id: number) => void
  onPlay?: (id: number) => void
  onPriceClick?: (trackId: number) => void
  selectedTrackId: number
  data: ObservableMap<number, TrackModel>
  playbackControl: (state: number) => void
  showPagination?: boolean
  hiddenColumns?: (keyof ITrackColumn)[]
  isTrackPlaying: boolean
  loading: boolean
  rowsPerPage: number
  totalCount: number
  pageNumber: number
  sortDirection: Order
  sortColumn: string
  setRowsPerPage: (pageSize: number) => void
  setPageNumber: (pageNumber: number) => void
  setSort: (sortDirection: Order, sortColumn: string) => void
  disableSorting?: boolean
  actionType?: ActionType
}

const TrackTable: React.FunctionComponent<ITrackTable> = observer((props: ITrackTable) => {
  const [openId, setOpenId] = React.useState(0)
  const [openShareModal, setOpenShareModal] = React.useState(false)

  const onOpenShareModal = (id: number) => () => {
    setOpenId(id)
    setOpenShareModal(true)
  }

  const onShareModalClose = () => {
    setOpenShareModal(false)
    setOpenId(0)
  }

  function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof ITrackColumn) {
    const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
    props.setSort(isDesc ? 'asc' : 'desc', property)
  }

  function handleClick(_event: React.MouseEvent<unknown>, id: number) {
    if (props.onPlay && !(props.hiddenColumns && props.hiddenColumns.indexOf('play') < 0)) {
      props.onPlay(id)
    } else {
      props.onTrackSelect(id)
    }
  }

  function handleChangePage(_event: unknown, newPage: number) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    props.setPageNumber(newPage)
  }

  function handlePriceClick(trackId: number) {
    return function onClick() {
      if (props.onPriceClick) props.onPriceClick(trackId)
    }
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    props.setRowsPerPage(+event.target.value)
  }

  function onArtistClick(urlArtist: string) {
    Router.push('/artists/[slug]', `/artists/${urlArtist}`)
  }

  const isSelected = (id: number) => props.selectedTrackId === id

  const tableBody = []

  values(props.data).forEach((row: TrackModel) => {
    const isItemSelected = isSelected(Number.parseInt(row.id.toString(), 10))

    tableBody.push(
      <TableRow
        hover
        onDoubleClick={event => handleClick(event, Number.parseInt(row.id.toString(), 10))}
        key={row.id}
        selected={isItemSelected}
        className={classes.disableHightlighting}
      >
        <TableCell
          classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
          className={classes.playButton}
        >
          {props.actionType === ActionType.Edit && (
            <Button
              aria-label="Edit"
              variant="text"
              color="primary"
              size="small"
              onClick={event => handleClick(event, Number.parseInt(row.id.toString(), 10))}
            >
              Edit
            </Button>
          )}
          {props.actionType === ActionType.PlayPause && isItemSelected && props.isTrackPlaying && (
            <PauseIcon
              className={classes.pointer}
              onClick={event => {
                handleClick(event, -1)
                props.playbackControl(1)
              }}
            />
          )}
          {props.actionType === ActionType.PlayPause &&
            (!isItemSelected || !props.isTrackPlaying) && (
              <PlayIcon
                className={classes.pointer}
                onClick={event => handleClick(event, Number.parseInt(row.id.toString(), 10))}
              />
            )}
        </TableCell>
        {(!props.hiddenColumns || !props.hiddenColumns.find(value => value === 'artwork')) && (
          <Hidden mdDown implementation="js">
            <TableCell
              classes={{
                root: 'p-0 border-b-solid border-b-[1px] border-b-slate-800',
              }}
            >
              <ImagePreview id={row?.id} src={row?.artworkUrl} className="h-[50px] w-[50px]" />
            </TableCell>
          </Hidden>
        )}
        <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
          <Box>{row.title}</Box>
          <Hidden mdUp implementation="js">
            <Link
              onClick={() => onArtistClick(row.artistUrlAlias)}
              component="button"
              underline="none"
            >
              {row.artistName}
            </Link>
          </Hidden>
        </TableCell>
        <Hidden mdDown implementation="js">
          {(!props.hiddenColumns ||
            !props.hiddenColumns.find(value => value === 'artist.name')) && (
            <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
              <Link
                onClick={() => onArtistClick(row.artistUrlAlias)}
                component="button"
                underline="none"
              >
                {row.artistName}
              </Link>
            </TableCell>
          )}
        </Hidden>
        <Hidden mdDown implementation="js">
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            <div className="flex flex-wrap gap-2">
              {row.genres.map((genre: GenreModel) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  size="small"
                  className="mr-2 cursor-pointer hover:text-primary-light"
                  onClick={() => {
                    Router.push('/genre/[genreName]', `/genre/${genre.name}`)
                  }}
                />
              ))}
            </div>
          </TableCell>
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            <div className="flex flex-wrap gap-2">
              {row.instruments.map((instrument: InstrumentModel) => (
                <Chip
                  key={instrument.id}
                  label={instrument.name}
                  size="small"
                  className="mr-2 cursor-pointer hover:text-primary-light"
                  onClick={() => {
                    Router.push('/instrument/[instrumentName]', `/instrument/${instrument.name}`)
                  }}
                />
              ))}
            </div>
          </TableCell>
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            {row.key ? row.key.name : ''}
          </TableCell>
        </Hidden>
        <Hidden mdDown implementation="js">
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            {getFormattedTimeFromSeconds(row.duration)}
          </TableCell>

          {(!props.hiddenColumns || !props.hiddenColumns.find(value => value === 'playCount')) && (
            <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
              {row.playCount}
            </TableCell>
          )}
        </Hidden>
        {(!props.hiddenColumns || !props.hiddenColumns.find(value => value === 'price.amount')) && (
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handlePriceClick(row.id)}
            >
              {row.price.formattedPrice}
            </Button>
          </TableCell>
        )}
        {(!props.hiddenColumns || !props.hiddenColumns.find(value => value === 'options')) && (
          <TableCell
            classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
            className={classes.optionButton}
          >
            <IconButton aria-haspopup="true" onClick={onOpenShareModal(row.id)} size="large">
              <ShareIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    )
  })

  if (props.data.size === 0 && !props.loading) {
    return (
      <StyledPaper className={classes.paper} elevation={0}>
        <div style={{ padding: '4em 0' }}>
          <Typography variant="h6" align="center">
            No tracks found
          </Typography>
        </div>
      </StyledPaper>
    )
  }

  return (
    <StyledPaper className={classes.paper} elevation={0} classes={{ root: 'overflow-x-auto' }}>
      {props.loading && <Loading position="absolute" size={40} />}
      <Table className={classes.tableWrapper} aria-labelledby="Track table" size="medium">
        <EnhancedTableHead
          order={props.sortDirection}
          orderBy={props.sortColumn}
          onRequestSort={handleRequestSort}
          hiddenColumns={props.hiddenColumns}
          disableSorting={props.disableSorting}
        />
        <TableBody>{tableBody}</TableBody>
      </Table>

      {props.showPagination && (
        <TablePagination
          rowsPerPageOptions={[24, 48, 96]}
          component="div"
          count={props.totalCount}
          rowsPerPage={props.rowsPerPage}
          page={props.pageNumber}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          labelRowsPerPage="Tracks Per Page"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      <ShareModal
        open={openShareModal}
        onClose={onShareModalClose}
        url={`${APP_URL}/tracks/${openId}`}
        id={openId > 0 ? props.data.get(openId).id : undefined}
        imgUrl={openId > 0 ? props.data.get(openId).artworkUrl : ''}
        header={openId > 0 ? props.data.get(openId).title : ''}
        subheader={openId > 0 ? props.data.get(openId).artistName : ''}
      />
    </StyledPaper>
  )
})

TrackTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
  actionType: ActionType.PlayPause,
}

export default TrackTable
