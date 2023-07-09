import {
  Button,
  Checkbox,
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
import { ObservableMap, values } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { Order } from 'src/common/store/util/Paginator'
import { APP_URL } from 'src/ApplicationConfiguration'
import { ArtistModel } from '../store'

const PREFIX = 'AdminArtistTable'

const classes = {
  paper: `${PREFIX}-paper`,
  table: `${PREFIX}-table`,
  tableWrapper: `${PREFIX}-tableWrapper`,
  pointer: `${PREFIX}-pointer`,
  action: `${PREFIX}-action`,
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

  [`& .${classes.table}`]: {
    width: '100%',
  },

  [`& .${classes.tableWrapper}`]: {
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
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

export interface IArtistColumn {
  id: number
  action: number
  artistName: string
  urlAlias: string
  verified: string
  profileLocked: string
  updatedDate: string
  createdDate: string
}

const headRows: IHeadRow<IArtistColumn>[] = [
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'artistName',
    numeric: false,
    disablePadding: false,
    label: 'Artist Name',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'urlAlias',
    numeric: false,
    disablePadding: false,
    label: 'URL Alias',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'verified',
    numeric: false,
    disablePadding: false,
    label: 'Verified?',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'profileLocked',
    numeric: false,
    disablePadding: false,
    label: 'Locked?',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'updatedDate',
    numeric: false,
    disablePadding: false,
    label: 'Updated At',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'createdDate',
    numeric: false,
    disablePadding: false,
    label: 'Created At',
    sortable: true,
    hideOnMobile: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<IArtistColumn>) {
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

interface IAdminArtistTable {
  data: ObservableMap<number, ArtistModel>
  showPagination?: boolean
  updateVerified: (artistId: number, verified: boolean) => void
  updateProfileLocked: (artistId: number, profileLocked: boolean) => void
  rowsPerPage: number
  totalCount: number
  pageNumber: number
  sortDirection: Order
  sortColumn: string
  setRowsPerPage: (pageSize: number) => void
  setPageNumber: (pageNumber: number) => void
  setSort: (sortDirection: Order, sortColumn: string) => void
  disableSorting?: boolean
}

const AdminArtistTable: React.FunctionComponent<IAdminArtistTable> = observer(
  (props: IAdminArtistTable) => {
    function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof IArtistColumn) {
      const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
      props.setSort(isDesc ? 'asc' : 'desc', property)
    }

    function handleClick(_event: React.MouseEvent<unknown>, artist: ArtistModel) {
      const win = window.open(`${APP_URL}/artists/${artist.urlAlias}`, '_blank')
      win.focus()
    }

    function handleChangePage(_event: unknown, newPage: number) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      props.setPageNumber(newPage)
    }

    function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
      props.setRowsPerPage(+event.target.value)
    }

    function handleVerifiedClick(artistId: number, checked: boolean) {
      props.updateVerified(artistId, checked)
    }

    function handleProfileLockedClick(artistId: number, checked: boolean) {
      props.updateProfileLocked(artistId, checked)
    }

    const tableBody = []
    values(props.data).forEach((artist: ArtistModel) => {
      tableBody.push(
        <TableRow
          hover
          onDoubleClick={event => handleClick(event, artist)}
          tabIndex={-1}
          key={artist.id}
          style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
          className={classes.disableHightlighting}
        >
          <TableCell className={classes.action}>
            <Button
              color="primary"
              aria-label="Download"
              size="small"
              variant="text"
              onClick={event => handleClick(event, artist)}
            >
              View Profile
            </Button>
          </TableCell>
          <TableCell>{artist.name}</TableCell>
          <TableCell>{`/${artist.urlAlias}`} </TableCell>
          <TableCell className={classes.action}>
            <Checkbox
              checked={artist.verified}
              onChange={(e, checked) => handleVerifiedClick(artist.id, checked)}
              color="primary"
            />
          </TableCell>
          <TableCell className={classes.action}>
            <Checkbox
              checked={artist.profileLocked}
              onChange={(e, checked) => handleProfileLockedClick(artist.id, checked)}
              color="primary"
            />
          </TableCell>
          <TableCell>{artist.updatedDate && artist.updatedDate.toLocaleString('en-US')}</TableCell>
          <TableCell>{artist.createdDate && artist.createdDate.toLocaleString('en-US')}</TableCell>
        </TableRow>
      )
    })

    return (
      <StyledPaper className={classes.paper} elevation={0}>
        <div className={classes.tableWrapper}>
          {props.data.size === 0 ? (
            <div style={{ padding: '4em 0' }}>
              <Typography variant="h6" align="center">
                No artists found
              </Typography>
            </div>
          ) : (
            <React.Fragment>
              <Table className={classes.table} aria-labelledby="tableTitle" size="medium">
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
                  labelRowsPerPage="Artists Per Page"
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              )}
            </React.Fragment>
          )}
        </div>
      </StyledPaper>
    )
  }
)

AdminArtistTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
}

export default AdminArtistTable
