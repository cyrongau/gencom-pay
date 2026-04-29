import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class PushNotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  static final ApiService _api = ApiService();

  static Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      
      // Request permissions (especially for iOS)
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('User granted notification permissions');
        
        // Get token
        String? token = await _fcm.getToken();
        if (token != null) {
          debugPrint('FCM Token: $token');
          await _registerTokenWithBackend(token);
        }

        // Listen for token refreshes
        _fcm.onTokenRefresh.listen(_registerTokenWithBackend);

        // Handle foreground messages
        FirebaseMessaging.onMessage.listen((RemoteMessage message) {
          debugPrint('Foreground Message: ${message.notification?.title}');
        });

        // Handle background messages
        FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      }
    } catch (e) {
      debugPrint('Firebase initialization failed: $e');
    }
  }

  static Future<void> _registerTokenWithBackend(String token) async {
    try {
      await _api.post('/notifications/fcm-token', data: {'token': token});
      debugPrint('FCM Token registered with backend');
    } catch (e) {
      debugPrint('Failed to register FCM token: $e');
    }
  }
}

// Global background handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background Message Received: ${message.messageId}');
}
