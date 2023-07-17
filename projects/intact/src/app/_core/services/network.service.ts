// ────────────────────────────────────────────────────────────────────────────
import { JoeLogger } from 'joe-fx';
import { fromEvent, Observable } from 'rxjs';
// ────────────────────────────────────────────────────────────────────────────

export class NetworkConnection {
    // #region Properties (4)

    static onOfflineEvent: Observable<string>;
    static onOnlineEvent: Observable<string>;

    static Enabled = false;
    static Initialized = false;

    // #endregion Properties (4)

    // #region Public Static Methods (1)

    static Init() {
        if ( !NetworkConnection.Initialized ) {
            NetworkConnection.Enabled = window.navigator.onLine;
            NetworkConnection.onOnlineEvent = fromEvent<string>( window, 'online' );
            NetworkConnection.onOfflineEvent = fromEvent<string>( window, 'offline' );
            NetworkConnection.onOnlineEvent.subscribe( e => {
                JoeLogger.action( 'NetworkConnection', 'Online' );
                NetworkConnection.Enabled = true;
            } );

            NetworkConnection.onOfflineEvent.subscribe( e => {
                JoeLogger.action( 'NetworkConnection', 'Offline' );
                NetworkConnection.Enabled = false;
            } );
        }
    }

    // #endregion Public Static Methods (1)
}

NetworkConnection.Init();
