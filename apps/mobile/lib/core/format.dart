/// Formatos para República Dominicana. El dinero llega de la API como
/// centavos en string (`"626400"`): se formatea con enteros, NUNCA con double.
abstract final class Fmt {
  static const _symbols = {'DOP': 'RD\$', 'USD': 'US\$'};

  /// `"626400"` → `RD$6,264.00`.
  static String money(String cents, {String currency = 'DOP'}) {
    final value = BigInt.parse(cents);
    final negative = value.isNegative;
    final abs = value.abs();
    final pesos = (abs ~/ BigInt.from(100)).toString();
    final centavos = (abs % BigInt.from(100)).toString().padLeft(2, '0');
    final grouped = pesos.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');
    return '${negative ? '-' : ''}${_symbols[currency] ?? '$currency '}$grouped.$centavos';
  }

  /// `+18095551234` → `(809) 555-1234`. Otros países: tal como vienen.
  static String phone(String e164) {
    final m = RegExp(r'^\+1(\d{3})(\d{3})(\d{4})$').firstMatch(e164);
    return m == null ? e164 : '(${m[1]}) ${m[2]}-${m[3]}';
  }

  /// `00112345678` → `001-1234567-8`.
  static String cedula(String digits) {
    final m = RegExp(r'^(\d{3})(\d{7})(\d)$').firstMatch(digits);
    return m == null ? digits : '${m[1]}-${m[2]}-${m[3]}';
  }

  /// `85000` → `85,000 km`.
  static String km(int value) => '${value.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')} km';

  static const _months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /// Hora de República Dominicana: UTC−4 todo el año (sin horario de verano).
  static DateTime _rd(String iso) => DateTime.parse(iso).toUtc().subtract(const Duration(hours: 4));

  /// `2026-09-30T14:00:00Z` → `30 sep 2026` (fecha en RD).
  static String date(String iso) {
    final d = _rd(iso);
    return '${d.day} ${_months[d.month - 1]} ${d.year}';
  }

  /// Fecha relativa para listas: `Hoy`, `Ayer`, `Hace 5 días` o la fecha.
  static String relativeDate(String iso, {DateTime? now}) {
    final d = _rd(iso);
    final today = _rd((now ?? DateTime.now()).toUtc().toIso8601String());
    final days = DateTime.utc(
      today.year,
      today.month,
      today.day,
    ).difference(DateTime.utc(d.year, d.month, d.day)).inDays;
    if (days == 0) return 'Hoy';
    if (days == 1) return 'Ayer';
    if (days > 1 && days < 7) return 'Hace $days días';
    return date(iso);
  }

  /// Iniciales para avatares: `María Gómez` → `MG`.
  static String initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    final letters = parts.length == 1 ? [parts.first] : [parts.first, parts.last];
    return letters.map((p) => p[0].toUpperCase()).join();
  }
}

/// Validaciones IGUALES a las de la API (mismos mensajes que el usuario verá
/// si la API los rechaza). `null` = válido. Campos opcionales vacíos = válidos.
abstract final class Validate {
  static String? fullName(String v) {
    final t = v.trim();
    if (t.length < 2) return 'Escribe el nombre (al menos 2 letras).';
    if (t.length > 120) return 'Máximo 120 caracteres.';
    return null;
  }

  /// RD: 10 dígitos (809/829/849…), con o sin 1; o internacional con `+`.
  static String? phone(String v) {
    final t = v.trim();
    if (t.isEmpty) return null;
    final digits = t.replaceAll(RegExp(r'\D'), '');
    final ok = t.startsWith('+')
        ? RegExp(r'^[1-9]\d{7,14}$').hasMatch(digits)
        : digits.length == 10 || (digits.length == 11 && digits.startsWith('1'));
    return ok ? null : 'Escribe un teléfono válido, p. ej. 809-555-1234.';
  }

  static String? email(String v) {
    final t = v.trim();
    if (t.isEmpty) return null;
    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$').hasMatch(t) ? null : 'Escribe un correo válido.';
  }

  static String? cedula(String v) {
    final t = v.trim();
    if (t.isEmpty) return null;
    return RegExp(r'^\d{11}$').hasMatch(t.replaceAll(RegExp(r'\D'), '')) ? null : 'La cédula tiene 11 dígitos.';
  }

  /// Placa RD: 4–10 letras/números (guiones y espacios se ignoran).
  static String? plate(String v) {
    final t = v.trim();
    if (t.isEmpty) return null;
    return RegExp(r'^[A-Z0-9]{4,10}$').hasMatch(normalizePlate(t)) ? null : 'Placa de 4 a 10 letras o números.';
  }

  /// VIN: 17 caracteres, sin I, O ni Q.
  static String? vin(String v) {
    final t = normalizeVin(v);
    if (t.isEmpty) return null;
    return RegExp(r'^[A-HJ-NPR-Z0-9]{17}$').hasMatch(t) ? null : 'El VIN tiene 17 caracteres (sin I, O ni Q).';
  }

  static String? chassis(String v) {
    final t = v.toUpperCase().replaceAll(RegExp(r'\s+'), '');
    if (t.isEmpty) return null;
    return RegExp(r'^[A-Z0-9-]{5,25}$').hasMatch(t) ? null : 'Chasis de 5 a 25 letras, números o guiones.';
  }

  static String? year(String v) {
    if (v.trim().isEmpty) return null;
    final n = int.tryParse(v.trim());
    return n != null && n >= 1900 && n <= 2100 ? null : 'Año entre 1900 y 2100.';
  }

  static String? mileage(String v) {
    if (v.trim().isEmpty) return null;
    final n = int.tryParse(v.replaceAll(',', '').trim());
    return n != null && n >= 0 && n <= 3000000 ? null : 'Kilometraje entre 0 y 3,000,000.';
  }

  static String normalizePlate(String v) => v.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
  static String normalizeVin(String v) => v.toUpperCase().replaceAll(RegExp(r'[\s-]'), '');
}
