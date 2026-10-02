// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'decide_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$DecideDtoCWProxy {
  DecideDto decisions(List<ItemDecisionDto> decisions);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `DecideDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// DecideDto(...).copyWith(id: 12, name: "My name")
  /// ````
  DecideDto call({List<ItemDecisionDto> decisions});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfDecideDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfDecideDto.copyWith.fieldName(...)`
class _$DecideDtoCWProxyImpl implements _$DecideDtoCWProxy {
  const _$DecideDtoCWProxyImpl(this._value);

  final DecideDto _value;

  @override
  DecideDto decisions(List<ItemDecisionDto> decisions) =>
      this(decisions: decisions);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `DecideDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// DecideDto(...).copyWith(id: 12, name: "My name")
  /// ````
  DecideDto call({Object? decisions = const $CopyWithPlaceholder()}) {
    return DecideDto(
      decisions: decisions == const $CopyWithPlaceholder()
          ? _value.decisions
          // ignore: cast_nullable_to_non_nullable
          : decisions as List<ItemDecisionDto>,
    );
  }
}

extension $DecideDtoCopyWith on DecideDto {
  /// Returns a callable class that can be used as follows: `instanceOfDecideDto.copyWith(...)` or like so:`instanceOfDecideDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$DecideDtoCWProxy get copyWith => _$DecideDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DecideDto _$DecideDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('DecideDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['decisions']);
      final val = DecideDto(
        decisions: $checkedConvert(
          'decisions',
          (v) => (v as List<dynamic>)
              .map((e) => ItemDecisionDto.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$DecideDtoToJson(DecideDto instance) => <String, dynamic>{
  'decisions': instance.decisions.map((e) => e.toJson()).toList(),
};
