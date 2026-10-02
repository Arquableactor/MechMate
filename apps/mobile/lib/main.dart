import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';

void main() {
  runApp(
    // Sin reintentos automáticos de Riverpod: los errores se muestran y el
    // usuario reintenta (un cobro o una foto no deben repetirse solos).
    ProviderScope(retry: (_, _) => null, child: const MechMateApp()),
  );
}
