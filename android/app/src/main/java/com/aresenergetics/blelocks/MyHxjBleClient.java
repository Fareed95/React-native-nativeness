package com.aresenergetics.blelocks;

import android.content.Context;

import com.example.hxjblinklibrary.blinkble.profile.client.HxjBleClient;

public class MyHxjBleClient {
    private static HxjBleClient instance;

    public static HxjBleClient getInstance(Context context) {
        if (instance == null) {
            instance = new HxjBleClient(context.getApplicationContext());
        }
        return instance;
    }
}