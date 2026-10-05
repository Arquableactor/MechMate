import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/api.dart';
import '../../core/api_error.dart';
import '../../core/auth/session.dart';
import '../../core/format.dart';
import '../../ui/widgets/mm_form.dart';
import 'customers_data.dart';
import 'customers_screen.dart';

/// Registrar un cliente: solo el nombre es obligatorio. El teléfono es lo más
/// útil (avisos y enlace de aprobación); la cédula, para la factura.
class CustomerFormScreen extends ConsumerStatefulWidget {
  const CustomerFormScreen({super.key});

  @override
  ConsumerState<CustomerFormScreen> createState() => _CustomerFormScreenState();
}

class _CustomerFormScreenState extends ConsumerState<CustomerFormScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _cedula = TextEditingController();
  final _notes = TextEditingController();
  bool _saving = false;
  bool _tried = false;
  ApiError? _error;

  @override
  void dispose() {
    for (final c in [_name, _phone, _email, _cedula, _notes]) {
      c.dispose();
    }
    super.dispose();
  }

  static String? _opt(TextEditingController c) => c.text.trim().isEmpty ? null : c.text.trim();

  Future<void> _submit() async {
    setState(() {
      _tried = true;
      _error = null;
    });
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final shopId = ref.read(currentShopProvider).id;
      final created =
          (await ref
                  .read(apiProvider)
                  .getCustomersApi()
                  .customersCreate(
                    shopId: shopId,
                    createCustomerDto: CreateCustomerDto(
                      fullName: _name.text.trim(),
                      phone: _opt(_phone),
                      email: _opt(_email),
                      documentId: _opt(_cedula),
                      notes: _opt(_notes),
                    ),
                  ))
              .data!;
      refreshCustomers(ref);
      if (mounted) context.go(CustomerRoutes.detail(created.id));
    } catch (e) {
      if (mounted) setState(() => _error = ApiError.from(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final error = _error;
    return MmFormScaffold(
      title: 'Nuevo cliente',
      submitLabel: 'Guardar cliente',
      submitting: _saving,
      onSubmit: _submit,
      children: [
        Form(
          key: _form,
          autovalidateMode: _tried ? AutovalidateMode.onUserInteraction : AutovalidateMode.disabled,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (error != null) ...[
                const SizedBox(height: 16),
                MmNotice(
                  error.message,
                  tone: MmNoticeTone.error,
                  title: error.isConflict ? 'Ese cliente ya está registrado' : 'No se pudo guardar',
                  actionLabel: error.existingId != null ? 'Ver cliente existente' : null,
                  onAction: error.existingId != null
                      ? () => context.go(CustomerRoutes.detail(error.existingId!))
                      : null,
                ),
              ],
              MmFieldGroup(
                title: 'Cliente',
                children: [
                  TextFormField(
                    controller: _name,
                    autofocus: true,
                    textCapitalization: TextCapitalization.words,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.name],
                    maxLength: 120,
                    decoration: const InputDecoration(
                      labelText: 'Nombre completo',
                      hintText: 'Ej.: María Gómez',
                      counterText: '',
                    ),
                    validator: (v) => Validate.fullName(v ?? ''),
                  ),
                ],
              ),
              MmFieldGroup(
                title: 'Contacto',
                children: [
                  TextFormField(
                    controller: _phone,
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.telephoneNumber],
                    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9+()\- ]'))],
                    decoration: const InputDecoration(
                      labelText: 'Teléfono (opcional)',
                      hintText: '809-555-1234',
                      helperText: 'Para avisarle y enviarle el enlace de aprobación.',
                    ),
                    validator: (v) => Validate.phone(v ?? ''),
                  ),
                  TextFormField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    autocorrect: false,
                    decoration: const InputDecoration(labelText: 'Correo (opcional)', hintText: 'maria@correo.com'),
                    validator: (v) => Validate.email(v ?? ''),
                  ),
                  TextFormField(
                    controller: _cedula,
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.next,
                    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9\- ]'))],
                    decoration: const InputDecoration(
                      labelText: 'Cédula (opcional)',
                      hintText: '001-1234567-8',
                      helperText: 'Sale en la factura.',
                    ),
                    validator: (v) => Validate.cedula(v ?? ''),
                  ),
                ],
              ),
              MmFieldGroup(
                title: 'Notas',
                children: [
                  TextFormField(
                    controller: _notes,
                    minLines: 2,
                    maxLines: 5,
                    maxLength: 1000,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      labelText: 'Notas internas (opcional)',
                      hintText: 'Ej.: prefiere que lo llamen en la tarde',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
