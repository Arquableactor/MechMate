// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice_line_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InvoiceLineViewCWProxy {
  InvoiceLineView position(int position);

  InvoiceLineView type(WorkOrderItemType type);

  InvoiceLineView description(String description);

  InvoiceLineView partNumber(String? partNumber);

  InvoiceLineView quantity(String quantity);

  InvoiceLineView unitPriceCents(String unitPriceCents);

  InvoiceLineView taxRateBps(int taxRateBps);

  InvoiceLineView subtotalCents(String subtotalCents);

  InvoiceLineView taxCents(String taxCents);

  InvoiceLineView totalCents(String totalCents);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InvoiceLineView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InvoiceLineView(...).copyWith(id: 12, name: "My name")
  /// ````
  InvoiceLineView call({
    int position,
    WorkOrderItemType type,
    String description,
    String? partNumber,
    String quantity,
    String unitPriceCents,
    int taxRateBps,
    String subtotalCents,
    String taxCents,
    String totalCents,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInvoiceLineView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInvoiceLineView.copyWith.fieldName(...)`
class _$InvoiceLineViewCWProxyImpl implements _$InvoiceLineViewCWProxy {
  const _$InvoiceLineViewCWProxyImpl(this._value);

  final InvoiceLineView _value;

  @override
  InvoiceLineView position(int position) => this(position: position);

  @override
  InvoiceLineView type(WorkOrderItemType type) => this(type: type);

  @override
  InvoiceLineView description(String description) =>
      this(description: description);

  @override
  InvoiceLineView partNumber(String? partNumber) =>
      this(partNumber: partNumber);

  @override
  InvoiceLineView quantity(String quantity) => this(quantity: quantity);

  @override
  InvoiceLineView unitPriceCents(String unitPriceCents) =>
      this(unitPriceCents: unitPriceCents);

  @override
  InvoiceLineView taxRateBps(int taxRateBps) => this(taxRateBps: taxRateBps);

  @override
  InvoiceLineView subtotalCents(String subtotalCents) =>
      this(subtotalCents: subtotalCents);

  @override
  InvoiceLineView taxCents(String taxCents) => this(taxCents: taxCents);

  @override
  InvoiceLineView totalCents(String totalCents) => this(totalCents: totalCents);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InvoiceLineView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InvoiceLineView(...).copyWith(id: 12, name: "My name")
  /// ````
  InvoiceLineView call({
    Object? position = const $CopyWithPlaceholder(),
    Object? type = const $CopyWithPlaceholder(),
    Object? description = const $CopyWithPlaceholder(),
    Object? partNumber = const $CopyWithPlaceholder(),
    Object? quantity = const $CopyWithPlaceholder(),
    Object? unitPriceCents = const $CopyWithPlaceholder(),
    Object? taxRateBps = const $CopyWithPlaceholder(),
    Object? subtotalCents = const $CopyWithPlaceholder(),
    Object? taxCents = const $CopyWithPlaceholder(),
    Object? totalCents = const $CopyWithPlaceholder(),
  }) {
    return InvoiceLineView(
      position: position == const $CopyWithPlaceholder()
          ? _value.position
          // ignore: cast_nullable_to_non_nullable
          : position as int,
      type: type == const $CopyWithPlaceholder()
          ? _value.type
          // ignore: cast_nullable_to_non_nullable
          : type as WorkOrderItemType,
      description: description == const $CopyWithPlaceholder()
          ? _value.description
          // ignore: cast_nullable_to_non_nullable
          : description as String,
      partNumber: partNumber == const $CopyWithPlaceholder()
          ? _value.partNumber
          // ignore: cast_nullable_to_non_nullable
          : partNumber as String?,
      quantity: quantity == const $CopyWithPlaceholder()
          ? _value.quantity
          // ignore: cast_nullable_to_non_nullable
          : quantity as String,
      unitPriceCents: unitPriceCents == const $CopyWithPlaceholder()
          ? _value.unitPriceCents
          // ignore: cast_nullable_to_non_nullable
          : unitPriceCents as String,
      taxRateBps: taxRateBps == const $CopyWithPlaceholder()
          ? _value.taxRateBps
          // ignore: cast_nullable_to_non_nullable
          : taxRateBps as int,
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
    );
  }
}

extension $InvoiceLineViewCopyWith on InvoiceLineView {
  /// Returns a callable class that can be used as follows: `instanceOfInvoiceLineView.copyWith(...)` or like so:`instanceOfInvoiceLineView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InvoiceLineViewCWProxy get copyWith => _$InvoiceLineViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InvoiceLineView _$InvoiceLineViewFromJson(
  Map<String, dynamic> json,
) => $checkedCreate(
  'InvoiceLineView',
  json,
  ($checkedConvert) {
    $checkKeys(
      json,
      requiredKeys: const [
        'position',
        'type',
        'description',
        'part_number',
        'quantity',
        'unit_price_cents',
        'tax_rate_bps',
        'subtotal_cents',
        'tax_cents',
        'total_cents',
      ],
    );
    final val = InvoiceLineView(
      position: $checkedConvert('position', (v) => (v as num).toInt()),
      type: $checkedConvert(
        'type',
        (v) => $enumDecode(_$WorkOrderItemTypeEnumMap, v),
      ),
      description: $checkedConvert('description', (v) => v as String),
      partNumber: $checkedConvert('part_number', (v) => v as String?),
      quantity: $checkedConvert('quantity', (v) => v as String),
      unitPriceCents: $checkedConvert('unit_price_cents', (v) => v as String),
      taxRateBps: $checkedConvert('tax_rate_bps', (v) => (v as num).toInt()),
      subtotalCents: $checkedConvert('subtotal_cents', (v) => v as String),
      taxCents: $checkedConvert('tax_cents', (v) => v as String),
      totalCents: $checkedConvert('total_cents', (v) => v as String),
    );
    return val;
  },
  fieldKeyMap: const {
    'partNumber': 'part_number',
    'unitPriceCents': 'unit_price_cents',
    'taxRateBps': 'tax_rate_bps',
    'subtotalCents': 'subtotal_cents',
    'taxCents': 'tax_cents',
    'totalCents': 'total_cents',
  },
);

Map<String, dynamic> _$InvoiceLineViewToJson(InvoiceLineView instance) =>
    <String, dynamic>{
      'position': instance.position,
      'type': _$WorkOrderItemTypeEnumMap[instance.type]!,
      'description': instance.description,
      'part_number': instance.partNumber,
      'quantity': instance.quantity,
      'unit_price_cents': instance.unitPriceCents,
      'tax_rate_bps': instance.taxRateBps,
      'subtotal_cents': instance.subtotalCents,
      'tax_cents': instance.taxCents,
      'total_cents': instance.totalCents,
    };

const _$WorkOrderItemTypeEnumMap = {
  WorkOrderItemType.labor: 'labor',
  WorkOrderItemType.part_: 'part',
};
