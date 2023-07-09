export const getFormattedTimeFromSeconds = (time: number): string => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - hours) / 60)
  const seconds = Math.ceil(time - minutes * 60)

  let formattedTime = ''

  if (hours > 0) {
    formattedTime += '' + hours + ':' + (minutes < 10 ? '0' : '')
  }

  formattedTime += '' + minutes + ':' + (seconds < 10 ? '0' : '')
  formattedTime += '' + seconds

  return formattedTime
}
