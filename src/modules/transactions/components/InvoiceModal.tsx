import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'

import Modal from 'src/common/components/modal/Modal'
import { TransactionStore } from 'src/common/store'
import LineItemModel from 'src/modules/transactions/store/model/LineItemModel'
import { getCardTypeImageUrl, getFormattedMonitaryValue } from 'src/util/NumberFormatter'

interface IInvoiceModal {
  transactionStore?: TransactionStore
  open: boolean
  onClose: () => void
}

const InvoiceModal = inject('transactionStore')(
  observer(
    class InvoiceModal extends React.Component<IInvoiceModal> {
      private readonly _transactionStore: TransactionStore

      constructor(props: IInvoiceModal) {
        super(props)

        this._transactionStore = props.transactionStore
      }

      public render() {
        const { open } = this.props
        const transaction = this._transactionStore.selectedTransaction

        return (
          <Modal
            title="Receipt"
            onClose={this.onCloseModal}
            open={open}
            fullWidth
            maxWidth="md"
            content={
              <Paper
                className="min-h-[800px] min-w-[600px] p-12 print:shadow-none"
                elevation={6}
                id="invoice"
              >
                <Grid container className="mb-16">
                  <Grid item xs>
                    <div>
                      <Typography component="div">
                        <Box fontWeight="fontWeightRegular">
                          Order Number:{' '}
                          <Box component="span" fontWeight="fontWeightLight">
                            {transaction.id}
                          </Box>
                        </Box>
                      </Typography>
                      <Typography component="div">
                        <Box fontWeight="fontWeightRegular">
                          Billing Name:{' '}
                          <Box component="span" fontWeight="fontWeightLight">
                            {transaction.billingFirstName} {transaction.billingLastName}
                          </Box>
                        </Box>
                      </Typography>
                      {transaction.amountPaid > 0 && (
                        <>
                          <Typography component="div">
                            <Box fontWeight="fontWeightRegular" display="flex">
                              Card:
                              <Box component="span" fontWeight="fontWeightLight">
                                <Box
                                  component="div"
                                  fontWeight="fontWeightLight"
                                  display="flex"
                                  alignItems="center"
                                  marginLeft="10px"
                                >
                                  <img
                                    className="mr-2 h-5"
                                    alt={transaction.cardType}
                                    src={getCardTypeImageUrl(transaction.cardType)}
                                  />
                                  XXXX - {transaction.last4}
                                </Box>
                              </Box>
                            </Box>
                          </Typography>
                          <Typography component="div">
                            <Box fontWeight="fontWeightRegular">
                              Expiration Date:{' '}
                              <Box component="span" fontWeight="fontWeightLight">
                                {transaction.expireMonth}/{transaction.expireYear}
                              </Box>
                            </Box>
                          </Typography>
                        </>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs>
                    <Typography component="div" gutterBottom>
                      <Box fontWeight="fontWeightRegular" textAlign="end">
                        Purchase Date:
                        <Box component="span" fontWeight="fontWeightLight">
                          {' '}
                          {transaction.purchaseDate &&
                            transaction.purchaseDate.toLocaleString('en-US')}
                        </Box>
                      </Box>
                    </Typography>
                  </Grid>
                </Grid>
                <Typography component="div" gutterBottom>
                  <Box fontWeight="fontWeightRegular">Purchased Items</Box>
                </Typography>
                <Divider style={{ marginBottom: '1em' }} />
                {values(transaction.lineItems).map((lineItem: LineItemModel) => (
                  <Grid container key={lineItem.id}>
                    <Grid item xs>
                      <div className="flex items-start">
                        <Typography component="div" gutterBottom>
                          <Box fontWeight="fontWeightLight">{lineItem.description}</Box>
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item>
                      <Typography component="div" gutterBottom>
                        <Box fontWeight="fontWeightRegular">
                          {lineItem.amountPaid === 0 ? (
                            <>FREE</>
                          ) : (
                            getFormattedMonitaryValue(transaction.currency, lineItem.amountPaid)
                          )}
                        </Box>
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
                <Divider style={{ marginTop: '3em' }} />
                <Grid container style={{ marginTop: '1em' }}>
                  <Grid item xs>
                    <Typography component="div">
                      <Box fontWeight="fontWeightMedium">Total</Box>
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography component="div">
                      <Box fontWeight="fontWeightBold">
                        {transaction.amountPaid === 0 ? (
                          <>FREE</>
                        ) : (
                          getFormattedMonitaryValue(transaction.currency, transaction.amountPaid)
                        )}
                      </Box>
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            }
            actions={
              <div className="flex w-full justify-between">
                <div className="mr-4">
                  <Button variant="outlined" aria-label="Print" onClick={this.onPrint}>
                    Print
                  </Button>
                </div>
                <Button
                  aria-label="Close"
                  variant="contained"
                  color="primary"
                  onClick={this.onCloseModal}
                >
                  Close
                </Button>
              </div>
            }
          />
        )
      }

      private onPrint = () => {
        window.print()
      }

      private onCloseModal = () => {
        this.props.onClose()

        setTimeout(() => {}, 200)
      }
    }
  )
)

export default InvoiceModal
