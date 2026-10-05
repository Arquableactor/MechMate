import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/auth/session.dart';
import '../../core/format.dart';
import '../../core/labels.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/mm_list.dart';
import '../../ui/widgets/mm_page.dart';
import '../../ui/widgets/mm_search_field.dart';
import '../../ui/widgets/state_views.dart';
import 'customers_data.dart';
import 'customers_screen.dart';
import 'history_widgets.dart';

/// Barra superior de las pantallas de detalle: "‹ Atrás" estilo iOS.
PreferredSizeWidget mmDetailBar(BuildContext context, {required String back, String? title}) => AppBar(
  leadingWidth: 140,
  leading: Navigator.of(context).canPop()
      ? TextButton.icon(
          onPressed: () => Navigator.of(context).maybePop(),
          icon: const Icon(CupertinoIcons.chevron_back, size: 22),
          label: Text(back, overflow: TextOverflow.ellipsis),
          style: TextButton.styleFrom(
            foregroundColor: MmColors.primaryText,
            splashFactory: NoSplash.splashFactory,
            padding: const EdgeInsets.only(left: MmSpace.s),
            alignment: Alignment.centerLeft,
          ),
        )
      : null,
  title: title == null ? null : Text(title),
);

/// Ficha del cliente en teléfono (en tablet/web va dentro de [CustomersScreen]).
class CustomerDetailScreen extends StatelessWidget {
  const CustomerDetailScreen({super.key, required this.customerId});

  final String customerId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: mmDetailBar(context, back: 'Clientes'),
      body: CustomerDetailBody(customerId: customerId),
    );
  }
}

class CustomerDetailBody extends ConsumerWidget {
  const CustomerDetailBody({super.key, required this.customerId});

  final String customerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customer = ref.watch(customerProvider(customerId));
    return switch (customer) {
      AsyncData(:final value) => _Content(customer: value),
      AsyncError() => MmErrorState(
        title: 'No pudimos abrir el cliente',
        message: 'Puede que ya no exista o que no haya conexión.',
        onRetry: () => ref.invalidate(customerProvider(customerId)),
      ),
      _ => const Center(child: CircularProgressIndicator.adaptive()),
    };
  }
}

class _Content extends ConsumerWidget {
  const _Content({required this.customer});

  final CustomerView customer;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final frontDesk = ref.watch(currentShopProvider).isFrontDesk;
    final gutter = MmPage.gutterFor(MediaQuery.sizeOf(context).width);
    final vehicles = ref.watch(customerVehiclesProvider(customer.id));
    final c = customer;

    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 760),
        child: ListView(
          padding: EdgeInsets.fromLTRB(gutter, MmSpace.l, gutter, MmSpace.x5 * 2),
          children: [
            Row(
              children: [
                MmAvatar(c.fullName, size: 64),
                const SizedBox(width: MmSpace.l),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Semantics(header: true, child: Text(c.fullName, style: MmType.title2)),
                      const SizedBox(height: 2),
                      Text(
                        'Cliente desde ${Fmt.date(c.createdAt)}',
                        style: MmType.footnote.copyWith(color: MmColors.inkSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: MmSpace.xl),
            HistorySection(of: CustomerHistory(c.id), part: HistoryPart.stats),
            MmSectionHeader(
              'Vehículos',
              action: frontDesk
                  ? TextButton.icon(
                      onPressed: () => context.push(CustomerRoutes.newVehicle(c.id)),
                      icon: const Icon(CupertinoIcons.add, size: 18),
                      label: const Text('Agregar'),
                      style: TextButton.styleFrom(
                        foregroundColor: MmColors.primaryText,
                        minimumSize: const Size(44, 44),
                      ),
                    )
                  : null,
            ),
            switch (vehicles) {
              AsyncData(value: final list) when list.isEmpty => MmCaption(
                frontDesk ? 'Sin vehículos. Agrega uno para abrirle una orden.' : 'Sin vehículos registrados.',
              ),
              AsyncData(value: final list) => MmListGroup(
                children: [for (final v in list) VehicleRow(vehicle: v, customerId: c.id)],
              ),
              AsyncError() => TextButton(
                onPressed: () => ref.invalidate(customerVehiclesProvider(c.id)),
                child: const Text('No pudimos cargar los vehículos. Reintentar'),
              ),
              _ => const MmSkeleton(height: 60, radius: MmRadius.card),
            },
            const MmSectionHeader('Contacto'),
            if (c.phone == null && c.email == null && c.documentId == null && c.notes == null)
              const MmCaption('Sin datos de contacto.')
            else
              MmListGroup(
                separatorIndent: 60,
                children: [
                  if (c.phone != null)
                    _InfoRow(icon: CupertinoIcons.phone_fill, label: 'Teléfono', value: Fmt.phone(c.phone!)),
                  if (c.email != null) _InfoRow(icon: CupertinoIcons.mail_solid, label: 'Correo', value: c.email!),
                  if (c.documentId != null)
                    _InfoRow(icon: CupertinoIcons.creditcard_fill, label: 'Cédula', value: Fmt.cedula(c.documentId!)),
                  if (c.notes != null) _InfoRow(icon: CupertinoIcons.text_alignleft, label: 'Notas', value: c.notes!),
                ],
              ),
            HistorySection(of: CustomerHistory(c.id), part: HistoryPart.visits),
          ],
        ),
      ),
    );
  }
}

/// Fila de vehículo: marca/modelo/año, placa y kilometraje.
class VehicleRow extends StatelessWidget {
  const VehicleRow({super.key, required this.vehicle, required this.customerId});

  final VehicleView vehicle;
  final String customerId;

  @override
  Widget build(BuildContext context) {
    final v = vehicle;
    final detail = [
      if (v.mileageKm != null) Fmt.km(v.mileageKm!),
      if (v.plate == null && v.vin != null) 'VIN ${v.vin}',
      if (v.plate == null && v.vin == null && v.chassisNumber != null) 'Chasis ${v.chassisNumber}',
      if (v.color != null) v.color!,
    ];
    return MmListRow(
      leading: const MmIconTile(CupertinoIcons.car_detailed),
      title: vehicleTitle(make: v.make, model: v.model, year: v.year),
      subtitle: detail.isEmpty ? null : detail.join(' · '),
      titleMaxLines: 2,
      trailing: v.plate == null ? null : MmPlate(v.plate!),
      onTap: () => context.push(CustomerRoutes.vehicle(customerId, v.id)),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label: $value',
      excludeSemantics: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: MmSpace.l, vertical: MmSpace.m),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: MmColors.inkTertiary),
            const SizedBox(width: MmSpace.l),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: MmType.caption.copyWith(color: MmColors.inkSecondary)),
                  const SizedBox(height: 2),
                  SelectableText(value, style: MmType.body),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
