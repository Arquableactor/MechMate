// Datos de ejemplo con la forma EXACTA del contrato (los modelos generados
// exigen cada campo requerido; un fixture incompleto falla al deserializar).
import 'app_harness.dart';
import 'fake_api.dart';

const customerId = '01920000-0000-7000-8000-0000000000c1';
const vehicleId = '01920000-0000-7000-8000-0000000000e1';
const orderId = '01920000-0000-7000-8000-0000000000f1';
const createdAt = '2026-09-02T14:00:00.000Z';

String api(String path) => 'GET /v1/shops/$shopId$path';

Map<String, Object?> customerJson({
  String id = customerId,
  String name = 'María Gómez',
  String? phone = '+18095551234',
  String? document = '00112345678',
  String? email,
}) => {
  'id': id,
  'full_name': name,
  'phone': phone,
  'email': email,
  'document_id': document,
  'account_id': null,
  'notes': null,
  'created_at': createdAt,
  'updated_at': createdAt,
};

Map<String, Object?> page(List<Object?> items, {String? next}) => {'items': items, 'next_cursor': next};

Map<String, Object?> vehicleJson({String id = vehicleId, String? plate = 'A123456', String? vin}) => {
  'id': id,
  'customer_id': customerId,
  'vin': vin,
  'chassis_number': null,
  'plate': plate,
  'make': 'Toyota',
  'model': 'Corolla',
  'year': 2019,
  'trim': null,
  'engine': '1.8L 4 cil.',
  'fuel_type': 'Gasolina',
  'color': 'Gris',
  'mileage_km': 85000,
  'data_source': vin == null ? 'manual' : 'vin_decode',
  'notes': null,
  'created_at': createdAt,
  'updated_at': createdAt,
};

Map<String, Object?> workOrderJson({String status = 'paid', String total = '626400'}) => {
  'id': orderId,
  'number': 1,
  'code': 'OT-0001',
  'status': status,
  'customer': {'id': customerId, 'full_name': 'María Gómez', 'phone': '+18095551234'},
  'vehicle': {'id': vehicleId, 'make': 'Toyota', 'model': 'Corolla', 'year': 2019, 'plate': 'A123456'},
  'complaint': 'Ruido al frenar',
  'notes': null,
  'mileage_in': 85000,
  'assigned_member_id': null,
  'promised_at': null,
  'currency': 'DOP',
  'subtotal_cents': '530847',
  'tax_cents': '95553',
  'total_cents': total,
  'started_at': null,
  'completed_at': null,
  'cancelled_at': null,
  'cancellation_reason': null,
  'created_by_account_id': '01920000-0000-7000-8000-000000000001',
  'created_at': createdAt,
  'updated_at': createdAt,
};

Map<String, Object?> historyJson({bool empty = false}) => {
  'summary': {
    'visits': empty ? 0 : 1,
    'open_work_orders': 0,
    'total_spent_cents': empty ? '0' : '626400',
    'currency': 'DOP',
    'last_visit_at': empty ? null : createdAt,
  },
  'items': empty
      ? <Object?>[]
      : [
          {
            'work_order': workOrderJson(),
            'invoice': {
              'id': '01920000-0000-7000-8000-0000000000b1',
              'code': 'FAC-0001',
              'status': 'paid',
              'ncf': null,
              'total_cents': '626400',
              'paid_at': createdAt,
            },
            'payment': {'method': 'cash'},
          },
        ],
  'next_cursor': null,
};

/// Taller (con el rol dado) con una clienta, su Corolla y una visita pagada.
Map<String, FakeRoute> customerRoutes({String role = 'owner'}) => {
  ...signedInRoutes(shops: [shopJson('Taller Hermanos Pérez', role: role)]),
  api('/customers'): (
    status: 200,
    body: page([
      customerJson(),
      customerJson(id: 'otro', name: 'Pedro Ruiz', phone: null, document: null, email: 'pedro@correo.com'),
    ]),
  ),
  api('/customers/$customerId'): (status: 200, body: customerJson()),
  api('/customers/$customerId/vehicles'): (status: 200, body: page([vehicleJson()])),
  api('/customers/$customerId/history'): (status: 200, body: historyJson()),
  api('/vehicles/$vehicleId'): (status: 200, body: vehicleJson()),
  api('/vehicles/$vehicleId/history'): (status: 200, body: historyJson()),
};
