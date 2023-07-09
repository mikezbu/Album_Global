const navigationBarHeight = 80
const drawerWidth = 224

const pageContainer = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  padding: '2em 3em 8em 3em',

  '@media screen and (max-width: 600px)': {
    padding: '1em 1em 4em 1em',
  },
}

const generateRandomColor = (id: number): string => {
  const randomNumber = id % 16

  const colors = [
    'linear-gradient(90deg, #1CB5E0 0%, #000851 100%)',
    'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
    'linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)',
    'linear-gradient(90deg, #3F2B96 0%, #A8C0FF 100%)',
    'linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)',
    'linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)',
    'linear-gradient(90deg, #FDBB2D 0%, #3A1C71 100%)',
    'linear-gradient(90deg, #e3ffe7 0%, #d9e7ff 100%)',
    'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
    'linear-gradient(90deg, #9ebd13 0%, #008552 100%)',
    'linear-gradient(90deg, #d53369 0%, #daae51 100%)',
    'linear-gradient(90deg, #efd5ff 0%, #515ada 100%)',
    'linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%)',
    'linear-gradient(90deg, #f8ff00 0%, #3ad59f 100%)',
    'linear-gradient(90deg, #fcff9e 0%, #c67700 100%)',
    'linear-gradient(to bottom right, #DF1950, #9C616B)',
    'radial-gradient(to left, #234F7D, #E5660B)',
  ]

  return colors[randomNumber]
}

export { drawerWidth, generateRandomColor, navigationBarHeight, pageContainer }
