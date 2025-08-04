package com.aresenergetics.blelocks;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class NativeBleManagerPackage extends BaseReactPackage {

  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    if (name.equals(NativeBleManagerModule.NAME)) {
      return new NativeBleManagerModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      Map<String, ReactModuleInfo> map = new HashMap<>();
      map.put(NativeBleManagerModule.NAME, new ReactModuleInfo(
        NativeBleManagerModule.NAME,               // Module name exposed to JS
        NativeBleManagerModule.class.getName(),    // Full Java class name
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCXXModule
        true    // isTurboModule
      ));
      return map;
    };
  }
}
