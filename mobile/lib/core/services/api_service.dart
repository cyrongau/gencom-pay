import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late Dio dio;
  final storage = const FlutterSecureStorage();
  
  // Use central config
  static const String baseUrl = AppConfig.baseUrl;

  ApiService._internal() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(milliseconds: AppConfig.connectTimeout),
      receiveTimeout: const Duration(milliseconds: AppConfig.receiveTimeout),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'token');
        final merchantId = await storage.read(key: 'activeMerchantId');
        
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        
        if (merchantId != null) {
          options.headers['x-merchant-id'] = merchantId;
        }
        
        return handler.next(options);
      },
      onError: (e, handler) {
        if (e.response?.statusCode == 401) {
          // Handle token expiration - Logout or Refresh
          print('Unauthorized: Logging out...');
        }
        return handler.next(e);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) async {
    return await dio.put(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) async {
    return await dio.patch(path, data: data);
  }

  Future<Response> uploadFile(String path, String filePath) async {
    String fileName = filePath.split('/').last;
    FormData formData = FormData.fromMap({
      "file": await MultipartFile.fromFile(filePath, filename: fileName),
    });
    return await dio.post(path, data: formData);
  }

  Future<Response> delete(String path) async {
    return await dio.delete(path);
  }
}
