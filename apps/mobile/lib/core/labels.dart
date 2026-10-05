import 'package:mechmate_api/mechmate_api.dart';

import '../ui/widgets/mm_badge.dart';

/// Textos y tonos de los estados del dominio (un solo lugar para toda la app).
extension WorkOrderStatusLabel on WorkOrderStatus {
  String get label => switch (this) {
    WorkOrderStatus.draft => 'Borrador',
    WorkOrderStatus.awaitingApproval => 'Esperando aprobación',
    WorkOrderStatus.approved => 'Aprobada',
    WorkOrderStatus.inProgress => 'En reparación',
    WorkOrderStatus.completed => 'Lista',
    WorkOrderStatus.invoiced => 'Por cobrar',
    WorkOrderStatus.paid => 'Pagada',
    WorkOrderStatus.cancelled => 'Cancelada',
  };

  /// Verde = terminado a favor del cliente; azul = en curso; gris = el resto.
  /// (Rojo solo para alertas: una orden cancelada no es una alerta.)
  MmBadgeTone get tone => switch (this) {
    WorkOrderStatus.completed || WorkOrderStatus.paid => MmBadgeTone.success,
    WorkOrderStatus.awaitingApproval ||
    WorkOrderStatus.approved ||
    WorkOrderStatus.inProgress ||
    WorkOrderStatus.invoiced => MmBadgeTone.info,
    WorkOrderStatus.draft || WorkOrderStatus.cancelled => MmBadgeTone.neutral,
  };
}

extension PaymentMethodLabel on PaymentMethod {
  String get label => switch (this) {
    PaymentMethod.card => 'Tarjeta',
    PaymentMethod.cash => 'Efectivo',
    PaymentMethod.transfer => 'Transferencia',
  };
}

/// `Toyota Corolla 2019`.
String vehicleTitle({required String make, String? model, int? year}) =>
    [make, model, year?.toString()].whereType<String>().where((s) => s.isNotEmpty).join(' ');
