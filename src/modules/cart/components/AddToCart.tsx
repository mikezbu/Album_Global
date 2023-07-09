import { Button, Dialog, DialogContent, DialogContentText, Typography } from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import { CartStore } from 'src/common/store'
import { CartItemType } from 'src/modules/cart/store'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import { TrackModel } from 'src/modules/track/store'
import ImagePreview from 'src/common/components/image/ImagePreview'

export interface IAddToCartProps {
  cartStore?: CartStore
  openAddToCartModal?: boolean
  onClose?: () => void
  type: CartItemType
  itemToAdd: any
}

const AddToCart = inject('cartStore')(
  observer(
    class AddToCart extends React.Component<IAddToCartProps> {
      private readonly _cartStore: CartStore

      constructor(props: Readonly<IAddToCartProps>) {
        super(props)

        this._cartStore = props.cartStore
      }

      public render() {
        if (!this.props.openAddToCartModal) {
          return <></>
        }

        const { itemToAdd, type } = this.props
        let item = null

        if (type === CartItemType.Track) {
          item = itemToAdd as TrackModel
        } else if (type === CartItemType.Collection) {
          item = itemToAdd as CollectionModel
        } else {
          item = itemToAdd
        }

        return (
          <Dialog
            onClose={this.handleClose}
            aria-labelledby="add-to-cart-modal"
            open={this.props.openAddToCartModal}
            classes={{
              paper: 'bg-none',
            }}
          >
            <DialogContent className="w-full min-w-[320px] max-w-xl bg-background-main p-2 sm:min-w-[475px]">
              <DialogContentText>
                {this._cartStore.error && (
                  <Typography variant="subtitle1" align="center" color="error" gutterBottom>
                    {this._cartStore.errorMsg}
                  </Typography>
                )}
              </DialogContentText>
              <div className="mb-2 flex w-full items-center justify-between bg-background-dark p-6">
                <div className="flex items-center">
                  <div className="mr-4 flex flex-col items-center">
                    <ImagePreview
                      id={item.id}
                      src={item.artworkUrl}
                      className="h-[50px] w-[50px] sm:h-[125px] sm:w-[125px]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="text-base font-semibold">
                      {type === CartItemType.Collection ? item.name : item.title}
                    </div>
                    <div className="text-sm opacity-80">
                      {type === CartItemType.Collection ? item?.artists[0].name : item.artistName}
                    </div>
                    <div className="text-sm text-gray-300">
                      {type === CartItemType.Collection &&
                        `${item.tracks.size} Track${item.tracks.size > 1 && 's'}`}
                    </div>
                  </div>
                </div>
                <div className="min-w-[70px] text-right text-base font-semibold">
                  {item.price.formattedPrice}
                </div>
              </div>
              <div className="p-4">
                <Button
                  color="primary"
                  variant="outlined"
                  disabled={
                    type === CartItemType.Track
                      ? this._cartStore.cart.tracks.has(item.id)
                      : this._cartStore.cart.collections.has(item.id)
                  }
                  fullWidth
                  onClick={this.addToCart}
                  startIcon={<AddShoppingCartIcon />}
                >
                  {type === CartItemType.Track &&
                    (this._cartStore.cart.tracks.has(item.id)
                      ? 'Track already in cart'
                      : 'Add To Cart')}

                  {type === CartItemType.Collection &&
                    (this._cartStore.cart.collections.has(item.id)
                      ? 'Collection already in cart'
                      : 'Add To Cart')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      private addToCart = () => {
        if (this.props.type === CartItemType.Track) {
          this._cartStore.addTrack(this.props.itemToAdd as TrackModel)
        } else if (this.props.type === CartItemType.Collection) {
          this._cartStore.addCollection(this.props.itemToAdd as CollectionModel)
        }

        this.props.onClose()
      }

      private checkout = () => {
        if (this.props.type === CartItemType.Track) {
          this._cartStore.addTrack(this.props.itemToAdd as TrackModel)
        } else if (this.props.type === CartItemType.Collection) {
          this._cartStore.addCollection(this.props.itemToAdd as CollectionModel)
        }

        this.props.onClose()
        Router.push('/checkout')
      }

      private handleClose = () => {
        if (this.props.onClose) {
          this.props.onClose()
        }
      }
    }
  )
)

export default AddToCart
