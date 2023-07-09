import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Grid,
  Grow,
  IconButton,
  Paper,
  Popper,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import Loading from 'src/common/components/layout/Loading'
import { CartStore } from 'src/common/store'
import { CartItemType } from 'src/modules/cart/store'
import ImagePreview from 'src/common/components/image/ImagePreview'

export interface ICartPopperProps {
  cartStore?: CartStore
  open: boolean
  onClose: () => void
  anchor: any
}

const CartPopper = inject('cartStore')(
  observer(
    class CartPopper extends React.PureComponent<ICartPopperProps> {
      private readonly _cartStore: CartStore

      constructor(props: Readonly<ICartPopperProps>) {
        super(props)

        this._cartStore = props.cartStore
      }

      public componentDidMount() {
        this._cartStore.initializeCart()
      }

      public render() {
        const { open, anchor } = this.props

        return (
          <Popper open={open} anchorEl={anchor} transition className="z-40">
            {({ TransitionProps }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: 'center top',
                }}
              >
                <div>
                  <ClickAwayListener onClickAway={this.handleClose}>
                    <Paper className="h-full min-h-[250px] w-72 bg-background-dark bg-none p-4 sm:w-96">
                      {this._cartStore.loading && <Loading size={40} position="absolute" />}

                      {this._cartStore.cart.totalItemCount === 0 && (
                        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
                          <div className="text-base font-semibold">Your cart is empty</div>
                        </div>
                      )}

                      {this._cartStore.cart.totalItemCount !== 0 && (
                        <>
                          <Typography component="div" gutterBottom>
                            <Box fontWeight="fontWeightMedium" textAlign="center">
                              Your Cart
                            </Box>
                          </Typography>
                          <Divider style={{ marginBottom: '1em' }} />
                          <div className="max-h-64 overflow-scroll">
                            {values(this._cartStore.cart.tracks).map(track => (
                              <div
                                key={track.id}
                                className="mb-4 flex items-center justify-between gap-2"
                              >
                                <div className="flex w-5/6 items-center">
                                  <div className="mr-4 flex flex-col items-center">
                                    <ImagePreview
                                      id={track.id}
                                      src={track.artworkUrl}
                                      className="h-[50px] w-[50px]"
                                    />
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <div
                                      onClick={() => this.onTrackClick(track.id)}
                                      className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-semibold hover:text-primary-main"
                                    >
                                      {track.title}
                                    </div>
                                    <div
                                      className="cursor-pointer text-base opacity-80 hover:text-primary-main"
                                      onClick={() => this.onArtistClick(track.artist.urlAlias)}
                                    >
                                      {track.artistName}
                                    </div>
                                  </div>
                                </div>

                                <div className="w-16 text-right text-sm">
                                  {track.price.formattedPrice}
                                </div>
                              </div>
                            ))}
                            {values(this._cartStore.cart.collections).map(collection => (
                              <div
                                key={collection.id}
                                className="mb-4 flex items-center justify-between gap-2"
                              >
                                <div className="flex w-5/6 items-center">
                                  <div className="mr-4 flex flex-col items-center">
                                    <ImagePreview
                                      id={collection.id}
                                      src={collection.albumArtUrl}
                                      className="h-[50px] w-[50px]"
                                    />
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <div
                                      onClick={() => this.onCollectionClick(collection.id)}
                                      className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-semibold hover:text-primary-main"
                                    >
                                      {collection.name}
                                    </div>
                                    <div
                                      className="cursor-pointer text-base opacity-80 hover:text-primary-main"
                                      onClick={() =>
                                        this.onArtistClick(collection.artists[0]?.urlAlias)
                                      }
                                    >
                                      {collection.artists[0]?.name}
                                    </div>
                                  </div>
                                </div>

                                <div className="w-16 text-right text-sm">
                                  {collection.price.formattedPrice}
                                </div>
                              </div>
                            ))}
                          </div>
                          <Divider style={{ marginTop: '1em' }} />
                          <Grid container style={{ marginTop: '1em' }}>
                            <Grid item xs>
                              <Typography component="div">
                                <Box fontWeight="fontWeightMedium">Total</Box>
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography component="div">
                                <Box fontWeight="fontWeightBold">
                                  {this._cartStore.cart.cartTotal}
                                </Box>
                              </Typography>
                            </Grid>
                          </Grid>
                          <Button
                            style={{ marginTop: '2em' }}
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={this.checkout}
                          >
                            Checkout
                          </Button>
                        </>
                      )}
                    </Paper>
                  </ClickAwayListener>
                </div>
              </Grow>
            )}
          </Popper>
        )
      }

      private onTrackClick = (id: number) => {
        Router.push(`/tracks/${id}`)
        this.handleClose()
      }

      private onCollectionClick = (id: number) => {
        Router.push(`/collections/${id}`)
        this.handleClose()
      }

      private onArtistClick = (urlAlias: string) => {
        Router.push('/artists/[slug]', `/artists/${urlAlias}`)
        this.handleClose()
      }

      private handleRemove = (id: number, cartItemType: CartItemType) => () => {
        if (cartItemType === CartItemType.Track) {
          this._cartStore.removeTrack(id)
        } else if (cartItemType === CartItemType.Collection) {
          this._cartStore.removeCollection(id)
        }
      }

      private handleClose = () => {
        this.props.onClose()
      }

      private checkout = () => {
        this.handleClose()
        Router.push('/checkout')
      }
    }
  )
)

export default CartPopper
