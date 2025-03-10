import dinero, { Currency } from 'dinero.js'

export default class CurrencyService {
  static format(amount: number, currencyCode: Currency | undefined = 'USD') {
    return dinero({ amount, currency: currencyCode }).toFormat('$0,0.00')
  }

  static centsToDollars(
    amount: number,
    showChange: boolean = false,
    currencyCode: Currency | undefined = 'USD'
  ) {
    const format = showChange ? '0,0.00' : '0,0'
    return dinero({ amount, currency: currencyCode }).toFormat(format)
  }
}
