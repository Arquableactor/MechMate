// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_item_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$UpdateItemDtoCWProxy {
  UpdateItemDto type(UpdateItemDtoTypeEnum? type);

  UpdateItemDto description(String? description);

  UpdateItemDto partNumber(String? partNumber);

  UpdateItemDto quantity(String? quantity);

  UpdateItemDto unitPriceCents(String? unitPriceCents);

  UpdateItemDto taxRateBps(int? taxRateBps);

  UpdateItemDto requiresApproval(bool? requiresApproval);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateItemDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateItemDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateItemDto call({
    UpdateItemDtoTypeEnum? type,
    String? description,
    String? partNumber,
    String? quantity,
    String? unitPriceCents,
    int? taxRateBps,
    bool? requiresApproval,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfUpdateItemDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfUpdateItemDto.copyWith.fieldName(...)`
class _$UpdateItemDtoCWProxyImpl implements _$UpdateItemDtoCWProxy {
  const _$UpdateItemDtoCWProxyImpl(this._value);

  final UpdateItemDto _value;

  @override
  UpdateItemDto type(UpdateItemDtoTypeEnum? type) => this(type: type);

  @override
  UpdateItemDto description(String? description) =>
      this(description: description);

  @override
  UpdateItemDto partNumber(String? partNumber) => this(partNumber: partNumber);

  @override
  UpdateItemDto quantity(String? quantity) => this(quantity: quantity);

  @override
  UpdateItemDto unitPriceCents(String? unitPriceCents) =>
      this(unitPriceCents: unitPriceCents);

  @override
  UpdateItemDto taxRateBps(int? taxRateBps) => this(taxRateBps: taxRateBps);

  @override
  UpdateItemDto requiresApproval(bool? requiresApproval) =>
      this(requiresApproval: requiresApproval);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateItemDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateItemDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateItemDto call({
    Object? type = const $CopyWithPlaceholder(),
    Object? description = const $CopyWithPlaceholder(),
    Object? partNumber = const $CopyWithPlaceholder(),
    Object? quantity = const $CopyWithPlaceholder(),
    Object? unitPriceCents = const $CopyWithPlaceholder(),
    Object? taxRateBps = const $CopyWithPlaceholder(),
    Object? requiresApproval = const $CopyWithPlaceholder(),
  }) {
    return UpdateItemDto(
      type: type == const $CopyWithPlaceholder()
          ? _value.type
          // ignore: cast_nullable_to_non_nullable
          : type as UpdateItemDtoTypeEnum?,
      description: description == const $CopyWithPlaceholder()
          ? _value.description
          // ignore: cast_nullable_to_non_nullable
          : description as String?,
      partNumber: partNumber == const $CopyWithPlaceholder()
          ? _value.partNumber
          // ignore: cast_nullable_to_non_nullable
          : partNumber as String?,
      quantity: quantity == const $CopyWithPlaceholder()
          ? _value.quantity
          // ignore: cast_nullable_to_non_nullable
          : quantity as String?,
      unitPriceCents: unitPriceCents == const $CopyWithPlaceholder()
          ? _value.unitPriceCents
          // ignore: cast_nullable_to_non_nullable
          : unitPriceCents as String?,
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

extension $UpdateItemDtoCopyWith on UpdateItemDto {
  /// Returns a callable class that can be used as follows: `instanceOfUpdateItemDto.copyWith(...)` or like so:`instanceOfUpdateItemDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$UpdateItemDtoCWProxy get copyWith => _$UpdateItemDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateItemDto _$UpdateItemDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate(
  'UpdateItemDto',
  json,
  ($checkedConvert) {
    final val = UpdateItemDto(
      type: $checkedConvert(
        'type',
        (v) => $enumDecodeNullable(_$UpdateItemDtoTypeEnumEnumMap, v),
      ),
      description: $checkedConvert('description', (v) => v as String?),
      partNumber: $checkedConvert('part_number', (v) => v as String?),
      quantity: $checkedConvert('quantity', (v) => v as String?),
      unitPriceCents: $checkedConvert('unit_price_cents', (v) => v as String?),
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

Map<String, dynamic> _$UpdateItemDtoToJson(UpdateItemDto instance) =>
    <String, dynamic>{
      'type': ?_$UpdateItemDtoTypeEnumEnumMap[instance.type],
      'description': ?instance.description,
      'part_number': ?instance.partNumber,
      'quantity': ?instance.quantity,
      'unit_price_cents': ?instance.unitPriceCents,
      'tax_rate_bps': ?instance.taxRateBps,
      'requires_approval': ?instance.requiresApproval,
    };

const _$UpdateItemDtoTypeEnumEnumMap = {
  UpdateItemDtoTypeEnum.labor: 'labor',
  UpdateItemDtoTypeEnum.part_: 'part',
};
