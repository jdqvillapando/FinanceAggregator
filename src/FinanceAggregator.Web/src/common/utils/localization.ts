import type { DropdownOption } from '../components/Dropdown';
import cryptoData from '../lib/cryptocurrency.json';
import localeData from '../lib/locale.json';


/**
 * Checks if ticker is available in `locale.json` and `cyptocurrency.json`.
 * @param ticker Ticker symbol (eg: PHP, USD, BTC, etc.)
 * @returns `true` if ticker symbol is available; otherwise, `false`
 */
export const isTickerAvailable = (ticker: string) => [
    ...new Set(localeData.map((t) => t.fiat)),
    ...new Set(cryptoData.map((t) => t.fiat))
].includes(ticker);

/**
 * Populates the locale dropdown options based on the ticker symbol.
 * @param ticker Ticker symbol (eg: PHP, USD, BTC, etc.)
 * @returns Available locales related to the ticker
 */
export const getLocaleOptions = (ticker: string): DropdownOption[] => 
    localeData.filter((t) => t.fiat === ticker).map((l) => ({ label: l.localeCountry, value: l.abbreviation } as DropdownOption));

/**
 * Formats a numeric balance based on the ticker symbol.
 * Handles Fiat (PHP, USD, etc.) with currency symbols 
 * and Crypto (BTC, ETH) with high precision.
 * @param ticker Ticker symbol (eg: PHP, USD, BTC, etc.)
 * @param balance Amount to be applied with localization
 * @param locale Target locale
 * @returns Formatted fiat currency or cryptocurrency based on target locale
 */
export const formatAssetDisplay = (ticker: string, balance: number, locale: string | null): string => {
    if (locale !== null) {
        const targetLocale = localeData.find((f) => f.fiat === ticker && f.abbreviation === locale);

        if (targetLocale) {
            return new Intl.NumberFormat(`${targetLocale.language}-${targetLocale.abbreviation}`, {
                style: 'currency',
                currency: targetLocale.fiat,
                minimumFractionDigits: targetLocale.fractionalDigitPlacement
            }).format(balance);
        }
        else {
            // If target locale is not existing, default to US-format localization.
            return `${ticker.toUpperCase()} ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }
    }

    // Default Crypto/Asset Formatting (8 decimal places)
    return `${balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
    })} ${ticker.toUpperCase()}`;
};