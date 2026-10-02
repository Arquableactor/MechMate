// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'item_decision_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ItemDecisionDtoCWProxy {
  ItemDecisionDto itemId(String itemId);

  ItemDecisionDto decision(ItemDecisionDtoDecisionEnum decision);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ItemDecisionDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ItemDecisionDto(...).copyWith(id: 12, name: "My name")
  /// ````
  ItemDecisionDto call({String itemId, ItemDecisionDtoDecisionEnum decision});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfItemDecisionDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfItemDecisionDto.copyWith.fieldName(...)`
class _$ItemDecisionDtoCWProxyImpl implements _$ItemDecisionDtoCWProxy {
  const _$ItemDecisionDtoCWProxyImpl(this._value);

  final ItemDecisionDto _value;

  @override
  ItemDecisionDto itemId(String itemId) => this(itemId: itemId);

  @override
  ItemDecisionDto decision(ItemDecisionDtoDecisionEnum decision) =>
      this(decision: decision);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ItemDecisionDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ItemDecisionDto(...).copyWith(id: 12, name: "My name")
  /// ````
  ItemDecisionDto call({
    Object? itemId = const $CopyWithPlaceholder(),
    Object? decision = const $CopyWithPlaceholder(),
  }) {
    return ItemDecisionDto(
      itemId: itemId == const $CopyWithPlaceholder()
          ? _value.itemId
          // ignore: cast_nullable_to_non_nullable
          : itemId as String,
      decision: decision == const $CopyWithPlaceholder()
          ? _value.decision
          // ignore: cast_nullable_to_non_nullable
          : decision as ItemDecisionDtoDecisionEnum,
    );
  }
}

extension $ItemDecisionDtoCopyWith on ItemDecisionDto {
  /// Returns a callable class that can be used as follows: `instanceOfItemDecisionDto.copyWith(...)` or like so:`instanceOfItemDecisionDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ItemDecisionDtoCWProxy get copyWith => _$ItemDecisionDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ItemDecisionDto _$ItemDecisionDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ItemDecisionDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['item_id', 'decision']);
      final val = ItemDecisionDto(
        itemId: $checkedConvert('item_id', (v) => v as String),
        decision: $checkedConvert(
          'decision',
          (v) => $enumDecode(_$ItemDecisionDtoDecisionEnumEnumMap, v),
        ),
      );
      return val;
    }, fieldKeyMap: const {'itemId': 'item_id'});

Map<String, dynamic> _$ItemDecisionDtoToJson(ItemDecisionDto instance) =>
    <String, dynamic>{
      'item_id': instance.itemId,
      'decision': _$ItemDecisionDtoDecisionEnumEnumMap[instance.decision]!,
    };

const _$ItemDecisionDtoDecisionEnumEnumMap = {
  ItemDecisionDtoDecisionEnum.approved: 'approved',
  ItemDecisionDtoDecisionEnum.declined: 'declined',
};
