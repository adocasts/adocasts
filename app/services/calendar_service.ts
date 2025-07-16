import { DateTime } from 'luxon'

export default class CalendarService {
  private static monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  private static dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  static getMonth(year: number, month: number, timezone: string) {
    const daysArray: number[] = []
    const daysBeforeArray: number[] = []
    const daysAfterArray: number[] = []

    const dte = DateTime.fromObject({ year, month })
    const isThisMonth = DateTime.now().month === dte.month && DateTime.now().year === dte.year
    const daysInMonth = dte.daysInMonth!
    const firstDayName = dte.startOf('month').weekdayShort
    const firstDayWeekIndex = this.dayNames.findIndex((day) => day === firstDayName)
    const lastDayName = dte.endOf('month').weekdayShort
    const lastDayWeekIndex = this.dayNames.findIndex((day) => day === lastDayName)

    for (var i = 1; i <= firstDayWeekIndex; i++) {
      daysBeforeArray.push(i)
    }

    for (var i = 1; i <= daysInMonth; i++) {
      daysArray.push(i)
    }

    for (var i = lastDayWeekIndex + 1; i <= this.dayNames.length - 1; i++) {
      daysAfterArray.push(i)
    }

    return {
      daysBefore: daysBeforeArray,
      days: daysArray,
      daysAfter: daysAfterArray,
      monthNames: this.monthNames,
      dayNames: this.dayNames,
      month: dte.monthLong,
      year: dte.year,
      today: isThisMonth && DateTime.now().setZone(timezone).day,
      current: dte,
      prev: {
        year: dte.minus({ month: 1 }).year,
        month: dte.minus({ month: 1 }).month,
      },
      next: {
        year: dte.plus({ month: 1 }).year,
        month: dte.plus({ month: 1 }).month,
      },
    }
  }
}
