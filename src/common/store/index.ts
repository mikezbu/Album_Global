import { action, configure } from 'mobx'
import { enableStaticRendering } from 'mobx-react'

import AppState from 'src/common/store/AppState'
import UserStore from 'src/common/store/user'
import ArtistStore from 'src/modules/artist/store'
import ExploreArtistsStore from 'src/modules/artist/store/explore'
import CartStore from 'src/modules/cart/store'
import CollectionStore from 'src/modules/collection/store'
import TrackCollectionStore from 'src/modules/collection/store/TrackCollection'
import GenreStore from 'src/modules/genre/store'
import InstrumentStore from 'src/modules/instrument/store'
import KeyStore from 'src/modules/key/store'
import TagStore from 'src/modules/tag/store'
import LibraryStore from 'src/modules/library/store'
import AuthenticationStore from 'src/modules/login/store'
import SamplePackStore from 'src/modules/sample-pack/store'
import SampleStore from 'src/modules/sample/store'
import ExploreSamplesStore from 'src/modules/sample/store/explore'
import TrendingSampleStore from 'src/modules/sample/store/trending'
import SignupStore from 'src/modules/sign-up/store'
import TrackStore from 'src/modules/track/store'
import ExploreTracksStore from 'src/modules/track/store/explore'
import TrendingTracksStore from 'src/modules/track/store/trending'
import TransactionStore from 'src/modules/transactions/store'

const isServer = typeof window === 'undefined'

enableStaticRendering(isServer)
configure({ enforceActions: 'always' })

class Store {
  public appState: AppState = null

  public userStore: UserStore = null

  public artistStore: ArtistStore = null

  public collectionStore: CollectionStore = null

  public cartStore: CartStore = null

  public trackStore: TrackStore = null

  public genreStore: GenreStore = null

  public instrumentStore: InstrumentStore = null

  public keyStore: KeyStore = null

  public tagStore: TagStore = null

  public sampleStore: SampleStore = null

  public authenticationStore: AuthenticationStore = null

  public signupStore: SignupStore = null

  public exploreArtistsStore: ExploreArtistsStore = null

  public exploreTracksStore: ExploreTracksStore = null

  public trendingTracksStore: TrendingTracksStore = null

  public exploreSamplesStore: ExploreSamplesStore = null

  public trendingSamplesStore: TrendingSampleStore = null

  public samplePackStore: SamplePackStore = null

  public transactionStore: TransactionStore = null

  public libraryStore: LibraryStore = null

  public trackCollectionStore: TrackCollectionStore = null

  constructor(initialData: Store) {
    if (initialData) {
      this.appState = new AppState(initialData.appState)
      this.artistStore = new ArtistStore(initialData.artistStore)
      this.collectionStore = new CollectionStore(initialData.collectionStore)
      this.sampleStore = new SampleStore(initialData.sampleStore)
      this.trackStore = new TrackStore(initialData.trackStore)
      this.genreStore = new GenreStore(initialData.genreStore)
      this.instrumentStore = new InstrumentStore(initialData.instrumentStore)
      this.keyStore = new KeyStore(initialData.keyStore)
      this.tagStore = new TagStore(initialData.tagStore)
      this.exploreTracksStore = new ExploreTracksStore(initialData.exploreTracksStore)
      this.trendingTracksStore = new TrendingTracksStore(initialData.trendingTracksStore)
      this.exploreSamplesStore = new ExploreSamplesStore(initialData.exploreSamplesStore)
      this.exploreArtistsStore = new ExploreArtistsStore(initialData.exploreArtistsStore)
      this.trendingSamplesStore = new TrendingSampleStore(initialData.trendingSamplesStore)
      this.samplePackStore = new SamplePackStore(initialData.samplePackStore)
      this.trackCollectionStore = new TrackCollectionStore(initialData.trackCollectionStore)
      this.userStore = new UserStore(initialData.userStore)
    } else {
      this.appState = new AppState()
      this.artistStore = new ArtistStore()
      this.collectionStore = new CollectionStore()
      this.sampleStore = new SampleStore()
      this.trackStore = new TrackStore()
      this.genreStore = new GenreStore()
      this.instrumentStore = new InstrumentStore()
      this.keyStore = new KeyStore()
      this.tagStore = new TagStore()
      this.exploreTracksStore = new ExploreTracksStore()
      this.trendingTracksStore = new TrendingTracksStore()
      this.exploreSamplesStore = new ExploreSamplesStore()
      this.exploreArtistsStore = new ExploreArtistsStore()
      this.trendingSamplesStore = new TrendingSampleStore()
      this.samplePackStore = new SamplePackStore()
      this.trackCollectionStore = new TrackCollectionStore()
      this.userStore = new UserStore()
    }

    this.transactionStore = new TransactionStore()
    this.libraryStore = new LibraryStore()
    this.authenticationStore = new AuthenticationStore()
    this.signupStore = new SignupStore()
    this.cartStore = new CartStore()
  }
}

let store: Store = null

export const initializeStore = action((initialData: Store = null) => {
  if (store === null) {
    store = new Store(initialData)
  }

  return store
})

export const getStore = () => {
  if (store) {
    return store
  } else {
    return initializeStore()
  }
}

export {
  AppState,
  AuthenticationStore,
  ArtistStore,
  CartStore,
  CollectionStore,
  ExploreArtistsStore,
  ExploreTracksStore,
  GenreStore,
  InstrumentStore,
  KeyStore,
  TagStore,
  LibraryStore,
  SamplePackStore,
  SampleStore,
  ExploreSamplesStore,
  SignupStore,
  Store,
  TrackStore,
  TransactionStore,
  TrendingSampleStore,
  TrendingTracksStore,
  TrackCollectionStore,
  UserStore,
}
