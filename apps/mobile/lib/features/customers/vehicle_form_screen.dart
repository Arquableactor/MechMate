import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/api.dart';
import '../../core/api_error.dart';
import '../../core/auth/session.dart';
import '../../core/format.dart';
import '../../core/labels.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/mm_form.dart';
import 'customers_data.dart';
import 'customers_screen.dart';

/// Agregar un vehículo al cliente. Al escribir un VIN válido se decodifica solo
/// (marca, modelo, año) y lo demás queda para corregir a mano.
class VehicleFormScreen extends ConsumerStatefulWidget {
  const VehicleFormScreen({super.key, required this.customerId});

  final String customerId;

  @override
  ConsumerState<VehicleFormScreen> createState() => _VehicleFormScreenState();
}

class _VehicleFormScreenState extends ConsumerState<VehicleFormScreen> {
  final _form = GlobalKey<FormState>();
  final _plate = TextEditingController();
  final _vin = TextEditingController();
  final _chassis = TextEditingController();
  final _make = TextEditingController();
  final _model = TextEditingController();
  final _year = TextEditingController();
  final _color = TextEditingController();
  final _mileage = TextEditingController();

  bool _saving = false;
  bool _tried = false;
  ApiError? _error;
  String? _identifierError;

  // Decodificación del VIN.
  String? _decodedVin;
  bool _decoding = false;
  VinDecodeView? _decode;
  String? _decodeError;

  /// Campos que llenó el VIN (se pueden volver a llenar si cambia el VIN; lo
  /// que el usuario escribió a mano no se pisa).
  final Set<TextEditingController> _fromVin = {};

  @override
  void initState() {
    super.initState();
    for (final c in [_make, _model, _year]) {
      c.addListener(() => _fromVin.remove(c));
    }
  }

  @override
  void dispose() {
    for (final c in [_plate, _vin, _chassis, _make, _model, _year, _color, _mileage]) {
      c.dispose();
    }
    super.dispose();
  }

  void _onVinChanged(String raw) {
    setState(() => _identifierError = null);
    final vin = Validate.normalizeVin(raw);
    if (vin.length == 17 && Validate.vin(vin) == null && vin != _decodedVin) _decodeVin(vin);
  }

  Future<void> _decodeVin(String vin) async {
    setState(() {
      _decodedVin = vin;
      _decoding = true;
      _decode = null;
      _decodeError = null;
    });
    try {
      final result = (await ref.read(apiProvider).getVinApi().vinDecode(vin: vin)).data!;
      if (!mounted || _decodedVin != vin) return;
      final v = result.vehicle;
      if (result.found && v != null) {
        _fill(_make, v.make);
        _fill(_model, v.model);
        _fill(_year, v.year?.toString());
      }
      setState(() => _decode = result);
    } catch (e) {
      if (mounted && _decodedVin == vin) setState(() => _decodeError = ApiError.from(e).message);
    } finally {
      if (mounted && _decodedVin == vin) setState(() => _decoding = false);
    }
  }

  void _fill(TextEditingController c, String? value) {
    if (value == null || (c.text.trim().isNotEmpty && !_fromVin.contains(c))) return;
    c.text = value;
    _fromVin.add(c); // después de asignar: el listener lo habría quitado
  }

  static String? _opt(TextEditingController c) => c.text.trim().isEmpty ? null : c.text.trim();

  Future<void> _submit() async {
    final hasIdentifier = [_plate, _vin, _chassis].any((c) => c.text.trim().isNotEmpty);
    setState(() {
      _tried = true;
      _error = null;
      _identifierError = hasIdentifier ? null : 'Indica al menos la placa, el VIN o el número de chasis.';
    });
    if (!_form.currentState!.validate() || !hasIdentifier) return;
    setState(() => _saving = true);
    try {
      final shopId = ref.read(currentShopProvider).id;
      final created =
          (await ref
                  .read(apiProvider)
                  .getVehiclesApi()
                  .vehiclesCreate(
                    shopId: shopId,
                    // Lo vacío NO se envía: la API completa motor, versión y combustible desde el VIN.
                    createVehicleDto: CreateVehicleDto(
                      customerId: widget.customerId,
                      plate: _opt(_plate),
                      vin: _opt(_vin) == null ? null : Validate.normalizeVin(_vin.text),
                      chassisNumber: _opt(_chassis),
                      make: _opt(_make),
                      model: _opt(_model),
                      year: int.tryParse(_year.text.trim()),
                      color: _opt(_color),
                      mileageKm: int.tryParse(_mileage.text.replaceAll(',', '').trim()),
                    ),
                  ))
              .data!;
      refreshCustomers(ref, customerId: widget.customerId);
      if (mounted) context.go(CustomerRoutes.vehicle(widget.customerId, created.id));
    } catch (e) {
      if (mounted) setState(() => _error = ApiError.from(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final owner = ref.watch(customerProvider(widget.customerId)).value;
    final error = _error;
    return MmFormScaffold(
      title: 'Nuevo vehículo',
      submitLabel: 'Guardar vehículo',
      submitting: _saving,
      onSubmit: _submit,
      children: [
        if (owner != null)
          Padding(
            padding: const EdgeInsets.only(top: MmSpace.s, left: MmSpace.xs),
            child: Text('De ${owner.fullName}', style: MmType.subhead.copyWith(color: MmColors.inkSecondary)),
          ),
        Form(
          key: _form,
          autovalidateMode: _tried ? AutovalidateMode.onUserInteraction : AutovalidateMode.disabled,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (error != null) ...[
                const SizedBox(height: MmSpace.l),
                MmNotice(
                  error.message,
                  tone: MmNoticeTone.error,
                  title: error.isConflict ? 'Ese vehículo ya está registrado' : 'No se pudo guardar',
                ),
              ],
              MmFieldGroup(
                title: 'Identificación',
                children: [
                  if (_identifierError != null) MmNotice(_identifierError!, tone: MmNoticeTone.error),
                  TextFormField(
                    controller: _plate,
                    autofocus: true,
                    textCapitalization: TextCapitalization.characters,
                    textInputAction: TextInputAction.next,
                    onChanged: (_) => setState(() => _identifierError = null),
                    decoration: const InputDecoration(labelText: 'Placa', hintText: 'A123456'),
                    validator: (v) => Validate.plate(v ?? ''),
                  ),
                  TextFormField(
                    controller: _vin,
                    textCapitalization: TextCapitalization.characters,
                    textInputAction: TextInputAction.next,
                    autocorrect: false,
                    maxLength: 20,
                    onChanged: _onVinChanged,
                    decoration: InputDecoration(
                      labelText: 'VIN',
                      hintText: '17 caracteres',
                      counterText: '',
                      helperText: 'Al completarlo, buscamos marca, modelo y año.',
                      suffixIcon: _decoding
                          ? const Padding(
                              padding: EdgeInsets.all(14),
                              child: SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                            )
                          : null,
                    ),
                    validator: (v) => Validate.vin(v ?? ''),
                  ),
                  ?_decodeNotice(),
                  TextFormField(
                    controller: _chassis,
                    textCapitalization: TextCapitalization.characters,
                    textInputAction: TextInputAction.next,
                    onChanged: (_) => setState(() => _identifierError = null),
                    decoration: const InputDecoration(
                      labelText: 'Número de chasis',
                      hintText: 'NZE121-1234567',
                      helperText: 'Para importados sin VIN (p. ej. de Japón).',
                    ),
                    validator: (v) => Validate.chassis(v ?? ''),
                  ),
                ],
              ),
              MmFieldGroup(
                title: 'Vehículo',
                children: [
                  TextFormField(
                    controller: _make,
                    textCapitalization: TextCapitalization.words,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(labelText: 'Marca', hintText: 'Toyota'),
                    validator: (v) => (v ?? '').trim().isEmpty ? 'Indica la marca.' : null,
                  ),
                  TextFormField(
                    controller: _model,
                    textCapitalization: TextCapitalization.words,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(labelText: 'Modelo (opcional)', hintText: 'Corolla'),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _year,
                          keyboardType: TextInputType.number,
                          textInputAction: TextInputAction.next,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(4),
                          ],
                          decoration: const InputDecoration(labelText: 'Año', hintText: '2019'),
                          validator: (v) => Validate.year(v ?? ''),
                        ),
                      ),
                      const SizedBox(width: MmSpace.m),
                      Expanded(
                        child: TextFormField(
                          controller: _color,
                          textCapitalization: TextCapitalization.sentences,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(labelText: 'Color', hintText: 'Gris'),
                        ),
                      ),
                    ],
                  ),
                  TextFormField(
                    controller: _mileage,
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.done,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(7)],
                    onFieldSubmitted: (_) => _submit(),
                    decoration: const InputDecoration(
                      labelText: 'Kilometraje (opcional)',
                      hintText: '85000',
                      suffixText: 'km',
                    ),
                    validator: (v) => Validate.mileage(v ?? ''),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget? _decodeNotice() {
    if (_decodeError != null) return MmNotice(_decodeError!, tone: MmNoticeTone.error);
    final d = _decode;
    if (d == null) return null;
    final v = d.vehicle;
    if (d.found && v != null) {
      final extras = [v.engine, v.fuelType, v.trim].whereType<String>().join(' · ');
      return MmNotice(
        [
          if (extras.isNotEmpty) extras,
          'Completamos los datos desde el VIN; revísalos antes de guardar.',
          if (!d.checkDigitValid) 'Ojo: el dígito de control del VIN no cuadra; verifica que esté bien escrito.',
        ].join('\n'),
        tone: d.checkDigitValid ? MmNoticeTone.success : MmNoticeTone.warning,
        title: vehicleTitle(make: v.make, model: v.model, year: v.year),
      );
    }
    if (d.providerUnavailable) {
      return const MmNotice(
        'El servicio de VIN no responde ahora. Completa la marca y el modelo a mano.',
        tone: MmNoticeTone.warning,
      );
    }
    return const MmNotice('No encontramos ese VIN. Completa la marca y el modelo a mano.');
  }
}
