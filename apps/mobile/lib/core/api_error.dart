import 'package:dio/dio.dart';

/// Error de la API listo para mostrar: mensaje humano (el que escribió la API
/// en español) y, en conflictos, el id del registro que ya existe.
class ApiError {
  const ApiError(this.message, {this.status, this.existingId});

  final String message;
  final int? status;

  /// `existing_customer_id` / `existing_vehicle_id` de un 409 (duplicado).
  final String? existingId;

  bool get isConflict => status == 409;

  static const offline = 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';

  factory ApiError.from(Object error) {
    if (error is! DioException) return const ApiError('Algo salió mal. Inténtalo de nuevo.');
    final response = error.response;
    if (response == null) return const ApiError(offline);
    final data = response.data;
    String? message;
    String? existing;
    if (data is Map) {
      final raw = data['message'];
      // class-validator devuelve una lista de mensajes: el primero basta.
      message = raw is List && raw.isNotEmpty ? '${raw.first}' : (raw is String ? raw : null);
      existing = (data['existing_customer_id'] ?? data['existing_vehicle_id']) as String?;
    }
    final status = response.statusCode;
    return ApiError(
      message ??
          switch (status) {
            403 => 'Tu rol en este taller no permite esta acción.',
            404 => 'No lo encontramos. Puede que ya no exista.',
            final s? when s >= 500 => 'El servidor tuvo un problema. Inténtalo en un momento.',
            _ => 'No se pudo completar. Revisa los datos e inténtalo de nuevo.',
          },
      status: status,
      existingId: existing,
    );
  }

  @override
  String toString() => message;
}
