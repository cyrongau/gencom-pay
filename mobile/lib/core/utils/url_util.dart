import '../config/app_config.dart';

class UrlUtil {
  static String getImageUrl(String? url, {String? fallbackName}) {
    if (url == null || url.isEmpty) {
      if (fallbackName != null) {
        return "https://ui-avatars.com/api/?name=$fallbackName&background=16C66E&color=fff";
      }
      return "https://ui-avatars.com/api/?name=User&background=16C66E&color=fff";
    }
    
    if (url.startsWith('http')) {
      return url;
    }
    
    // Prepend base URL for relative paths (e.g. /uploads/...)
    return "${AppConfig.baseUrl}$url";
  }
}
