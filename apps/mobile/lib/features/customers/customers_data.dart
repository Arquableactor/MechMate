import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/api.dart';
import '../../core/auth/session.dart';

/// Una página acumulada de la lista (se agregan páginas con "Cargar más").
class CustomerList {
  const CustomerList(this.items, this.nextCursor, {this.loadingMore = false});

  final List<CustomerView> items;
  final String? nextCursor;
  final bool loadingMore;

  bool get hasMore => nextCursor != null;
}

/// Clientes del taller que coinciden con la búsqueda (nombre, teléfono o cédula).
final customerListProvider = AsyncNotifierProvider.autoDispose.family<CustomerListController, CustomerList, String>(
  CustomerListController.new,
);

class CustomerListController extends AsyncNotifier<CustomerList> {
  CustomerListController(this.query);

  final String query;
  static const pageSize = 30;

  Future<CustomerViewPage> _page(String? cursor) async {
    final shopId = ref.read(currentShopProvider).id;
    final res = await ref
        .read(apiProvider)
        .getCustomersApi()
        .customersSearch(shopId: shopId, q: query.isEmpty ? null : query, limit: pageSize, cursor: cursor);
    return res.data!;
  }

  @override
  Future<CustomerList> build() async {
    final page = await _page(null);
    return CustomerList(page.items, page.nextCursor);
  }

  Future<void> loadMore() async {
    final current = state.value;
    if (current == null || !current.hasMore || current.loadingMore) return;
    state = AsyncData(CustomerList(current.items, current.nextCursor, loadingMore: true));
    try {
      final page = await _page(current.nextCursor);
      state = AsyncData(CustomerList([...current.items, ...page.items], page.nextCursor));
    } catch (_) {
      // Se conserva lo cargado; el botón "Cargar más" vuelve a estar disponible.
      state = AsyncData(current);
    }
  }
}

final customerProvider = FutureProvider.autoDispose.family<CustomerView, String>((ref, id) async {
  final shopId = ref.watch(currentShopProvider).id;
  return (await ref.watch(apiProvider).getCustomersApi().customersGet(shopId: shopId, customerId: id)).data!;
});

/// Vehículos del cliente (un taller rara vez atiende más de 50 del mismo dueño).
final customerVehiclesProvider = FutureProvider.autoDispose.family<List<VehicleView>, String>((ref, customerId) async {
  final shopId = ref.watch(currentShopProvider).id;
  final res = await ref
      .watch(apiProvider)
      .getVehiclesApi()
      .vehiclesByCustomer(shopId: shopId, customerId: customerId, limit: 50);
  return res.data!.items;
});

final vehicleProvider = FutureProvider.autoDispose.family<VehicleView, String>((ref, id) async {
  final shopId = ref.watch(currentShopProvider).id;
  return (await ref.watch(apiProvider).getVehiclesApi().vehiclesGet(shopId: shopId, vehicleId: id)).data!;
});

/// Historial (resumen + últimas visitas) de un cliente o de un vehículo.
sealed class HistoryOf {
  const HistoryOf(this.id);
  final String id;
}

class CustomerHistory extends HistoryOf {
  const CustomerHistory(super.id);
  @override
  bool operator ==(Object other) => other is CustomerHistory && other.id == id;
  @override
  int get hashCode => Object.hash('c', id);
}

class VehicleHistory extends HistoryOf {
  const VehicleHistory(super.id);
  @override
  bool operator ==(Object other) => other is VehicleHistory && other.id == id;
  @override
  int get hashCode => Object.hash('v', id);
}

final historyProvider = FutureProvider.autoDispose.family<HistoryView, HistoryOf>((ref, of) async {
  final shopId = ref.watch(currentShopProvider).id;
  final api = ref.watch(apiProvider).getHistoryApi();
  final res = switch (of) {
    CustomerHistory(:final id) => await api.historyCustomer(shopId: shopId, customerId: id, limit: 10),
    VehicleHistory(:final id) => await api.historyVehicle(shopId: shopId, vehicleId: id, limit: 10),
  };
  return res.data!;
});

/// Tras crear o editar: que listas y fichas se vuelvan a pedir.
void refreshCustomers(WidgetRef ref, {String? customerId}) {
  ref.invalidate(customerListProvider);
  if (customerId != null) {
    ref
      ..invalidate(customerProvider(customerId))
      ..invalidate(customerVehiclesProvider(customerId))
      ..invalidate(historyProvider(CustomerHistory(customerId)));
  }
}
