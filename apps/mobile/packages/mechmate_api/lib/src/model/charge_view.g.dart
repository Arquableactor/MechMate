// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'charge_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ChargeViewCWProxy {
  ChargeView payment(ChargeViewPayment payment);

  ChargeView invoice(ChargeViewInvoice invoice);

  ChargeView workOrder(ChargeViewWorkOrder workOrder);

  ChargeView payout(ChargeViewPayout? payout);

  ChargeView replayed(bool replayed);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeView(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeView call({
    ChargeViewPayment payment,
    ChargeViewInvoice invoice,
    ChargeViewWorkOrder workOrder,
    ChargeViewPayout? payout,
    bool replayed,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfChargeView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfChargeView.copyWith.fieldName(...)`
class _$ChargeViewCWProxyImpl implements _$ChargeViewCWProxy {
  const _$ChargeViewCWProxyImpl(this._value);

  final ChargeView _value;

  @override
  ChargeView payment(ChargeViewPayment payment) => this(payment: payment);

  @override
  ChargeView invoice(ChargeViewInvoice invoice) => this(invoice: invoice);

  @override
  ChargeView workOrder(ChargeViewWorkOrder workOrder) =>
      this(workOrder: workOrder);

  @override
  ChargeView payout(ChargeViewPayout? payout) => this(payout: payout);

  @override
  ChargeView replayed(bool replayed) => this(replayed: replayed);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeView(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeView call({
    Object? payment = const $CopyWithPlaceholder(),
    Object? invoice = const $CopyWithPlaceholder(),
    Object? workOrder = const $CopyWithPlaceholder(),
    Object? payout = const $CopyWithPlaceholder(),
    Object? replayed = const $CopyWithPlaceholder(),
  }) {
    return ChargeView(
      payment: payment == const $CopyWithPlaceholder()
          ? _value.payment
          // ignore: cast_nullable_to_non_nullable
          : payment as ChargeViewPayment,
      invoice: invoice == const $CopyWithPlaceholder()
          ? _value.invoice
          // ignore: cast_nullable_to_non_nullable
          : invoice as ChargeViewInvoice,
      workOrder: workOrder == const $CopyWithPlaceholder()
          ? _value.workOrder
          // ignore: cast_nullable_to_non_nullable
          : workOrder as ChargeViewWorkOrder,
      payout: payout == const $CopyWithPlaceholder()
          ? _value.payout
          // ignore: cast_nullable_to_non_nullable
          : payout as ChargeViewPayout?,
      replayed: replayed == const $CopyWithPlaceholder()
          ? _value.replayed
          // ignore: cast_nullable_to_non_nullable
          : replayed as bool,
    );
  }
}

extension $ChargeViewCopyWith on ChargeView {
  /// Returns a callable class that can be used as follows: `instanceOfChargeView.copyWith(...)` or like so:`instanceOfChargeView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ChargeViewCWProxy get copyWith => _$ChargeViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeView _$ChargeViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ChargeView', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const [
          'payment',
          'invoice',
          'work_order',
          'payout',
          'replayed',
        ],
      );
      final val = ChargeView(
        payment: $checkedConvert(
          'payment',
          (v) => ChargeViewPayment.fromJson(v as Map<String, dynamic>),
        ),
        invoice: $checkedConvert(
          'invoice',
          (v) => ChargeViewInvoice.fromJson(v as Map<String, dynamic>),
        ),
        workOrder: $checkedConvert(
          'work_order',
          (v) => ChargeViewWorkOrder.fromJson(v as Map<String, dynamic>),
        ),
        payout: $checkedConvert(
          'payout',
          (v) => v == null
              ? null
              : ChargeViewPayout.fromJson(v as Map<String, dynamic>),
        ),
        replayed: $checkedConvert('replayed', (v) => v as bool),
      );
      return val;
    }, fieldKeyMap: const {'workOrder': 'work_order'});

Map<String, dynamic> _$ChargeViewToJson(ChargeView instance) =>
    <String, dynamic>{
      'payment': instance.payment.toJson(),
      'invoice': instance.invoice.toJson(),
      'work_order': instance.workOrder.toJson(),
      'payout': instance.payout?.toJson(),
      'replayed': instance.replayed,
    };
