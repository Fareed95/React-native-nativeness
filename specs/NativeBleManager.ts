// specs/NativeBleManager.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Starts BLE device scan.
   */
  startScan(): void;

  /**
   * Opens the lock with given BLE parameters.
   * Resolves when lock is opened and auto-closed.
   */
  openLock(
    lockMac: string,
    aesKey: string,
    authCode: string,
    keyGroupId: number,
    protocolVer: number
  ): Promise<string>;
}


export default TurboModuleRegistry.getEnforcing<Spec>('NativeBleManager');
