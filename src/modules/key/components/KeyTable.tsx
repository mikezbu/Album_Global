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
import KeyModel from 'src/modules/key/store/model/KeyModel'
export interface IKeyColumn {
  id: number
  action: number
}

const headRows: IHeadRow<IKeyColumn>[] = [
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: '',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'id',
    numeric: false,
    disablePadding: false,
    label: 'Name',
    sortable: true,
    hideOnMobile: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<IKeyColumn>) {
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

interface IKeyTable {
  onKeySelect: (id: number) => void
  selectedKeyId: number
  data: ObservableMap<number, KeyModel>
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

const KeyTable: React.FunctionComponent<IKeyTable> = observer((props: IKeyTable) => {
  function handleRequestSort(_event: React.MouseEvent<unknown>, property: keyof IKeyColumn) {
    const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
    props.setSort(isDesc ? 'asc' : 'desc', property)
  }

  function handleClick(_event: React.MouseEvent<unknown>, id: number) {
    props.onKeySelect(id)
  }

  function handleChangePage(_event: unknown, newPage: number) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    props.setPageNumber(newPage)
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    props.setRowsPerPage(+event.target.value)
  }

  const isSelected = (id: number) => props.selectedKeyId === id

  const tableBody = []

  const key = props.data

  values(key).forEach((key: KeyModel) => {
    const isItemSelected = isSelected(Number.parseInt(key.id.toString(), 10))

    tableBody.push(
      <TableRow
        hover
        onDoubleClick={event => handleClick(event, Number.parseInt(key.id.toString(), 10))}
        tabIndex={-1}
        key={key.id}
        selected={isItemSelected}
        style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
        className="select-none"
      >
        <TableCell className="py-0" width={100}>
          <Button
            aria-label="Edit Key"
            size="small"
            variant="text"
            color="primary"
            onClick={event => handleClick(event, Number.parseInt(key.id.toString(), 10))}
          >
            Edit
          </Button>
        </TableCell>
        <TableCell>{key.name}</TableCell>
      </TableRow>
    )
  })

  return (
    <Paper className="w-full overflow-auto rounded-md" elevation={0}>
      {props.data.size === 0 ? (
        <div style={{ padding: '4em 0' }}>
          <Typography variant="h6" align="center">
            No key found
          </Typography>
        </div>
      ) : (
        <React.Fragment>
          <Table className="w-full" aria-labelledby="Keys" size="medium">
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
              labelRowsPerPage="Keys Per Page"
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </React.Fragment>
      )}
    </Paper>
  )
})

KeyTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
}

export default KeyTable
