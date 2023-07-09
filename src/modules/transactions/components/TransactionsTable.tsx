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
import { ObservableMap, values } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import { IEnhancedTableProps, IHeadRow } from 'src/common/components/table'
import { Order } from 'src/common/store/util/Paginator'
import TransactionModel from 'src/modules/transactions/store/model/TransactionModel'
import { getFormattedMonitaryValue } from 'src/util/NumberFormatter'

const PREFIX = 'TransactionsTable'

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

export interface ITransactionColumn {
  id: number
  action: number
  billingName: string
  amountPaid: string
  purchaseDate: string
}

const headRows: IHeadRow<ITransactionColumn>[] = [
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
    label: 'Order Number',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'billingName',
    numeric: false,
    disablePadding: false,
    label: 'Billing Name',
    sortable: false,
    hideOnMobile: false,
  },
  {
    id: 'amountPaid',
    numeric: false,
    disablePadding: false,
    label: 'Amount Paid',
    sortable: true,
    hideOnMobile: false,
  },
  {
    id: 'purchaseDate',
    numeric: false,
    disablePadding: false,
    label: 'Purchase Date',
    sortable: true,
    hideOnMobile: false,
  },
]

function EnhancedTableHead(props: IEnhancedTableProps<ITransactionColumn>) {
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
              classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
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

interface ITransactionsTable {
  onTransactionSelect: (id: number) => void
  selectedTransactionId: number
  data: ObservableMap<number, TransactionModel>
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

const TransactionsTable: React.FunctionComponent<ITransactionsTable> = observer(
  (props: ITransactionsTable) => {
    function handleRequestSort(
      _event: React.MouseEvent<unknown>,
      property: keyof ITransactionColumn
    ) {
      const isDesc = props.sortColumn === property && props.sortDirection === 'desc'
      props.setSort(isDesc ? 'asc' : 'desc', property)
    }

    function handleClick(_event: React.MouseEvent<unknown>, id: number) {
      props.onTransactionSelect(id)
    }

    function handleChangePage(_event: unknown, newPage: number) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      props.setPageNumber(newPage)
    }

    function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
      props.setRowsPerPage(+event.target.value)
    }

    const isSelected = (id: number) => props.selectedTransactionId === id

    const tableBody = []

    const transactions = props.data

    values(transactions).forEach((transaction: TransactionModel) => {
      const isItemSelected = isSelected(Number.parseInt(transaction.id.toString(), 10))

      tableBody.push(
        <TableRow
          hover
          onDoubleClick={event =>
            handleClick(event, Number.parseInt(transaction.id.toString(), 10))
          }
          tabIndex={-1}
          key={transaction.id}
          selected={isItemSelected}
          style={{ minWidth: 50, maxWidth: 50, width: 50, minHeight: 61, height: 61 }}
          className={classes.disableHightlighting}
        >
          <TableCell
            classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}
            className={classes.action}
          >
            <Button
              aria-label="View Receipt"
              variant="text"
              color="primary"
              size="small"
              onClick={event => handleClick(event, Number.parseInt(transaction.id.toString(), 10))}
            >
              View Receipt
            </Button>
          </TableCell>
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            {transaction.id}
          </TableCell>
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            {transaction.billingFirstName} {transaction.billingLastName}
          </TableCell>
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            {transaction.amountPaid === 0 ? (
              <>FREE</>
            ) : (
              getFormattedMonitaryValue(transaction.currency, transaction.amountPaid)
            )}
          </TableCell>
          <TableCell classes={{ root: 'border-b-solid border-b-[1px] border-b-slate-800' }}>
            {transaction.purchaseDate && transaction.purchaseDate.toLocaleString('en-US')}
          </TableCell>
        </TableRow>
      )
    })

    return (
      <StyledPaper className={classes.paper} elevation={0}>
        <div className={classes.tableWrapper}>
          {props.data.size === 0 ? (
            <div style={{ padding: '4em 0' }}>
              <Typography variant="h6" align="center">
                No transactions found
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
                  labelRowsPerPage="Receipts Per Page"
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

TransactionsTable.defaultProps = {
  showPagination: true,
  disableSorting: false,
}

export default TransactionsTable
