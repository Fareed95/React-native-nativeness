package com.aresenergetics.blelocks;

import android.os.Handler;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;

import com.example.hxjblinklibrary.blinkble.entity.Response;
import com.example.hxjblinklibrary.blinkble.entity.requestaction.BlinkyAuthAction;
import com.example.hxjblinklibrary.blinkble.entity.requestaction.OpenLockAction;
import com.example.hxjblinklibrary.blinkble.profile.client.FunCallback;
import com.example.hxjblinklibrary.blinkble.scanner.HxjBluetoothDevice;
import com.example.hxjblinklibrary.blinkble.scanner.HxjScanCallback;
import com.example.hxjblinklibrary.blinkble.scanner.HxjScanner;

import com.nativeblemanager.NativeBleManagerSpec;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ReactModule(name = NativeBleManagerModule.NAME)
public class NativeBleManagerModule extends NativeBleManagerSpec {
    public static final String NAME = "NativeBleManager";
    private final ReactApplicationContext reactContext;

    // Cache discovered devices
    private final Map<String, HxjBluetoothDevice> discoveredDevices = new ConcurrentHashMap<>();

    public NativeBleManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @Override
    public void startScan() {
        Log.d("BLE_SCAN", "✅ Global startScan() triggered");

        // Clear old cache
        discoveredDevices.clear();

        HxjScanner.getInstance().startScan(30000, reactContext, new HxjScanCallback() {
            @Override
            public void onHxjScanResults(@NonNull List<HxjBluetoothDevice> results) {
                Log.d("BLE_SCAN", "📡 Devices Found: " + results.size());
                for (HxjBluetoothDevice device : results) {
                    String mac = device.getMac().toLowerCase();
                    discoveredDevices.put(mac, device);
                    Log.d("BLE_SCAN", "🛰️ Device MAC: " + mac);
                }
            }
        });
    }

    @Override
    public void openLock(String lockMac, String aesKey, String authCode, double keyGroupId, double protocolVer, Promise promise) {
        Log.d("BLE_LOCK", "🔓 openLock() called for: " + lockMac);

        String targetMac = lockMac.toLowerCase();
        Handler handler = new Handler();
        int maxRetries = 100;
        int intervalMs = 500;

        Runnable retryTask = new Runnable() {
            int attempts = 0;

            @Override
            public void run() {
                HxjBluetoothDevice device = discoveredDevices.get(targetMac);
                if (device != null) {
                    Log.d("BLE_LOCK", "✅ Match found: " + device.getMac());

                    BlinkyAuthAction authAction = new BlinkyAuthAction.Builder()
                        .hxjBluetoothDevice(device)
                        .authCode(authCode)
                        .dnaKey(aesKey)
                        .keyGroupId((int) keyGroupId)
                        .bleProtocolVer((int) protocolVer)
                        .build();

                    OpenLockAction openAction = new OpenLockAction();
                    openAction.setBaseAuthAction(authAction);

                    MyHxjBleClient.getInstance(reactContext).openLock(openAction, new FunCallback<String>() {
                        @Override
                        public void onResponse(Response<String> response) {
                            if (response.isSuccessful()) {
                                Log.d("BLE_LOCK", "✅ Lock opened successfully");
                                handler.postDelayed(() -> closeLock(authAction, promise), 15000);
                            } else {
                                Log.e("BLE_LOCK", "❌ Lock open failed: " + response.toString());
                                promise.reject("LOCK_FAILED", "Open lock failed");
                            }
                        }

                        @Override
                        public void onFailure(Throwable t) {
                            Log.e("BLE_LOCK", "❌ openLock() error: " + t.getMessage());
                            promise.reject("LOCK_ERROR", t.getMessage());
                        }
                    });

                } else if (++attempts < maxRetries) {
                    Log.d("BLE_LOCK", "⏳ Waiting for device: " + targetMac + " attempt " + attempts);
                    handler.postDelayed(this, intervalMs);
                } else {
                    Log.e("BLE_LOCK", "❌ Device with MAC not found: " + lockMac);
                    promise.reject("DEVICE_NOT_FOUND", "Device with MAC " + lockMac + " not found");
                }
            }
        };

        handler.post(retryTask);
    }

    private void closeLock(BlinkyAuthAction authAction, Promise promise) {
        com.example.hxjblinklibrary.blinkble.entity.requestaction.BlinkyAction closeAction =
            new com.example.hxjblinklibrary.blinkble.entity.requestaction.BlinkyAction();

        closeAction.setBaseAuthAction(authAction);

        MyHxjBleClient.getInstance(reactContext).closeLock(closeAction, new FunCallback<String>() {
            @Override
            public void onResponse(Response<String> response) {
                if (response.isSuccessful()) {
                    Log.d("BLE_LOCK", "🔒 Lock closed successfully");
                    promise.resolve("Lock opened and auto-closed");
                } else {
                    Log.e("BLE_LOCK", "⚠️ Close lock failed: " + response.toString());
                    promise.reject("CLOSE_FAILED", "Close lock failed");
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.e("BLE_LOCK", "❌ closeLock() error: " + t.getMessage());
                promise.reject("CLOSE_ERROR", t.getMessage());
            }
        });
    }
}
