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
import { ObservableMap, values } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import ImagePreview from 'src/common/components/image/ImagePreview'

import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { Order } from 'src/common/store/util/Paginator'
import GenreModel from 'src/modules/genre/store/model/GenreModel'

export interface IGenreColumn {
  id: number
  artwork: number
  action: number
  description: string
}

const headRows: IHeadRow<IGenreColumn>[] = [
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
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
    id: 'id',
    numeric: false,
    disablePadding: false,
    label: 'Name',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description',
    sortable: true,
    hideOnMobile: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<IGenreColumn>) {
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

interface IGenreTable {
  onGenreSelect: (id: number) => void
  selectedGenreId: number
  data: ObservableMap<number, GenreModel>
  showPagination?: boolean
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

const GenreTable: React.FunctionComponent<IGenreTable> = observer((props: IGenreTable) => {
  function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof IGenreColumn) {
    const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
    props.setSort(isDesc ? 'asc' : 'desc', property)
  }

  function handleClick(_event: React.MouseEvent<unknown>, id: number) {
    props.onGenreSelect(id)
  }

  function handleChangePage(_event: unknown, newPage: number) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    props.setPageNumber(newPage)
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    props.setRowsPerPage(+event.target.value)
  }

  const isSelected = (id: number) => props.selectedGenreId === id

  const tableBody = []

  const genre = props.data

  values(genre).forEach((genre: GenreModel) => {
    const isItemSelected = isSelected(Number.parseInt(genre.id.toString(), 10))

    tableBody.push(
      <TableRow
        hover
        onDoubleClick={event => handleClick(event, Number.parseInt(genre.id.toString(), 10))}
        tabIndex={-1}
        key={genre.id}
        selected={isItemSelected}
        style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
        className="select-none"
      >
        <TableCell className="py-0" width={100}>
          <Button
            aria-label="Edit Genre"
            size="small"
            variant="text"
            color="primary"
            onClick={event => handleClick(event, Number.parseInt(genre.id.toString(), 10))}
          >
            Edit
          </Button>
        </TableCell>
        <TableCell width={75} classes={{ root: 'p-0' }}>
          <ImagePreview id={genre.id} src={genre.artworkUrl} className="h-[50px] w-[50px]" />
        </TableCell>
        <TableCell width={150}>{genre.name}</TableCell>
        <TableCell>{genre.description}</TableCell>
      </TableRow>
    )
  })

  return (
    <Paper className="w-full overflow-auto rounded-md" elevation={0}>
      {props.data.size === 0 ? (
        <div className="py-8">
          <Typography variant="h6" align="center">
            No genre found
          </Typography>
        </div>
      ) : (
        <React.Fragment>
          <Table className="w-full" aria-labelledby="Genres" size="medium">
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
              labelRowsPerPage="Genres Per Page"
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </React.Fragment>
      )}
    </Paper>
  )
})

GenreTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
}

export default GenreTable
