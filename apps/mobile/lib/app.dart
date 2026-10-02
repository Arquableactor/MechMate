import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router.dart';
import 'ui/theme.dart';

class MechMateApp extends ConsumerWidget {
  const MechMateApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'MechMate',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(defaultTargetPlatform),
      themeMode: ThemeMode.light,
      scrollBehavior: const MmScrollBehavior(),
      routerConfig: ref.watch(routerProvider),
      locale: const Locale('es', 'DO'),
      supportedLocales: const [Locale('es', 'DO'), Locale('es')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
    );
  }
}
