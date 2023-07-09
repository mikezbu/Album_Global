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
import { SampleModel } from 'src/modules/sample/store'
import { ActionType } from 'src/modules/track/components/TrackTable'
import { getFormattedTimeFromSeconds } from 'src/util/Time'

const PREFIX = 'SampleTable'

const classes = {
  paper: `${PREFIX}-paper`,
  tableWrapper: `${PREFIX}-tableWrapper`,
  pointer: `${PREFIX}-pointer`,
  playButton: `${PREFIX}-playButton`,
  optionButton: `${PREFIX}-optionButton`,
  disableHightlighting: `${PREFIX}-disableHightlighting`,
  chip: `${PREFIX}-chip`,
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    width: '100%',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
    borderRadius: '1em',
  },

  [`& .${classes.tableWrapper}`]: {
    borderStyle: 'none',
    borderCollapse: 'collapse',
    display: 'table',
  },

  [`& .${classes.pointer}`]: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
  },

  [`& .${classes.playButton}`]: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
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
}))

export interface ISampleColumn {
  id: number
  play: number
  title: string
  'artist.name': string
  'tags.tag': string
  duration: string
  playCount: string
  options: string
}

const headRows: IHeadRow<ISampleColumn>[] = [
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
    id: 'tags.tag',
    numeric: false,
    disablePadding: false,
    label: 'Tags',
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
    hideOnMobile: false,
    hideOnMedium: false,
  },
  {
    id: 'playCount',
    numeric: false,
    disablePadding: false,
    label: 'Plays',
    sortable: true,
    hideOnMobile: false,
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

function EnhancedTableHead(props: IEnhancedTableProps<ISampleColumn>) {
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
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === row.id ? order : false}
                style={row.id === 'play' ? { minWidth: 50, maxWidth: 50, width: 50 } : {}}
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

interface ISampleTable {
  onSampleSelect: (id: number) => void
  onPlay?: (id: number) => void
  selectedSampleId: number
  data: ObservableMap<number, SampleModel>
  playbackControl: (state: number) => void
  showPagination?: boolean
  hiddenColumns?: (keyof ISampleColumn)[]
  isSamplePlaying: boolean
  paging: boolean
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

const SampleTable: React.FunctionComponent<ISampleTable> = observer((props: ISampleTable) => {
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

  function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof ISampleColumn) {
    const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
    props.setSort(isDesc ? 'asc' : 'desc', property)
  }

  function handleClick(_event: React.MouseEvent<unknown>, id: number) {
    if (props.onPlay && !(props.hiddenColumns && props.hiddenColumns.indexOf('play') < 0)) {
      props.onPlay(id)
    } else {
      props.onSampleSelect(id)
    }
  }

  function handleChangePage(_event: unknown, newPage: number) {
    window.scrollTo(0, 0)
    props.setPageNumber(newPage)
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    props.setRowsPerPage(+event.target.value)
  }

  function onArtistClick(urlArtist: string) {
    Router.push('/artists/[slug]', `/artists/${urlArtist}`)
  }

  const isSelected = (id: number) => props.selectedSampleId === id

  const tableBody = []

  values(props.data).forEach((row: SampleModel) => {
    const isItemSelected = isSelected(Number.parseInt(row.id.toString(), 10))

    tableBody.push(
      <TableRow
        hover
        onDoubleClick={event => handleClick(event, Number.parseInt(row.id.toString(), 10))}
        tabIndex={-1}
        key={row.id}
        selected={isItemSelected}
        style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
        className={classes.disableHightlighting}
      >
        <TableCell className={classes.playButton}>
          {props.actionType === ActionType.Edit && (
            <Button
              aria-label="Edit"
              variant="outlined"
              color="primary"
              size="small"
              onClick={event => handleClick(event, Number.parseInt(row.id.toString(), 10))}
            >
              Edit
            </Button>
          )}
          {props.actionType === ActionType.PlayPause && isItemSelected && props.isSamplePlaying && (
            <PauseIcon
              className={classes.pointer}
              onClick={event => {
                handleClick(event, -1)
                props.playbackControl(1)
              }}
            />
          )}
          {props.actionType === ActionType.PlayPause &&
            (!isItemSelected || !props.isSamplePlaying) && (
              <PlayIcon
                className={classes.pointer}
                onClick={event => handleClick(event, Number.parseInt(row.id.toString(), 10))}
              />
            )}
        </TableCell>
        <TableCell>
          <Box>{row.title}</Box>
          <Hidden mdUp implementation="js">
            <Link onClick={() => onArtistClick(row.artistUrlAlias)} className={classes.pointer}>
              {row.artistName}
            </Link>
          </Hidden>
        </TableCell>
        <Hidden lgDown implementation="js">
          {(!props.hiddenColumns ||
            !props.hiddenColumns.find(value => value === 'artist.name')) && (
            <TableCell>
              <Link onClick={() => onArtistClick(row.artistUrlAlias)} className={classes.pointer}>
                {row.artistName}
              </Link>
            </TableCell>
          )}
        </Hidden>
        <Hidden xlDown implementation="js">
          <TableCell>
            {row.tags.map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" className={classes.chip} />
            ))}
          </TableCell>
        </Hidden>

        <TableCell>{getFormattedTimeFromSeconds(row.duration)}</TableCell>
        {(!props.hiddenColumns || !props.hiddenColumns.find(value => value === 'playCount')) && (
          <TableCell>{row.playCount}</TableCell>
        )}
        {(!props.hiddenColumns || !props.hiddenColumns.find(value => value === 'options')) && (
          <TableCell className={classes.optionButton}>
            <IconButton aria-haspopup="true" onClick={onOpenShareModal(row.id)} size="large">
              <ShareIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    )
  })

  if (props.data.size === 0) {
    return (
      <StyledPaper className={classes.paper} elevation={0}>
        <div style={{ padding: '4em 0' }}>
          <Typography variant="h6" align="center">
            No samples found
          </Typography>
        </div>
      </StyledPaper>
    )
  }

  return (
    <Paper className={classes.paper} elevation={0}>
      {props.paging && <Loading position="absolute" />}

      <Table className={classes.tableWrapper} aria-labelledby="Sample table " size="medium">
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
          labelRowsPerPage="Samples Per Page"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      <ShareModal
        open={openShareModal}
        onClose={onShareModalClose}
        url={`${APP_URL}/samples/${openId}`}
        header={openId > 0 ? props.data.get(openId).title : ''}
        subheader={openId > 0 ? props.data.get(openId).artistName : ''}
      />
    </Paper>
  )
})

SampleTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
  actionType: ActionType.PlayPause,
}

export default SampleTable
