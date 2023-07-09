import { Order } from 'src/common/store/util/Paginator'

export interface IHeadRow<T> {
  disablePadding: boolean
  id: keyof T
  label: string
  numeric: boolean
  sortable: boolean
  hideOnMobile: boolean
  hideOnMedium?: boolean
}

export interface IEnhancedTableProps<T> {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void
  order: Order
  orderBy: string
  hiddenColumns: (keyof T)[]
  disableSorting: boolean
}
