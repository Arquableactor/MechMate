// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'charge_view_payment.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ChargeViewPaymentCWProxy {
  ChargeViewPayment id(String id);

  ChargeViewPayment method(PaymentMethod method);

  ChargeViewPayment status(PaymentStatus status);

  ChargeViewPayment amountCents(String amountCents);

  ChargeViewPayment commissionCents(String commissionCents);

  ChargeViewPayment currency(String currency);

  ChargeViewPayment providerRef(String? providerRef);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewPayment(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewPayment(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewPayment call({
    String id,
    PaymentMethod method,
    PaymentStatus status,
    String amountCents,
    String commissionCents,
    String currency,
    String? providerRef,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfChargeViewPayment.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfChargeViewPayment.copyWith.fieldName(...)`
class _$ChargeViewPaymentCWProxyImpl implements _$ChargeViewPaymentCWProxy {
  const _$ChargeViewPaymentCWProxyImpl(this._value);

  final ChargeViewPayment _value;

  @override
  ChargeViewPayment id(String id) => this(id: id);

  @override
  ChargeViewPayment method(PaymentMethod method) => this(method: method);

  @override
  ChargeViewPayment status(PaymentStatus status) => this(status: status);

  @override
  ChargeViewPayment amountCents(String amountCents) =>
      this(amountCents: amountCents);

  @override
  ChargeViewPayment commissionCents(String commissionCents) =>
      this(commissionCents: commissionCents);

  @override
  ChargeViewPayment currency(String currency) => this(currency: currency);

  @override
  ChargeViewPayment providerRef(String? providerRef) =>
      this(providerRef: providerRef);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewPayment(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewPayment(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewPayment call({
    Object? id = const $CopyWithPlaceholder(),
    Object? method = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? amountCents = const $CopyWithPlaceholder(),
    Object? commissionCents = const $CopyWithPlaceholder(),
    Object? currency = const $CopyWithPlaceholder(),
    Object? providerRef = const $CopyWithPlaceholder(),
  }) {
    return ChargeViewPayment(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      method: method == const $CopyWithPlaceholder()
          ? _value.method
          // ignore: cast_nullable_to_non_nullable
          : method as PaymentMethod,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as PaymentStatus,
      amountCents: amountCents == const $CopyWithPlaceholder()
          ? _value.amountCents
          // ignore: cast_nullable_to_non_nullable
          : amountCents as String,
      commissionCents: commissionCents == const $CopyWithPlaceholder()
          ? _value.commissionCents
          // ignore: cast_nullable_to_non_nullable
          : commissionCents as String,
      currency: currency == const $CopyWithPlaceholder()
          ? _value.currency
          // ignore: cast_nullable_to_non_nullable
          : currency as String,
      providerRef: providerRef == const $CopyWithPlaceholder()
          ? _value.providerRef
          // ignore: cast_nullable_to_non_nullable
          : providerRef as String?,
    );
  }
}

extension $ChargeViewPaymentCopyWith on ChargeViewPayment {
  /// Returns a callable class that can be used as follows: `instanceOfChargeViewPayment.copyWith(...)` or like so:`instanceOfChargeViewPayment.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ChargeViewPaymentCWProxy get copyWith =>
      _$ChargeViewPaymentCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeViewPayment _$ChargeViewPaymentFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'ChargeViewPayment',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'method',
            'status',
            'amount_cents',
            'commission_cents',
            'currency',
            'provider_ref',
          ],
        );
        final val = ChargeViewPayment(
          id: $checkedConvert('id', (v) => v as String),
          method: $checkedConvert(
            'method',
            (v) => $enumDecode(_$PaymentMethodEnumMap, v),
          ),
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$PaymentStatusEnumMap, v),
          ),
          amountCents: $checkedConvert('amount_cents', (v) => v as String),
          commissionCents: $checkedConvert(
            'commission_cents',
            (v) => v as String,
          ),
          currency: $checkedConvert('currency', (v) => v as String),
          providerRef: $checkedConvert('provider_ref', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {
        'amountCents': 'amount_cents',
        'commissionCents': 'commission_cents',
        'providerRef': 'provider_ref',
      },
    );

Map<String, dynamic> _$ChargeViewPaymentToJson(ChargeViewPayment instance) =>
    <String, dynamic>{
      'id': instance.id,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'amount_cents': instance.amountCents,
      'commission_cents': instance.commissionCents,
      'currency': instance.currency,
      'provider_ref': instance.providerRef,
    };

const _$PaymentMethodEnumMap = {
  PaymentMethod.card: 'card',
  PaymentMethod.cash: 'cash',
  PaymentMethod.transfer: 'transfer',
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.requiresAction: 'requires_action',
  PaymentStatus.captured: 'captured',
  PaymentStatus.failed: 'failed',
  PaymentStatus.refunded: 'refunded',
};
