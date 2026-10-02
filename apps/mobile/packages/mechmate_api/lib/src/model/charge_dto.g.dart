// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'charge_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ChargeDtoCWProxy {
  ChargeDto method(ChargeDtoMethodEnum method);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeDto(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeDto call({ChargeDtoMethodEnum method});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfChargeDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfChargeDto.copyWith.fieldName(...)`
class _$ChargeDtoCWProxyImpl implements _$ChargeDtoCWProxy {
  const _$ChargeDtoCWProxyImpl(this._value);

  final ChargeDto _value;

  @override
  ChargeDto method(ChargeDtoMethodEnum method) => this(method: method);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeDto(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeDto call({Object? method = const $CopyWithPlaceholder()}) {
    return ChargeDto(
      method: method == const $CopyWithPlaceholder()
          ? _value.method
          // ignore: cast_nullable_to_non_nullable
          : method as ChargeDtoMethodEnum,
    );
  }
}

extension $ChargeDtoCopyWith on ChargeDto {
  /// Returns a callable class that can be used as follows: `instanceOfChargeDto.copyWith(...)` or like so:`instanceOfChargeDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ChargeDtoCWProxy get copyWith => _$ChargeDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeDto _$ChargeDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ChargeDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['method']);
      final val = ChargeDto(
        method: $checkedConvert(
          'method',
          (v) => $enumDecode(_$ChargeDtoMethodEnumEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$ChargeDtoToJson(ChargeDto instance) => <String, dynamic>{
  'method': _$ChargeDtoMethodEnumEnumMap[instance.method]!,
};

const _$ChargeDtoMethodEnumEnumMap = {
  ChargeDtoMethodEnum.card: 'card',
  ChargeDtoMethodEnum.cash: 'cash',
  ChargeDtoMethodEnum.transfer: 'transfer',
};
