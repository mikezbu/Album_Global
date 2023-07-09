import {
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
import { APP_URL } from 'src/ApplicationConfiguration'
import { SampleModel } from 'src/modules/sample/store'
import { getFormattedTimeFromSeconds } from 'src/util/Time'

const PREFIX = 'SamplePackSampleTable'

const classes = {
  paper: `${PREFIX}-paper`,
  menu: `${PREFIX}-menu`,
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
    borderRadius: '1em',
  },

  [`& .${classes.menu}`]: {
    padding: '0.5em',
    border: '1px solid #d0d0d0',
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

interface IData {
  id: number
  play: number
  title: string
  tags: string
  duration: string
  playCount: string
  delete: number
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
    id: 'tags',
    numeric: false,
    disablePadding: false,
    label: 'Tags',
    sortable: false,
    hideOnMobile: true,
  },
  {
    id: 'duration',
    numeric: false,
    disablePadding: false,
    label: 'Duration',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'playCount',
    numeric: false,
    disablePadding: false,
    label: 'Plays',
    sortable: true,
    hideOnMobile: false,
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
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === row.id ? order : false}
                style={row.id === 'play' ? { minWidth: 50, maxWidth: 50, width: 50 } : {}}
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

            if (row.hideOnMobile) {
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

interface ISamplePackSampleTable {
  onSampleSelect: (id: number) => void
  selectedSampleId: number
  data: ObservableMap<number, SampleModel>
  playbackControl: (state: number) => void
  hiddenColumns?: (keyof IData)[]
  isSamplePlaying: boolean
  onDeleteCallback?: (id: number) => void
  notFoundLabel?: string
}

export const SamplePackSampleTable: React.FunctionComponent<ISamplePackSampleTable> = observer(
  (props: ISamplePackSampleTable) => {
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

    function handleClick(_event: React.MouseEvent<unknown>, id: number) {
      props.onSampleSelect(id)
    }

    function handleDelete(_event: React.MouseEvent<unknown>, id: number) {
      props.onDeleteCallback(id)
    }

    const isSelected = (id: number) => props.selectedSampleId === id

    const sampleMap = props.data
    const samples = stableSort(values(sampleMap) as SampleModel[], getSorting(order, orderBy))

    return (
      <StyledPaper className={classes.paper} elevation={0}>
        {props.data.size === 0 ? (
          <div style={{ padding: '4em 0' }}>
            <Typography variant="h6" align="center">
              {props.notFoundLabel}
            </Typography>
          </div>
        ) : (
          <Table aria-labelledby="Sample Table" size="medium">
            <TableHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              hiddenColumns={props.hiddenColumns}
              disableSorting={false}
            />
            <TableBody>
              {samples.map((sample: SampleModel) => {
                const isItemSelected = isSelected(Number.parseInt(sample.id.toString(), 10))

                return (
                  <TableRow
                    hover
                    onDoubleClick={event =>
                      handleClick(event, Number.parseInt(sample.id.toString(), 10))
                    }
                    tabIndex={-1}
                    key={sample.id}
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
                    <TableCell className={classes.playButton}>
                      {isItemSelected && props.isSamplePlaying ? (
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
                            handleClick(event, Number.parseInt(sample.id.toString(), 10))
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>{sample.title}</TableCell>
                    <Hidden lgDown implementation="js">
                      <TableCell>
                        {sample.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" className={classes.chip} />
                        ))}
                      </TableCell>
                    </Hidden>
                    <TableCell>{getFormattedTimeFromSeconds(sample.duration)}</TableCell>
                    {(!props.hiddenColumns ||
                      !props.hiddenColumns.find(value => value === 'playCount')) && (
                      <TableCell>{sample.playCount}</TableCell>
                    )}

                    {props.onDeleteCallback && (
                      <TableCell>
                        <IconButton
                          color="inherit"
                          aria-label="delete sample"
                          onClick={event =>
                            handleDelete(event, Number.parseInt(sample.id.toString(), 10))
                          }
                          size="large"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}

                    {(!props.hiddenColumns ||
                      !props.hiddenColumns.find(value => value === 'options')) && (
                      <TableCell className={classes.optionButton}>
                        <IconButton
                          aria-haspopup="true"
                          onClick={onOpenShareModal(sample.id)}
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
          url={`${APP_URL}/samples/${openId}`}
          header={openId > 0 ? props.data.get(openId).title : ''}
          subheader={openId > 0 ? props.data.get(openId).artistName : ''}
        />
      </StyledPaper>
    )
  }
)

SamplePackSampleTable.defaultProps = {
  notFoundLabel: 'No samples found',
}

export default SamplePackSampleTable
