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
import '../../ui/widgets/mm_search_field.dart';
import '../../ui/widgets/state_views.dart';
import 'customers_data.dart';

/// Qué parte del historial mostrar: el resumen (arriba de la ficha) o la
/// lista de visitas (abajo). Ambas leen el mismo `historyProvider` (una consulta).
enum HistoryPart { stats, visits }

/// Resumen o últimas visitas de un cliente o vehículo (`GET …/history`).
class HistorySection extends ConsumerWidget {
  const HistorySection({super.key, required this.of, required this.part, this.showVehicle = true});

  final HistoryOf of;
  final HistoryPart part;

  /// En la ficha del cliente cada visita dice de qué vehículo fue.
  final bool showVehicle;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(historyProvider(of));
    return switch ((history, part)) {
      (AsyncData(:final value), HistoryPart.stats) => HistoryStats(summary: value.summary),
      (AsyncData(:final value), HistoryPart.visits) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const MmSectionHeader('Historial'),
          if (value.items.isEmpty)
            const MmCaption('Todavía no hay visitas registradas.')
          else
            MmListGroup(
              children: [for (final e in value.items) _EntryRow(entry: e, showVehicle: showVehicle)],
            ),
          if (value.nextCursor != null) const MmCaption('Se muestran las 10 visitas más recientes.'),
        ],
      ),
      // El error se muestra una sola vez (en el resumen), con su "Reintentar".
      (AsyncError(), HistoryPart.stats) => Row(
        children: [
          Expanded(
            child: Text(
              'No pudimos cargar el historial.',
              style: MmType.subhead.copyWith(color: MmColors.inkSecondary),
            ),
          ),
          TextButton(onPressed: () => ref.invalidate(historyProvider(of)), child: const Text('Reintentar')),
        ],
      ),
      (AsyncError(), HistoryPart.visits) => const SizedBox.shrink(),
      (_, HistoryPart.stats) => const Row(
        children: [
          Expanded(child: MmSkeleton(height: 76, radius: MmRadius.control)),
          SizedBox(width: MmSpace.m),
          Expanded(child: MmSkeleton(height: 76, radius: MmRadius.control)),
          SizedBox(width: MmSpace.m),
          Expanded(child: MmSkeleton(height: 76, radius: MmRadius.control)),
        ],
      ),
      (_, HistoryPart.visits) => const SizedBox.shrink(),
    };
  }
}

/// Tres cifras que importan al mostrador: visitas, cuánto ha gastado y cuándo vino.
class HistoryStats extends StatelessWidget {
  const HistoryStats({super.key, required this.summary});

  final HistorySummary summary;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: _Stat(label: 'Visitas', value: '${summary.visits}', hint: _openHint(summary.openWorkOrders)),
        ),
        const SizedBox(width: MmSpace.m),
        Expanded(
          child: _Stat(
            label: 'Total pagado',
            value: Fmt.money(summary.totalSpentCents, currency: summary.currency),
          ),
        ),
        const SizedBox(width: MmSpace.m),
        Expanded(
          child: _Stat(
            label: 'Última visita',
            value: summary.lastVisitAt == null ? '—' : Fmt.relativeDate(summary.lastVisitAt!),
          ),
        ),
      ],
    );
  }

  static String? _openHint(int open) => switch (open) {
    0 => null,
    1 => '1 en curso',
    _ => '$open en curso',
  };
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, this.hint});

  final String label;
  final String value;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label: $value${hint == null ? '' : ', $hint'}',
      excludeSemantics: true,
      child: Container(
        padding: const EdgeInsets.all(MmSpace.m),
        decoration: BoxDecoration(
          color: MmColors.surface,
          borderRadius: BorderRadius.circular(MmRadius.control),
          boxShadow: MmShadows.card,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: MmType.caption.copyWith(color: MmColors.inkSecondary)),
            const SizedBox(height: MmSpace.xs),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(value, maxLines: 1, style: MmType.headline.copyWith(fontFeatures: MmType.money)),
            ),
            if (hint != null) ...[
              const SizedBox(height: 2),
              Text(hint!, style: MmType.caption.copyWith(color: MmColors.primaryText)),
            ],
          ],
        ),
      ),
    );
  }
}

class _EntryRow extends StatelessWidget {
  const _EntryRow({required this.entry, required this.showVehicle});

  final HistoryEntry entry;
  final bool showVehicle;

  @override
  Widget build(BuildContext context) {
    final wo = entry.workOrder;
    final v = wo.vehicle;
    final total = entry.invoice?.totalCents ?? wo.totalCents;
    // Título: lo que el cliente pidió. Debajo: orden, fecha y vehículo. A la
    // derecha: monto, estado y cómo se pagó.
    final line1 = '${wo.code} · ${Fmt.date(wo.createdAt)}';
    final line2 = showVehicle ? vehicleTitle(make: v.make, model: v.model, year: v.year) : null;
    return MmListRow(
      leading: const MmIconTile(CupertinoIcons.wrench_fill, size: 36),
      title: wo.complaint,
      subtitle: line2 == null ? line1 : '$line1\n$line2',
      subtitleMaxLines: 2,
      trailing: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            Fmt.money(total, currency: wo.currency),
            style: MmType.subhead.copyWith(fontWeight: FontWeight.w600, fontFeatures: MmType.money),
          ),
          const SizedBox(height: 4),
          MmBadge(wo.status.label, tone: wo.status.tone),
          if (entry.payment != null) ...[
            const SizedBox(height: 4),
            Text(entry.payment!.method.label, style: MmType.caption.copyWith(color: MmColors.inkSecondary)),
          ],
        ],
      ),
    );
  }
}
