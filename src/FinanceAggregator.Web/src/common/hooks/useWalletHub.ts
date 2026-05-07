import { useEffect, useRef } from 'react';
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { updateAssetBalance } from '../../features/wallets/reducers/walletSlice';
import { GATEWAY_URL } from '../constants';


export const useWalletHub = () => {
    const dispatch = useAppDispatch();
    // Select the user identity metadata token out of your active auth slice
    const token = useAppSelector(state => state.auth.user?.token);
    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        // Guard condition: Only establish a persistent connection if the user is actively authenticated
        if (!token) {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }

            return;
        }

        // Initialize the HubConnectionBuilder targeting our YARP proxy gateway path routing
        const connection = new HubConnectionBuilder()
            .withUrl(`${GATEWAY_URL}/hubs/wallets`, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets,
                // Pass the user's cryptographically signed JWT token across the handshake protocol headers
                accessTokenFactory: () => token
            })
            .configureLogging(LogLevel.Warning)
            .withAutomaticReconnect() // Auto-handle unexpected Wi-Fi drops or socket teardowns
            .build();

        connection.onreconnecting((error) => console.warn('[WebSocket Status] Reconnecting due to: ', error));
        connection.onreconnected(() => console.log('[WebSocket Status] Connection restored.'));
        connection.onclose((error) => { if (error) console.error('[WebSocket Status] Connection closed with error: ', error); });

        // Register the strongly-typed streaming channel method mapped to our C# contract
        connection.on('BalanceUpdated', (assetId: string, newBalance: number) => {
            console.log(`[WebSocket Stream] Asset ${assetId} balance reconciled live: $${newBalance}`);
            
            // Dispatch the values straight to Redux for instantaneous, zero-refresh UI hydration!
            dispatch(updateAssetBalance({ assetId, newBalance }));
        });

        // Fire the asynchronous connection pipeline
        connection.start()
            .then(() => console.log('[WebSocket Status] Securely connected to YARP WalletHub stream backplane.'))
            .catch((error) => console.error('[WebSocket Status] Hub Connection Error: ', error));

        connectionRef.current = connection;

        // Clean up and tear down the socket gracefully when the component unmounts or user logs out
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [token, dispatch]);
};