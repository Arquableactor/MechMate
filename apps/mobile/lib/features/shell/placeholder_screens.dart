import 'package:flutter/cupertino.dart';

import '../../ui/widgets/mm_page.dart';
import '../../ui/widgets/state_views.dart';

/// Secciones que se llenan en las próximas tareas del Día 8 (clientes y
/// vehículos, órdenes, DVI, cobro). Mientras tanto: estado vacío, no pantalla rota.
class OrdersPlaceholder extends StatelessWidget {
  const OrdersPlaceholder({super.key});

  @override
  Widget build(BuildContext context) => const MmPage(
    title: 'Órdenes',
    child: MmEmptyState(
      icon: CupertinoIcons.wrench,
      title: 'Aún no hay órdenes',
      message: 'Cuando llegue un vehículo, abre aquí su orden de trabajo.',
    ),
  );
}

class BillingPlaceholder extends StatelessWidget {
  const BillingPlaceholder({super.key});

  @override
  Widget build(BuildContext context) => const MmPage(
    title: 'Cobros',
    child: MmEmptyState(
      icon: CupertinoIcons.creditcard,
      title: 'Sin cobros todavía',
      message: 'Las facturas y los pagos de tus órdenes se verán aquí.',
    ),
  );
}

class ShopPlaceholder extends StatelessWidget {
  const ShopPlaceholder({super.key});

  @override
  Widget build(BuildContext context) => const MmPage(
    title: 'Taller',
    child: MmEmptyState(
      icon: CupertinoIcons.gear_alt,
      title: 'Tu taller',
      message: 'Aquí configurarás tu taller, tu equipo y tu cuenta.',
    ),
  );
}
