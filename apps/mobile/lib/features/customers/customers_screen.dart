import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/auth/session.dart';
import '../../core/format.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/mm_button.dart';
import '../../ui/widgets/mm_list.dart';
import '../../ui/widgets/mm_page.dart';
import '../../ui/widgets/mm_search_field.dart';
import '../../ui/widgets/state_views.dart';
import 'customer_detail_screen.dart';
import 'customers_data.dart';

/// Rutas de la sección (el router las usa; las pantallas navegan con ellas).
abstract final class CustomerRoutes {
  static const list = '/clientes';
  static const create = '/clientes/nuevo';
  static String detail(String id) => '/clientes/$id';
  static String newVehicle(String customerId) => '/clientes/$customerId/vehiculos/nuevo';
  static String vehicle(String customerId, String vehicleId) => '/clientes/$customerId/vehiculos/$vehicleId';
}

/// Clientes del taller. Teléfono: lista → ficha. Tablet/web: maestro-detalle
/// (lista a la izquierda, el cliente elegido a la derecha).
class CustomersScreen extends StatelessWidget {
  const CustomersScreen({super.key, this.selectedId});

  final String? selectedId;

  static bool isWide(BuildContext context) => MediaQuery.sizeOf(context).width >= MmBreakpoints.tablet;

  @override
  Widget build(BuildContext context) {
    if (!isWide(context)) return const _CustomerListPane();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          width: 380,
          child: _CustomerListPane(selectedId: selectedId, gutter: MmSpace.gutterTablet),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          child: selectedId == null
              ? const MmEmptyState(
                  icon: CupertinoIcons.person_crop_circle,
                  title: 'Elige un cliente',
                  message: 'Verás sus datos, sus vehículos y su historial en el taller.',
                )
              : CustomerDetailBody(key: ValueKey(selectedId), customerId: selectedId!),
        ),
      ],
    );
  }
}

class _CustomerListPane extends ConsumerStatefulWidget {
  const _CustomerListPane({this.selectedId, this.gutter});

  final String? selectedId;
  final double? gutter;

  @override
  ConsumerState<_CustomerListPane> createState() => _CustomerListPaneState();
}

class _CustomerListPaneState extends ConsumerState<_CustomerListPane> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final frontDesk = ref.watch(currentShopProvider).isFrontDesk;
    final gutter = widget.gutter ?? MmPage.gutterFor(MediaQuery.sizeOf(context).width);
    final list = ref.watch(customerListProvider(_query));

    return MmPage(
      title: 'Clientes',
      gutter: gutter,
      trailing: frontDesk
          ? MmHeaderButton(
              icon: CupertinoIcons.plus,
              label: 'Nuevo cliente',
              onPressed: () => context.push(CustomerRoutes.create),
            )
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(gutter, 0, gutter, MmSpace.m),
            child: MmSearchField(hint: 'Nombre, teléfono o cédula', onChanged: (q) => setState(() => _query = q)),
          ),
          Expanded(
            child: switch (list) {
              AsyncData(:final value) => _results(value, gutter, frontDesk),
              AsyncError() => MmErrorState(onRetry: () => ref.invalidate(customerListProvider(_query))),
              _ => _SkeletonList(gutter: gutter),
            },
          ),
        ],
      ),
    );
  }

  Widget _results(CustomerList list, double gutter, bool frontDesk) {
    if (list.items.isEmpty) {
      return _query.isNotEmpty
          ? MmEmptyState(
              icon: CupertinoIcons.search,
              title: 'Sin resultados',
              message: 'No hay clientes que coincidan con “$_query”. Prueba con el teléfono o la cédula.',
            )
          : MmEmptyState(
              icon: CupertinoIcons.person_2,
              title: 'Aún no hay clientes',
              message: frontDesk
                  ? 'Registra a tus clientes y sus vehículos para abrir órdenes en segundos.'
                  : 'Cuando el taller registre clientes, aparecerán aquí.',
              actionLabel: frontDesk ? 'Registrar cliente' : null,
              onAction: frontDesk ? () => context.push(CustomerRoutes.create) : null,
            );
    }
    return RefreshIndicator.adaptive(
      onRefresh: () => ref.refresh(customerListProvider(_query).future),
      child: ListView(
        padding: EdgeInsets.fromLTRB(gutter, MmSpace.xs, gutter, MmSpace.x5 * 2),
        children: [
          MmListGroup(
            children: [
              for (final c in list.items)
                MmListRow(
                  key: ValueKey(c.id),
                  leading: MmAvatar(c.fullName),
                  title: c.fullName,
                  subtitle: _contactLine(c),
                  selected: c.id == widget.selectedId,
                  onTap: () => context.go(CustomerRoutes.detail(c.id)),
                ),
            ],
          ),
          if (list.hasMore) ...[
            const SizedBox(height: MmSpace.m),
            Center(
              child: MmButton.ghost(
                label: 'Cargar más',
                loading: list.loadingMore,
                onPressed: () => ref.read(customerListProvider(_query).notifier).loadMore(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  static String _contactLine(CustomerView c) {
    final parts = [
      if (c.phone != null) Fmt.phone(c.phone!),
      if (c.documentId != null) Fmt.cedula(c.documentId!),
      if (c.phone == null && c.documentId == null && c.email != null) c.email!,
    ];
    return parts.isEmpty ? 'Sin datos de contacto' : parts.join(' · ');
  }
}

class _SkeletonList extends StatelessWidget {
  const _SkeletonList({required this.gutter});

  final double gutter;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Cargando clientes',
      child: ListView(
        padding: EdgeInsets.fromLTRB(gutter, MmSpace.xs, gutter, 0),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          MmListGroup(
            children: [
              for (var i = 0; i < 6; i++)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: MmSpace.l, vertical: MmSpace.m),
                  child: Row(
                    children: [
                      MmSkeleton(width: 40, height: 40, radius: 20),
                      SizedBox(width: MmSpace.m),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            MmSkeleton(width: 160, height: 14),
                            SizedBox(height: MmSpace.s),
                            MmSkeleton(width: 110, height: 11),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
