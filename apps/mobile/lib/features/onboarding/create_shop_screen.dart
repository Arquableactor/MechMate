import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth/session.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/mm_button.dart';

/// Misma regla que la API (`CreateShopDto`): 2–120 caracteres sin espacios sobrantes.
String? validateShopName(String raw) {
  final name = raw.trim();
  if (name.length < 2) return 'Escribe al menos 2 caracteres.';
  if (name.length > 120) return 'Máximo 120 caracteres.';
  return null;
}

/// Primer ingreso: un solo dato (el nombre del taller) y listo.
class CreateShopScreen extends ConsumerStatefulWidget {
  const CreateShopScreen({super.key});

  @override
  ConsumerState<CreateShopScreen> createState() => _CreateShopScreenState();
}

class _CreateShopScreenState extends ConsumerState<CreateShopScreen> {
  final _name = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _name.addListener(() => setState(() => _error = null));
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final invalid = validateShopName(_name.text);
    if (invalid != null) {
      setState(() => _error = invalid);
      return;
    }
    setState(() => _saving = true);
    try {
      await ref.read(sessionProvider.notifier).createShop(_name.text);
    } catch (_) {
      if (mounted) setState(() => _error = 'No pudimos crear el taller. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider).value;
    final firstName = session is SignedIn ? session.firstName : null;
    final valid = validateShopName(_name.text) == null;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(MmSpace.xxl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(color: MmColors.primaryTint, borderRadius: BorderRadius.circular(18)),
                    child: const Icon(CupertinoIcons.building_2_fill, color: MmColors.primary, size: 28),
                  ),
                  const SizedBox(height: MmSpace.xxl),
                  Semantics(
                    header: true,
                    child: Text(
                      firstName == null ? 'Crea tu taller' : '$firstName, crea tu taller',
                      style: MmType.title1,
                    ),
                  ),
                  const SizedBox(height: MmSpace.s),
                  Text(
                    'Así lo verán tus clientes en facturas y mensajes. Puedes cambiarlo después.',
                    style: MmType.body.copyWith(color: MmColors.inkSecondary),
                  ),
                  const SizedBox(height: MmSpace.x3),
                  TextField(
                    controller: _name,
                    autofocus: true,
                    enabled: !_saving,
                    textCapitalization: TextCapitalization.words,
                    textInputAction: TextInputAction.done,
                    maxLength: 120,
                    onSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      labelText: 'Nombre del taller',
                      hintText: 'Ej.: Taller Hermanos Pérez',
                      errorText: _error,
                      counterText: '',
                      suffixIcon: valid && _error == null
                          ? const Icon(CupertinoIcons.checkmark_circle_fill, color: MmColors.success)
                          : null,
                    ),
                  ),
                  const SizedBox(height: MmSpace.xxl),
                  MmButton(label: 'Crear taller', loading: _saving, onPressed: valid ? _submit : null),
                  const SizedBox(height: MmSpace.s),
                  MmButton.ghost(
                    label: 'Usar otra cuenta',
                    expand: true,
                    onPressed: _saving ? null : () => ref.read(sessionProvider.notifier).logout(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
