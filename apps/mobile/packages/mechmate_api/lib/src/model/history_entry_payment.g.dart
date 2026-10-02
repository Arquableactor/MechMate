// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'history_entry_payment.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$HistoryEntryPaymentCWProxy {
  HistoryEntryPayment method(PaymentMethod method);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryEntryPayment(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryEntryPayment(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryEntryPayment call({PaymentMethod method});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfHistoryEntryPayment.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfHistoryEntryPayment.copyWith.fieldName(...)`
class _$HistoryEntryPaymentCWProxyImpl implements _$HistoryEntryPaymentCWProxy {
  const _$HistoryEntryPaymentCWProxyImpl(this._value);

  final HistoryEntryPayment _value;

  @override
  HistoryEntryPayment method(PaymentMethod method) => this(method: method);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryEntryPayment(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryEntryPayment(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryEntryPayment call({Object? method = const $CopyWithPlaceholder()}) {
    return HistoryEntryPayment(
      method: method == const $CopyWithPlaceholder()
          ? _value.method
          // ignore: cast_nullable_to_non_nullable
          : method as PaymentMethod,
    );
  }
}

extension $HistoryEntryPaymentCopyWith on HistoryEntryPayment {
  /// Returns a callable class that can be used as follows: `instanceOfHistoryEntryPayment.copyWith(...)` or like so:`instanceOfHistoryEntryPayment.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$HistoryEntryPaymentCWProxy get copyWith =>
      _$HistoryEntryPaymentCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistoryEntryPayment _$HistoryEntryPaymentFromJson(Map<String, dynamic> json) =>
    $checkedCreate('HistoryEntryPayment', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['method']);
      final val = HistoryEntryPayment(
        method: $checkedConvert(
          'method',
          (v) => $enumDecode(_$PaymentMethodEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$HistoryEntryPaymentToJson(
  HistoryEntryPayment instance,
) => <String, dynamic>{'method': _$PaymentMethodEnumMap[instance.method]!};

const _$PaymentMethodEnumMap = {
  PaymentMethod.card: 'card',
  PaymentMethod.cash: 'cash',
  PaymentMethod.transfer: 'transfer',
};
