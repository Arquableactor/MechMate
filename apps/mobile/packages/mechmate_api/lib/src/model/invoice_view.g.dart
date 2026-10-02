// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InvoiceViewCWProxy {
  InvoiceView id(String id);

  InvoiceView number(int number);

  InvoiceView code(String code);

  InvoiceView ncf(String? ncf);

  InvoiceView status(InvoiceViewStatusEnum status);

  InvoiceView workOrderId(String workOrderId);

  InvoiceView workOrderCode(String workOrderCode);

  InvoiceView shopName(String shopName);

  InvoiceView customerName(String customerName);

  InvoiceView customerDocumentId(String? customerDocumentId);

  InvoiceView vehicleDescription(String vehicleDescription);

  InvoiceView currency(String currency);

  InvoiceView subtotalCents(String subtotalCents);

  InvoiceView taxCents(String taxCents);

  InvoiceView totalCents(String totalCents);

  InvoiceView issuedAt(String issuedAt);

  InvoiceView paidAt(String? paidAt);

  InvoiceView lines(List<InvoiceLineView> lines);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InvoiceView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InvoiceView(...).copyWith(id: 12, name: "My name")
  /// ````
  InvoiceView call({
    String id,
    int number,
    String code,
    String? ncf,
    InvoiceViewStatusEnum status,
    String workOrderId,
    String workOrderCode,
    String shopName,
    String customerName,
    String? customerDocumentId,
    String vehicleDescription,
    String currency,
    String subtotalCents,
    String taxCents,
    String totalCents,
    String issuedAt,
    String? paidAt,
    List<InvoiceLineView> lines,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInvoiceView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInvoiceView.copyWith.fieldName(...)`
class _$InvoiceViewCWProxyImpl implements _$InvoiceViewCWProxy {
  const _$InvoiceViewCWProxyImpl(this._value);

  final InvoiceView _value;

  @override
  InvoiceView id(String id) => this(id: id);

  @override
  InvoiceView number(int number) => this(number: number);

  @override
  InvoiceView code(String code) => this(code: code);

  @override
  InvoiceView ncf(String? ncf) => this(ncf: ncf);

  @override
  InvoiceView status(InvoiceViewStatusEnum status) => this(status: status);

  @override
  InvoiceView workOrderId(String workOrderId) => this(workOrderId: workOrderId);

  @override
  InvoiceView workOrderCode(String workOrderCode) =>
      this(workOrderCode: workOrderCode);

  @override
  InvoiceView shopName(String shopName) => this(shopName: shopName);

  @override
  InvoiceView customerName(String customerName) =>
      this(customerName: customerName);

  @override
  InvoiceView customerDocumentId(String? customerDocumentId) =>
      this(customerDocumentId: customerDocumentId);

  @override
  InvoiceView vehicleDescription(String vehicleDescription) =>
      this(vehicleDescription: vehicleDescription);

  @override
  InvoiceView currency(String currency) => this(currency: currency);

  @override
  InvoiceView subtotalCents(String subtotalCents) =>
      this(subtotalCents: subtotalCents);

  @override
  InvoiceView taxCents(String taxCents) => this(taxCents: taxCents);

  @override
  InvoiceView totalCents(String totalCents) => this(totalCents: totalCents);

  @override
  InvoiceView issuedAt(String issuedAt) => this(issuedAt: issuedAt);

  @override
  InvoiceView paidAt(String? paidAt) => this(paidAt: paidAt);

  @override
  InvoiceView lines(List<InvoiceLineView> lines) => this(lines: lines);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InvoiceView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InvoiceView(...).copyWith(id: 12, name: "My name")
  /// ````
  InvoiceView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? number = const $CopyWithPlaceholder(),
    Object? code = const $CopyWithPlaceholder(),
    Object? ncf = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? workOrderId = const $CopyWithPlaceholder(),
    Object? workOrderCode = const $CopyWithPlaceholder(),
    Object? shopName = const $CopyWithPlaceholder(),
    Object? customerName = const $CopyWithPlaceholder(),
    Object? customerDocumentId = const $CopyWithPlaceholder(),
    Object? vehicleDescription = const $CopyWithPlaceholder(),
    Object? currency = const $CopyWithPlaceholder(),
    Object? subtotalCents = const $CopyWithPlaceholder(),
    Object? taxCents = const $CopyWithPlaceholder(),
    Object? totalCents = const $CopyWithPlaceholder(),
    Object? issuedAt = const $CopyWithPlaceholder(),
    Object? paidAt = const $CopyWithPlaceholder(),
    Object? lines = const $CopyWithPlaceholder(),
  }) {
    return InvoiceView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      number: number == const $CopyWithPlaceholder()
          ? _value.number
          // ignore: cast_nullable_to_non_nullable
          : number as int,
      code: code == const $CopyWithPlaceholder()
          ? _value.code
          // ignore: cast_nullable_to_non_nullable
          : code as String,
      ncf: ncf == const $CopyWithPlaceholder()
          ? _value.ncf
          // ignore: cast_nullable_to_non_nullable
          : ncf as String?,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as InvoiceViewStatusEnum,
      workOrderId: workOrderId == const $CopyWithPlaceholder()
          ? _value.workOrderId
          // ignore: cast_nullable_to_non_nullable
          : workOrderId as String,
      workOrderCode: workOrderCode == const $CopyWithPlaceholder()
          ? _value.workOrderCode
          // ignore: cast_nullable_to_non_nullable
          : workOrderCode as String,
      shopName: shopName == const $CopyWithPlaceholder()
          ? _value.shopName
          // ignore: cast_nullable_to_non_nullable
          : shopName as String,
      customerName: customerName == const $CopyWithPlaceholder()
          ? _value.customerName
          // ignore: cast_nullable_to_non_nullable
          : customerName as String,
      customerDocumentId: customerDocumentId == const $CopyWithPlaceholder()
          ? _value.customerDocumentId
          // ignore: cast_nullable_to_non_nullable
          : customerDocumentId as String?,
      vehicleDescription: vehicleDescription == const $CopyWithPlaceholder()
          ? _value.vehicleDescription
          // ignore: cast_nullable_to_non_nullable
          : vehicleDescription as String,
      currency: currency == const $CopyWithPlaceholder()
          ? _value.currency
          // ignore: cast_nullable_to_non_nullable
          : currency as String,
      subtotalCents: subtotalCents == const $CopyWithPlaceholder()
          ? _value.subtotalCents
          // ignore: cast_nullable_to_non_nullable
          : subtotalCents as String,
      taxCents: taxCents == const $CopyWithPlaceholder()
          ? _value.taxCents
          // ignore: cast_nullable_to_non_nullable
          : taxCents as String,
      totalCents: totalCents == const $CopyWithPlaceholder()
          ? _value.totalCents
          // ignore: cast_nullable_to_non_nullable
          : totalCents as String,
      issuedAt: issuedAt == const $CopyWithPlaceholder()
          ? _value.issuedAt
          // ignore: cast_nullable_to_non_nullable
          : issuedAt as String,
      paidAt: paidAt == const $CopyWithPlaceholder()
          ? _value.paidAt
          // ignore: cast_nullable_to_non_nullable
          : paidAt as String?,
      lines: lines == const $CopyWithPlaceholder()
          ? _value.lines
          // ignore: cast_nullable_to_non_nullable
          : lines as List<InvoiceLineView>,
    );
  }
}

extension $InvoiceViewCopyWith on InvoiceView {
  /// Returns a callable class that can be used as follows: `instanceOfInvoiceView.copyWith(...)` or like so:`instanceOfInvoiceView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InvoiceViewCWProxy get copyWith => _$InvoiceViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InvoiceView _$InvoiceViewFromJson(Map<String, dynamic> json) => $checkedCreate(
  'InvoiceView',
  json,
  ($checkedConvert) {
    $checkKeys(
      json,
      requiredKeys: const [
        'id',
        'number',
        'code',
        'ncf',
        'status',
        'work_order_id',
        'work_order_code',
        'shop_name',
        'customer_name',
        'customer_document_id',
        'vehicle_description',
        'currency',
        'subtotal_cents',
        'tax_cents',
        'total_cents',
        'issued_at',
        'paid_at',
        'lines',
      ],
    );
    final val = InvoiceView(
      id: $checkedConvert('id', (v) => v as String),
      number: $checkedConvert('number', (v) => (v as num).toInt()),
      code: $checkedConvert('code', (v) => v as String),
      ncf: $checkedConvert('ncf', (v) => v as String?),
      status: $checkedConvert(
        'status',
        (v) => $enumDecode(_$InvoiceViewStatusEnumEnumMap, v),
      ),
      workOrderId: $checkedConvert('work_order_id', (v) => v as String),
      workOrderCode: $checkedConvert('work_order_code', (v) => v as String),
      shopName: $checkedConvert('shop_name', (v) => v as String),
      customerName: $checkedConvert('customer_name', (v) => v as String),
      customerDocumentId: $checkedConvert(
        'customer_document_id',
        (v) => v as String?,
      ),
      vehicleDescription: $checkedConvert(
        'vehicle_description',
        (v) => v as String,
      ),
      currency: $checkedConvert('currency', (v) => v as String),
      subtotalCents: $checkedConvert('subtotal_cents', (v) => v as String),
      taxCents: $checkedConvert('tax_cents', (v) => v as String),
      totalCents: $checkedConvert('total_cents', (v) => v as String),
      issuedAt: $checkedConvert('issued_at', (v) => v as String),
      paidAt: $checkedConvert('paid_at', (v) => v as String?),
      lines: $checkedConvert(
        'lines',
        (v) => (v as List<dynamic>)
            .map((e) => InvoiceLineView.fromJson(e as Map<String, dynamic>))
            .toList(),
      ),
    );
    return val;
  },
  fieldKeyMap: const {
    'workOrderId': 'work_order_id',
    'workOrderCode': 'work_order_code',
    'shopName': 'shop_name',
    'customerName': 'customer_name',
    'customerDocumentId': 'customer_document_id',
    'vehicleDescription': 'vehicle_description',
    'subtotalCents': 'subtotal_cents',
    'taxCents': 'tax_cents',
    'totalCents': 'total_cents',
    'issuedAt': 'issued_at',
    'paidAt': 'paid_at',
  },
);

Map<String, dynamic> _$InvoiceViewToJson(InvoiceView instance) =>
    <String, dynamic>{
      'id': instance.id,
      'number': instance.number,
      'code': instance.code,
      'ncf': instance.ncf,
      'status': _$InvoiceViewStatusEnumEnumMap[instance.status]!,
      'work_order_id': instance.workOrderId,
      'work_order_code': instance.workOrderCode,
      'shop_name': instance.shopName,
      'customer_name': instance.customerName,
      'customer_document_id': instance.customerDocumentId,
      'vehicle_description': instance.vehicleDescription,
      'currency': instance.currency,
      'subtotal_cents': instance.subtotalCents,
      'tax_cents': instance.taxCents,
      'total_cents': instance.totalCents,
      'issued_at': instance.issuedAt,
      'paid_at': instance.paidAt,
      'lines': instance.lines.map((e) => e.toJson()).toList(),
    };

const _$InvoiceViewStatusEnumEnumMap = {
  InvoiceViewStatusEnum.issued: 'issued',
  InvoiceViewStatusEnum.paid: 'paid',
  InvoiceViewStatusEnum.voided: 'voided',
};
