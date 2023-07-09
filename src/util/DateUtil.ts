import moment from 'moment-timezone'

const timezones = moment.tz.names

const numDaysBetween = (date1: Date, date2: Date) => {
  const diff = Math.abs(date1.getTime() - date2.getTime())
  return diff / (1000 * 60 * 60 * 24)
}

export { timezones, numDaysBetween }
