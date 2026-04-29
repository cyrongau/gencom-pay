import 'dart:io';
import 'package:google_mlkit_document_scanner/google_mlkit_document_scanner.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

class OCRService {
  final _textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);
  final _documentScanner = DocumentScanner(
    options: DocumentScannerOptions(
      documentFormat: DocumentFormat.jpeg,
      mode: ScannerMode.full,
      pageLimit: 1,
    ),
  );

  Future<Map<String, String>?> scanDocument() async {
    try {
      final result = await _documentScanner.scanDocument();
      if (result.images.isEmpty) return null;

      final inputImage = InputImage.fromFilePath(result.images.first);
      final RecognizedText recognizedText = await _textRecognizer.processImage(inputImage);

      return _extractMerchantData(recognizedText.text);
    } catch (e) {
      print('OCR Error: $e');
      return null;
    }
  }

  Map<String, String> _extractMerchantData(String text) {
    // Advanced Regex for legal entity extraction
    final businessNameRegex = RegExp(r'([A-Z0-9\s]+ (LTD|LIMITED|CORP|INC|LLC))', caseSensitive: false);
    final taxIdRegex = RegExp(r'(PIN|TAX ID|ITAX|TIN):?\s?([A-Z0-9]+)', caseSensitive: false);

    final businessNameMatch = businessNameRegex.firstMatch(text);
    final taxIdMatch = taxIdRegex.firstMatch(text);

    return {
      'business_name': businessNameMatch?.group(1)?.trim() ?? 'UNKNOWN ENTITY',
      'tax_id': taxIdMatch?.group(2)?.trim() ?? 'PENDING_EXTRACTION',
      'raw_text': text,
    };
  }

  void dispose() {
    _textRecognizer.close();
    _documentScanner.close();
  }
}
