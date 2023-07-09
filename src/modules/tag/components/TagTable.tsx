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

import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { Order } from 'src/common/store/util/Paginator'
import TagModel from 'src/modules/tag/store/model/TagModel'

export interface ITagColumn {
  name: number
  action: number
}

const headRows: IHeadRow<ITagColumn>[] = [
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Name',
    sortable: true,
    hideOnMobile: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<ITagColumn>) {
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

interface ITagTable {
  onTagSelect: (id: number) => void
  selectedTagId: number
  data: ObservableMap<number, TagModel>
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

const TagTable: React.FunctionComponent<ITagTable> = observer((props: ITagTable) => {
  function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof ITagColumn) {
    const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
    props.setSort(isDesc ? 'asc' : 'desc', property)
  }

  function handleClick(_event: React.MouseEvent<unknown>, id: number) {
    props.onTagSelect(id)
  }

  function handleChangePage(_event: unknown, newPage: number) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    props.setPageNumber(newPage)
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    props.setRowsPerPage(+event.target.value)
  }

  const isSelected = (id: number) => props.selectedTagId === id

  const tableBody = []

  const tags = props.data

  values(tags).forEach((tag: TagModel) => {
    const isItemSelected = isSelected(Number.parseInt(tag.id.toString(), 10))

    tableBody.push(
      <TableRow
        hover
        onDoubleClick={event => handleClick(event, Number.parseInt(tag.id.toString(), 10))}
        tabIndex={-1}
        key={tag.id}
        selected={isItemSelected}
        style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
        className="select-none"
      >
        <TableCell className="py-0" width={100}>
          <Button
            aria-label="Edit Tag"
            size="small"
            variant="text"
            color="primary"
            onClick={event => handleClick(event, Number.parseInt(tag.id.toString(), 10))}
          >
            Edit
          </Button>
        </TableCell>
        <TableCell>{tag.name}</TableCell>
      </TableRow>
    )
  })

  return (
    <Paper className="w-full overflow-auto rounded-md" elevation={0}>
      {props.data.size === 0 ? (
        <div className="py-8">
          <Typography variant="h6" align="center">
            No tag found
          </Typography>
        </div>
      ) : (
        <React.Fragment>
          <Table className="w-full" aria-labelledby="Tags" size="medium">
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
              labelRowsPerPage="Tags Per Page"
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </React.Fragment>
      )}
    </Paper>
  )
})

TagTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
}

export default TagTable
