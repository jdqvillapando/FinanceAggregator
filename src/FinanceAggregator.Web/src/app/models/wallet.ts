export interface Asset {
    id: string;
    ticker: string;
    balance: number;
    walletId: string;
}

export interface AddAssetValues {
    ticker: string;
    initialBalance: number;
}

export interface Wallet {
    id: string;
    userId: string;
    name: string;
    assets: Asset[];
}