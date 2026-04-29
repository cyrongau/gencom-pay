class AppConfig {
  // Use user's local IP for physical devices, and 10.0.2.2 for Android emulators
  static const String baseUrl = 'https://api.generexcom.com';
  
  // Socket URL usually matches base but without the /api prefix if applicable
  // In our case, the API is at :4000
  static const String socketUrl = 'https://api.generexcom.com'; // Match SocketService original

  static const String appName = 'Gencom Pay';
  static const String appVersion = '1.2.0';
  
  // Timeout settings
  static const int connectTimeout = 10000; // 10 seconds
  static const int receiveTimeout = 10000; // 10 seconds
}
