package com.trackplayer;

import android.content.Context;
import android.os.PowerManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RNReactNativeProximityWakeLockModule extends ReactContextBaseJavaModule {
  private PowerManager mPowerManager;
  private PowerManager.WakeLock mWakeLock;

  private static final String TAG = "ProximityWakeLockModule";

  private final ReactApplicationContext reactContext;

  public RNReactNativeProximityWakeLockModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    mPowerManager = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
  }

  @Override
  public String getName() {
    return "RNReactNativeProximityWakeLock";
  }

  @ReactMethod
  public void activate() {
    if (mWakeLock == null) {
      mWakeLock = mPowerManager.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "incall");
    }
    if (!mWakeLock.isHeld()) {
      Log.d(TAG, "New call active : acquiring incall (CPU only) wake lock");
      mWakeLock.acquire();
    } else {
      Log.d(TAG, "New call active while incall (CPU only) wake lock already active");
    }
  }

  @ReactMethod
  public void deactivate() {
    if (mWakeLock != null && mWakeLock.isHeld()) {
      mWakeLock.release();
      Log.d(TAG, "Last call ended: releasing incall (CPU only) wake lock");
    } else {
      Log.d(TAG, "Last call ended: no incall (CPU only) wake lock were held");
    }
  }
}
