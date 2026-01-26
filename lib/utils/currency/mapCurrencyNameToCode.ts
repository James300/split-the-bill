import { currencyNameMap, CurrencyCode, CurrencyName } from '@/constants/currency';

function mapCurrencyNameToCode (currency: CurrencyName): CurrencyCode {
  return currencyNameMap[currency]
}

export default mapCurrencyNameToCode;
