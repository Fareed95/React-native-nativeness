package com.app;

import android.util.Log;

import com.nativehello.NativeHelloSpec;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = NativeHelloModule.NAME)
public class NativeHelloModule extends NativeHelloSpec {
  public static final String NAME = "NativeHello";

  public NativeHelloModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getHello() {
    Log.d("NativeHello", "Called getHello()");
    return "Hello Fareed";
  }
}
