export interface Asset {
    id: string;
    ticker: string;
    balance: number;
    locale: string | null;
    walletId: string;
}

export interface AddAssetValues {
    ticker: string;
    locale: string | null;
    initialBalance: number;
}

export interface Wallet {
    id: string;
    userId: string;
    name: string;
    assets: Asset[];
}