// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_item_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$AddItemDtoCWProxy {
  AddItemDto type(AddItemDtoTypeEnum type);

  AddItemDto description(String description);

  AddItemDto partNumber(String? partNumber);

  AddItemDto quantity(String quantity);

  AddItemDto unitPriceCents(String unitPriceCents);

  AddItemDto taxRateBps(int? taxRateBps);

  AddItemDto requiresApproval(bool? requiresApproval);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `AddItemDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// AddItemDto(...).copyWith(id: 12, name: "My name")
  /// ````
  AddItemDto call({
    AddItemDtoTypeEnum type,
    String description,
    String? partNumber,
    String quantity,
    String unitPriceCents,
    int? taxRateBps,
    bool? requiresApproval,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfAddItemDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfAddItemDto.copyWith.fieldName(...)`
class _$AddItemDtoCWProxyImpl implements _$AddItemDtoCWProxy {
  const _$AddItemDtoCWProxyImpl(this._value);

  final AddItemDto _value;

  @override
  AddItemDto type(AddItemDtoTypeEnum type) => this(type: type);

  @override
  AddItemDto description(String description) => this(description: description);

  @override
  AddItemDto partNumber(String? partNumber) => this(partNumber: partNumber);

  @override
  AddItemDto quantity(String quantity) => this(quantity: quantity);

  @override
  AddItemDto unitPriceCents(String unitPriceCents) =>
      this(unitPriceCents: unitPriceCents);

  @override
  AddItemDto taxRateBps(int? taxRateBps) => this(taxRateBps: taxRateBps);

  @override
  AddItemDto requiresApproval(bool? requiresApproval) =>
      this(requiresApproval: requiresApproval);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `AddItemDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// AddItemDto(...).copyWith(id: 12, name: "My name")
  /// ````
  AddItemDto call({
    Object? type = const $CopyWithPlaceholder(),
    Object? description = const $CopyWithPlaceholder(),
    Object? partNumber = const $CopyWithPlaceholder(),
    Object? quantity = const $CopyWithPlaceholder(),
    Object? unitPriceCents = const $CopyWithPlaceholder(),
    Object? taxRateBps = const $CopyWithPlaceholder(),
    Object? requiresApproval = const $CopyWithPlaceholder(),
  }) {
    return AddItemDto(
      type: type == const $CopyWithPlaceholder()
          ? _value.type
          // ignore: cast_nullable_to_non_nullable
          : type as AddItemDtoTypeEnum,
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
          : taxRateBps as int?,
      requiresApproval: requiresApproval == const $CopyWithPlaceholder()
          ? _value.requiresApproval
          // ignore: cast_nullable_to_non_nullable
          : requiresApproval as bool?,
    );
  }
}

extension $AddItemDtoCopyWith on AddItemDto {
  /// Returns a callable class that can be used as follows: `instanceOfAddItemDto.copyWith(...)` or like so:`instanceOfAddItemDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$AddItemDtoCWProxy get copyWith => _$AddItemDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddItemDto _$AddItemDtoFromJson(Map<String, dynamic> json) => $checkedCreate(
  'AddItemDto',
  json,
  ($checkedConvert) {
    $checkKeys(
      json,
      requiredKeys: const [
        'type',
        'description',
        'quantity',
        'unit_price_cents',
      ],
    );
    final val = AddItemDto(
      type: $checkedConvert(
        'type',
        (v) => $enumDecode(_$AddItemDtoTypeEnumEnumMap, v),
      ),
      description: $checkedConvert('description', (v) => v as String),
      partNumber: $checkedConvert('part_number', (v) => v as String?),
      quantity: $checkedConvert('quantity', (v) => v as String),
      unitPriceCents: $checkedConvert('unit_price_cents', (v) => v as String),
      taxRateBps: $checkedConvert('tax_rate_bps', (v) => (v as num?)?.toInt()),
      requiresApproval: $checkedConvert('requires_approval', (v) => v as bool?),
    );
    return val;
  },
  fieldKeyMap: const {
    'partNumber': 'part_number',
    'unitPriceCents': 'unit_price_cents',
    'taxRateBps': 'tax_rate_bps',
    'requiresApproval': 'requires_approval',
  },
);

Map<String, dynamic> _$AddItemDtoToJson(AddItemDto instance) =>
    <String, dynamic>{
      'type': _$AddItemDtoTypeEnumEnumMap[instance.type]!,
      'description': instance.description,
      'part_number': ?instance.partNumber,
      'quantity': instance.quantity,
      'unit_price_cents': instance.unitPriceCents,
      'tax_rate_bps': ?instance.taxRateBps,
      'requires_approval': ?instance.requiresApproval,
    };

const _$AddItemDtoTypeEnumEnumMap = {
  AddItemDtoTypeEnum.labor: 'labor',
  AddItemDtoTypeEnum.part_: 'part',
};
