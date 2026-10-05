import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/format.dart';
import '../../core/labels.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/mm_badge.dart';
import '../../ui/widgets/mm_list.dart';
import '../../ui/widgets/mm_page.dart';
import '../../ui/widgets/state_views.dart';
import 'customer_detail_screen.dart';
import 'customers_data.dart';
import 'history_widgets.dart';

/// Ficha del vehículo: datos técnicos e historia del carro en el taller
/// (todas sus órdenes, aunque haya cambiado de dueño).
class VehicleDetailScreen extends ConsumerWidget {
  const VehicleDetailScreen({super.key, required this.customerId, required this.vehicleId});

  final String customerId;
  final String vehicleId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicle = ref.watch(vehicleProvider(vehicleId));
    final owner = ref.watch(customerProvider(customerId)).value;
    return Scaffold(
      appBar: mmDetailBar(context, back: owner?.fullName.split(' ').first ?? 'Cliente'),
      body: switch (vehicle) {
        AsyncData(:final value) => _Content(vehicle: value, ownerName: owner?.fullName),
        AsyncError() => MmErrorState(
          title: 'No pudimos abrir el vehículo',
          message: 'Puede que ya no exista o que no haya conexión.',
          onRetry: () => ref.invalidate(vehicleProvider(vehicleId)),
        ),
        _ => const Center(child: CircularProgressIndicator.adaptive()),
      },
    );
  }
}

class _Content extends StatelessWidget {
  const _Content({required this.vehicle, this.ownerName});

  final VehicleView vehicle;
  final String? ownerName;

  @override
  Widget build(BuildContext context) {
    final v = vehicle;
    final gutter = MmPage.gutterFor(MediaQuery.sizeOf(context).width);
    final specs = <(IconData, String, String)>[
      if (v.vin != null) (CupertinoIcons.barcode, 'VIN', v.vin!),
      if (v.chassisNumber != null) (CupertinoIcons.number, 'Chasis', v.chassisNumber!),
      if (v.engine != null) (CupertinoIcons.gear_alt_fill, 'Motor', v.engine!),
      if (v.fuelType != null) (CupertinoIcons.drop_fill, 'Combustible', v.fuelType!),
      if (v.trim != null) (CupertinoIcons.tag_fill, 'Versión', v.trim!),
      if (v.color != null) (CupertinoIcons.paintbrush_fill, 'Color', v.color!),
      if (v.mileageKm != null) (CupertinoIcons.speedometer, 'Kilometraje', Fmt.km(v.mileageKm!)),
    ];

    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 760),
        child: ListView(
          padding: EdgeInsets.fromLTRB(gutter, MmSpace.l, gutter, MmSpace.x5 * 2),
          children: [
            Row(
              children: [
                const MmIconTile(CupertinoIcons.car_detailed, size: 64),
                const SizedBox(width: MmSpace.l),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Semantics(
                        header: true,
                        child: Text(
                          vehicleTitle(make: v.make, model: v.model, year: v.year),
                          style: MmType.title2,
                        ),
                      ),
                      const SizedBox(height: MmSpace.xs),
                      Wrap(
                        spacing: MmSpace.s,
                        runSpacing: MmSpace.xs,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          if (v.plate != null) MmPlate(v.plate!),
                          if (ownerName != null)
                            Text('De $ownerName', style: MmType.footnote.copyWith(color: MmColors.inkSecondary)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: MmSpace.xl),
            HistorySection(of: VehicleHistory(v.id), part: HistoryPart.stats),
            const MmSectionHeader('Datos del vehículo'),
            if (specs.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: MmSpace.xs),
                child: Text('Sin datos técnicos registrados.'),
              )
            else
              MmListGroup(
                separatorIndent: 60,
                children: [
                  for (final (icon, label, value) in specs)
                    Semantics(
                      label: '$label: $value',
                      excludeSemantics: true,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: MmSpace.l, vertical: MmSpace.m),
                        child: Row(
                          children: [
                            Icon(icon, size: 20, color: MmColors.inkTertiary),
                            const SizedBox(width: MmSpace.l),
                            Expanded(
                              child: Text(label, style: MmType.body.copyWith(color: MmColors.inkSecondary)),
                            ),
                            Flexible(
                              child: SelectableText(value, textAlign: TextAlign.end, style: MmType.body),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            if (v.dataSource == VehicleViewDataSourceEnum.vinDecode) ...[
              const SizedBox(height: MmSpace.s),
              const Align(
                alignment: Alignment.centerLeft,
                child: MmBadge(
                  'Datos completados desde el VIN',
                  tone: MmBadgeTone.info,
                  icon: CupertinoIcons.checkmark_seal_fill,
                ),
              ),
            ],
            HistorySection(of: VehicleHistory(v.id), part: HistoryPart.visits, showVehicle: false),
          ],
        ),
      ),
    );
  }
}
