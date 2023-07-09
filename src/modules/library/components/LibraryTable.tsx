import {
  Button,
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
import React from 'react'

import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { Order } from 'src/common/store/util/Paginator'
import LibraryModel, { LibraryType } from 'src/modules/library/store/model/LibraryModel'
import Loading from 'src/common/components/layout/Loading'

const PREFIX = 'LibraryTable'

const classes = {
  paper: `${PREFIX}-paper`,
  tableWrapper: `${PREFIX}-tableWrapper`,
  pointer: `${PREFIX}-pointer`,
  action: `${PREFIX}-action`,
  disableHighlighting: `${PREFIX}-disableHighlighting`,
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    width: '100%',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
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

  [`& .${classes.action}`]: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
  },

  [`& .${classes.disableHighlighting}`]: {
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    KhtmlUserSelect: 'none',
    msUserSelect: 'none',
  },
}))

export interface ILibraryColumn {
  id: number
  action: number
  play: number
  type: string
  title: number
  addedDate: string
  viewInvoice: number
}

const headRows: IHeadRow<ILibraryColumn>[] = [
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'play',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'Type',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'Title',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'addedDate',
    numeric: false,
    disablePadding: false,
    label: 'Purchase Date',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'viewInvoice',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<ILibraryColumn>) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headRows.map(row => {
          return (
            <TableCell
              key={row.id}
              align={row.numeric ? 'right' : 'left'}
              padding={row.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === row.id ? order : false}
              style={row.id === 'action' ? { minWidth: 50, maxWidth: 150, width: 150 } : {}}
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
        })}
      </TableRow>
    </TableHead>
  )
}

interface ILibraryTable {
  onLibrarySelect: (id: number) => void
  onTrackSelect: (id: number) => void
  onViewInvoice: (id: number) => void
  selectedLibraryId: number
  data: ObservableMap<number, LibraryModel>
  showPagination?: boolean
  loading: boolean
  rowsPerPage: number
  totalCount: number
  pageNumber: number
  sortDirection: Order
  sortColumn: string
  isTrackPlaying: boolean
  playbackControl: (state: number) => void
  setRowsPerPage: (pageSize: number) => void
  setPageNumber: (pageNumber: number) => void
  setSort: (sortDirection: Order, sortColumn: string) => void
  disableSorting?: boolean
}

const LibraryTable: React.FunctionComponent<ILibraryTable> = observer((props: ILibraryTable) => {
  function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof ILibraryColumn) {
    const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
    props.setSort(isDesc ? 'asc' : 'desc', property)
  }

  function onViewInvoiceClick(_event: React.MouseEvent<unknown>, id: number) {
    props.onViewInvoice(id)
  }

  function handleClick(_event: React.MouseEvent<unknown>, library: LibraryModel) {
    props.onLibrarySelect(library.id)
  }

  function handleTrackSelect(_event: React.MouseEvent<unknown>, library: LibraryModel) {
    props.onTrackSelect(library.id)
  }

  function handleChangePage(_event: unknown, newPage: number) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    props.setPageNumber(newPage)
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    props.setRowsPerPage(+event.target.value)
  }

  function getTitle(library: LibraryModel) {
    if (library.type === LibraryType.Collection) {
      return library.collection.name
    } else if (library.type === LibraryType.Track) {
      return library.track.title
    } else if (library.type === LibraryType.Sample) {
      return library.sample.title
    }
  }

  function getType(library: LibraryModel) {
    if (library.type === LibraryType.Collection) {
      return 'Collection'
    } else if (library.type === LibraryType.Track) {
      return 'Track'
    } else if (library.type === LibraryType.Sample) {
      return 'Sample'
    }
  }

  const isSelected = (id: number) => props.selectedLibraryId === id

  const tableBody = []

  values(props.data).forEach((row: LibraryModel) => {
    const isItemSelected = isSelected(Number.parseInt(row.id.toString(), 10))
    tableBody.push(
      <TableRow
        hover
        onDoubleClick={event => handleClick(event, row)}
        tabIndex={-1}
        key={row.id}
        selected={isItemSelected}
        style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
        className={classes.disableHighlighting}
      >
        <TableCell
          classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
          className={classes.action}
        >
          <Button
            aria-label="Download"
            size="small"
            variant="text"
            color="primary"
            onClick={event => handleClick(event, row)}
          >
            {row.downloadUrlReady ? 'Download' : 'Generate License'}
          </Button>
        </TableCell>
        <TableCell
          classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
          className="py-0"
        >
          {isItemSelected && props.isTrackPlaying ? (
            <PauseIcon
              className={classes.pointer}
              onClick={event => {
                props.playbackControl(1)
              }}
            />
          ) : (
            <PlayIcon
              className={classes.pointer}
              onClick={event => handleTrackSelect(event, row)}
            />
          )}
        </TableCell>
        <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
          {getType(row)}
        </TableCell>
        <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
          {getTitle(row)}{' '}
        </TableCell>
        <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
          {new Date(row.addedDate).toLocaleString('en-US')}
        </TableCell>
        <TableCell
          classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
          className={classes.action}
        >
          <Button
            aria-label="View Receipt"
            variant="text"
            color="primary"
            size="small"
            onClick={event =>
              onViewInvoiceClick(event, Number.parseInt(row.transactionId.toString(), 10))
            }
          >
            View Receipt
          </Button>
        </TableCell>
      </TableRow>
    )
  })

  if (props.data.size === 0 && !props.loading) {
    return (
      <StyledPaper className={classes.paper} elevation={0}>
        <div style={{ padding: '4em 0' }}>
          <Typography variant="h6" align="center">
            Your library is empty
          </Typography>
        </div>
      </StyledPaper>
    )
  }

  return (
    <StyledPaper className={classes.paper} elevation={0}>
      {props.loading && <Loading position="absolute" size={40} />}
      <Table className={classes.tableWrapper} aria-labelledby="tableTitle" size="medium">
        <EnhancedTableHead
          order={props.sortDirection}
          orderBy={props.sortColumn}
          hiddenColumns={null}
          onRequestSort={handleRequestSort}
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
          labelRowsPerPage="Items Per Page"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </StyledPaper>
  )
})

LibraryTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
}

export default LibraryTable
