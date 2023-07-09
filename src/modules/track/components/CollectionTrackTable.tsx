import {
  Button,
  Chip,
  Hidden,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import PauseIcon from '@mui/icons-material/PauseCircleFilled'
import PlayIcon from '@mui/icons-material/PlayCircleFilled'
import { ObservableMap, values } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import ShareIcon from '@mui/icons-material/Share'

import ShareModal from 'src/common/components/ShareModal'
import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { getStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import { TrackModel } from 'src/modules/track/store'
import { getFormattedTimeFromSeconds } from 'src/util/Time'
import { TrackStatus } from 'src/modules/track/store/model/TrackModel'

const PREFIX = 'CollectionTrackTable'

const classes = {
  paper: `${PREFIX}-paper`,
  pointer: `${PREFIX}-pointer`,
  optionButton: `${PREFIX}-optionButton`,
  disableHightlighting: `${PREFIX}-disableHightlighting`,
  chip: `${PREFIX}-chip`,
  buyButton: `${PREFIX}-buyButton`,
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    width: '100%',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    background: theme.palette.background.default,
  },

  [`& .${classes.pointer}`]: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontSize: '35px',
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

  [`& .${classes.chip}`]: {
    margin: theme.spacing(0.5),
  },

  [`& .${classes.buyButton}`]: {},
}))

interface IData {
  id: number
  play: number
  title: string
  status: string
  genres: string
  instruments: string
  key: string
  duration: string
  playCount: string
  delete: number
  price: string
  options: string
}

const headRows: IHeadRow<IData>[] = [
  {
    id: 'play',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'Title',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'genres',
    numeric: false,
    disablePadding: false,
    label: 'Genres',
    sortable: false,
    hideOnMobile: true,
  },
  {
    id: 'instruments',
    numeric: false,
    disablePadding: false,
    label: 'Instruments',
    sortable: false,
    hideOnMobile: true,
    hideOnMedium: true,
  },
  {
    id: 'key',
    numeric: false,
    disablePadding: false,
    label: 'Key',
    sortable: true,
    hideOnMobile: true,
    hideOnMedium: true,
  },
  {
    id: 'duration',
    numeric: false,
    disablePadding: false,
    label: 'Duration',
    sortable: true,
    hideOnMobile: true,
  },
  {
    id: 'playCount',
    numeric: false,
    disablePadding: false,
    label: 'Plays',
    sortable: true,
    hideOnMobile: true,
  },
  {
    id: 'delete',
    numeric: false,
    disablePadding: false,
    label: 'Delete?',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'price',
    numeric: false,
    disablePadding: false,
    label: 'Price',
    sortable: true,
    hideOnMobile: false,
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

function desc<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function stableSort<T>(array: T[], cmp: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

type Order = 'asc' | 'desc'

function getSorting<K extends keyof any>(order: Order, orderBy: K): (a: any, b: any) => number {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy)
}

function TableHeader(props: IEnhancedTableProps<IData>) {
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
                classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === row.id ? order : false}
                style={
                  row.id === 'play' || row.id === 'options'
                    ? { minWidth: 50, maxWidth: 50, width: 50 }
                    : row.id === 'price'
                    ? { minWidth: 100, maxWidth: 100, width: 100 }
                    : {}
                }
              >
                {row.sortable ? (
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
                <Hidden key={row.id} xlDown implementation="js">
                  {tableCell}
                </Hidden>
              )
            } else if (row.hideOnMobile) {
              return (
                <Hidden key={row.id} lgDown implementation="js">
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

interface ICollectionTrackTable {
  onTrackSelect: (id: number) => void
  onPriceClick?: (trackId: number) => void
  selectedTrackId: number
  data: ObservableMap<number, TrackModel>
  playbackControl: (state: number) => void
  hiddenColumns?: (keyof IData)[]
  isTrackPlaying: boolean
  onDeleteCallback?: (id: number) => void
  notFoundLabel?: string
}

export const CollectionTrackTable: React.FunctionComponent<ICollectionTrackTable> = observer(
  (props: ICollectionTrackTable) => {
    const [order, setOrder] = React.useState<Order>('asc')
    const [orderBy, setOrderBy] = React.useState<keyof IData>('id')
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

    function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof IData) {
      const isDesc = orderBy === property && order === 'desc'
      setOrder(isDesc ? 'asc' : 'desc')
      setOrderBy(property)
    }

    function handlePriceClick(trackId: number) {
      return function onClick() {
        if (props.onPriceClick) props.onPriceClick(trackId)
      }
    }

    function handleClick(_event: React.MouseEvent<unknown>, id: number) {
      props.onTrackSelect(id)
    }

    function handleDelete(_event: React.MouseEvent<unknown>, id: number) {
      props.onDeleteCallback(id)
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

    const isSelected = (id: number) => props.selectedTrackId === id

    const trackMap = props.data
    const tracks = stableSort(values(trackMap) as TrackModel[], getSorting(order, orderBy))

    return (
      <StyledPaper className={classes.paper} elevation={0}>
        {props.data.size === 0 ? (
          <div style={{ padding: '4em 0' }}>
            <Typography variant="h6" align="center">
              {props.notFoundLabel}
            </Typography>
          </div>
        ) : (
          <Table aria-labelledby="Track Table" size="medium">
            <TableHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              hiddenColumns={props.hiddenColumns}
              disableSorting={false}
            />
            <TableBody>
              {tracks.map((track: TrackModel) => {
                const isItemSelected = isSelected(Number.parseInt(track?.id.toString(), 10))

                return (
                  <TableRow
                    hover
                    onDoubleClick={event =>
                      handleClick(event, Number.parseInt(track.id.toString(), 10))
                    }
                    tabIndex={-1}
                    key={track.id}
                    selected={isItemSelected}
                    style={{
                      minWidth: 50,
                      maxWidth: 50,
                      width: 50,
                      minHeight: 61,
                      height: 61,
                    }}
                    className={classes.disableHightlighting}
                  >
                    <TableCell
                      classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      className={classes.optionButton}
                    >
                      {isItemSelected && props.isTrackPlaying ? (
                        <PauseIcon
                          className={classes.pointer}
                          onClick={event => {
                            handleClick(event, -1)
                            props.playbackControl(1)
                          }}
                        />
                      ) : (
                        <PlayIcon
                          className={classes.pointer}
                          onClick={event =>
                            handleClick(event, Number.parseInt(track.id.toString(), 10))
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell
                      classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                    >
                      {track.title}
                    </TableCell>
                    {(!props.hiddenColumns ||
                      !props.hiddenColumns.find(value => value === 'status')) && (
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        <Chip
                          label={track.statusLabel}
                          size="small"
                          className={`mr-3 text-xs font-bold ${getStatusColor(track.status)}`}
                        />
                      </TableCell>
                    )}
                    <Hidden lgDown implementation="js">
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        {track.genres.map((genre: GenreModel) => (
                          <Chip
                            key={genre.id}
                            label={genre.name}
                            size="small"
                            className={classes.chip}
                          />
                        ))}
                      </TableCell>
                    </Hidden>
                    <Hidden xlDown implementation="js">
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        {track.instruments.map((instrument: InstrumentModel) => (
                          <Chip
                            key={instrument.id}
                            label={instrument.name}
                            size="small"
                            className={classes.chip}
                          />
                        ))}
                      </TableCell>

                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        {track.key ? track.key.name : ''}
                      </TableCell>
                    </Hidden>
                    <Hidden lgDown implementation="js">
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        {getFormattedTimeFromSeconds(track.duration)}
                      </TableCell>

                      {(!props.hiddenColumns ||
                        !props.hiddenColumns.find(value => value === 'playCount')) && (
                        <TableCell
                          classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                        >
                          {track.playCount}
                        </TableCell>
                      )}
                    </Hidden>

                    {props.onDeleteCallback && (
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        <IconButton
                          color="inherit"
                          aria-label="delete track"
                          onClick={event =>
                            handleDelete(event, Number.parseInt(track.id.toString(), 10))
                          }
                          size="large"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}

                    {(!props.hiddenColumns ||
                      !props.hiddenColumns.find(value => value === 'price')) && (
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                      >
                        {getStore().cartStore.cart.tracks.has(track.id) ? (
                          <Button variant="outlined" size="small" disabled>
                            In Cart
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            className={classes.buyButton}
                            onClick={handlePriceClick(track.id)}
                          >
                            {track.price.formattedPrice}
                          </Button>
                        )}
                      </TableCell>
                    )}

                    {(!props.hiddenColumns ||
                      !props.hiddenColumns.find(value => value === 'options')) && (
                      <TableCell
                        classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
                        className={classes.optionButton}
                      >
                        <IconButton
                          aria-haspopup="true"
                          onClick={onOpenShareModal(track.id)}
                          size="large"
                        >
                          <ShareIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        <ShareModal
          open={openShareModal}
          onClose={onShareModalClose}
          url={`${APP_URL}/tracks/${openId}`}
        />
      </StyledPaper>
    )
  }
)

CollectionTrackTable.defaultProps = {
  notFoundLabel: 'No tracks found',
}

export default CollectionTrackTable
