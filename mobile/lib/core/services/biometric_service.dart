import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BiometricService {
  final LocalAuthentication _auth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<bool> isBiometricAvailable() async {
    final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
    final bool canAuthenticate = canAuthenticateWithBiometrics || await _auth.isDeviceSupported();
    return canAuthenticate;
  }

  Future<bool> authenticate({String localizedReason = 'Please authenticate to access Gencom Pay'}) async {
    final available = await isBiometricAvailable();
    if (!available) {
      debugPrint('Biometrics not available. Checking for device security fallback...');
    }

    try {
      final bool didAuthenticate = await _auth.authenticate(
        localizedReason: localizedReason,
        persistAcrossBackgrounding: true,
        biometricOnly: false,
      );
      return didAuthenticate;
    } catch (e) {
      debugPrint('Authentication error: $e');
      return false;
    }
  }

  Future<void> saveCredentials(String email, String password) async {
    await _storage.write(key: 'biometric_email', value: email);
    await _storage.write(key: 'biometric_password', value: password);
    await _storage.write(key: 'biometric_enabled', value: 'true');
  }

  Future<Map<String, String>?> getCredentials() async {
    final email = await _storage.read(key: 'biometric_email');
    final password = await _storage.read(key: 'biometric_password');
    if (email != null && password != null) {
      return {'email': email, 'password': password};
    }
    return null;
  }

  Future<void> enableBiometrics(String token) async {
    await _storage.write(key: 'biometric_token', value: token);
    await _storage.write(key: 'biometric_enabled', value: 'true');
  }

  Future<void> disableBiometrics() async {
    await _storage.delete(key: 'biometric_token');
    await _storage.delete(key: 'biometric_email');
    await _storage.delete(key: 'biometric_password');
    await _storage.write(key: 'biometric_enabled', value: 'false');
  }

  Future<String?> getStoredToken() async {
    return await _storage.read(key: 'biometric_token');
  }

  Future<bool> isBiometricEnabled() async {
    final enabled = await _storage.read(key: 'biometric_enabled');
    return enabled == 'true';
  }
}
