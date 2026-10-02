// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transition_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$TransitionDtoCWProxy {
  TransitionDto to(TransitionDtoToEnum to);

  TransitionDto reason(String? reason);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `TransitionDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// TransitionDto(...).copyWith(id: 12, name: "My name")
  /// ````
  TransitionDto call({TransitionDtoToEnum to, String? reason});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfTransitionDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfTransitionDto.copyWith.fieldName(...)`
class _$TransitionDtoCWProxyImpl implements _$TransitionDtoCWProxy {
  const _$TransitionDtoCWProxyImpl(this._value);

  final TransitionDto _value;

  @override
  TransitionDto to(TransitionDtoToEnum to) => this(to: to);

  @override
  TransitionDto reason(String? reason) => this(reason: reason);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `TransitionDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// TransitionDto(...).copyWith(id: 12, name: "My name")
  /// ````
  TransitionDto call({
    Object? to = const $CopyWithPlaceholder(),
    Object? reason = const $CopyWithPlaceholder(),
  }) {
    return TransitionDto(
      to: to == const $CopyWithPlaceholder()
          ? _value.to
          // ignore: cast_nullable_to_non_nullable
          : to as TransitionDtoToEnum,
      reason: reason == const $CopyWithPlaceholder()
          ? _value.reason
          // ignore: cast_nullable_to_non_nullable
          : reason as String?,
    );
  }
}

extension $TransitionDtoCopyWith on TransitionDto {
  /// Returns a callable class that can be used as follows: `instanceOfTransitionDto.copyWith(...)` or like so:`instanceOfTransitionDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$TransitionDtoCWProxy get copyWith => _$TransitionDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TransitionDto _$TransitionDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('TransitionDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['to']);
      final val = TransitionDto(
        to: $checkedConvert(
          'to',
          (v) => $enumDecode(_$TransitionDtoToEnumEnumMap, v),
        ),
        reason: $checkedConvert('reason', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$TransitionDtoToJson(TransitionDto instance) =>
    <String, dynamic>{
      'to': _$TransitionDtoToEnumEnumMap[instance.to]!,
      'reason': ?instance.reason,
    };

const _$TransitionDtoToEnumEnumMap = {
  TransitionDtoToEnum.inProgress: 'in_progress',
  TransitionDtoToEnum.completed: 'completed',
  TransitionDtoToEnum.cancelled: 'cancelled',
};
