// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'charge_view_payout.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ChargeViewPayoutCWProxy {
  ChargeViewPayout id(String id);

  ChargeViewPayout amountCents(String amountCents);

  ChargeViewPayout scheduledFor(String scheduledFor);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewPayout(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewPayout(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewPayout call({String id, String amountCents, String scheduledFor});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfChargeViewPayout.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfChargeViewPayout.copyWith.fieldName(...)`
class _$ChargeViewPayoutCWProxyImpl implements _$ChargeViewPayoutCWProxy {
  const _$ChargeViewPayoutCWProxyImpl(this._value);

  final ChargeViewPayout _value;

  @override
  ChargeViewPayout id(String id) => this(id: id);

  @override
  ChargeViewPayout amountCents(String amountCents) =>
      this(amountCents: amountCents);

  @override
  ChargeViewPayout scheduledFor(String scheduledFor) =>
      this(scheduledFor: scheduledFor);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewPayout(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewPayout(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewPayout call({
    Object? id = const $CopyWithPlaceholder(),
    Object? amountCents = const $CopyWithPlaceholder(),
    Object? scheduledFor = const $CopyWithPlaceholder(),
  }) {
    return ChargeViewPayout(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      amountCents: amountCents == const $CopyWithPlaceholder()
          ? _value.amountCents
          // ignore: cast_nullable_to_non_nullable
          : amountCents as String,
      scheduledFor: scheduledFor == const $CopyWithPlaceholder()
          ? _value.scheduledFor
          // ignore: cast_nullable_to_non_nullable
          : scheduledFor as String,
    );
  }
}

extension $ChargeViewPayoutCopyWith on ChargeViewPayout {
  /// Returns a callable class that can be used as follows: `instanceOfChargeViewPayout.copyWith(...)` or like so:`instanceOfChargeViewPayout.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ChargeViewPayoutCWProxy get copyWith => _$ChargeViewPayoutCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeViewPayout _$ChargeViewPayoutFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'ChargeViewPayout',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const ['id', 'amount_cents', 'scheduled_for'],
        );
        final val = ChargeViewPayout(
          id: $checkedConvert('id', (v) => v as String),
          amountCents: $checkedConvert('amount_cents', (v) => v as String),
          scheduledFor: $checkedConvert('scheduled_for', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'amountCents': 'amount_cents',
        'scheduledFor': 'scheduled_for',
      },
    );

Map<String, dynamic> _$ChargeViewPayoutToJson(ChargeViewPayout instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amount_cents': instance.amountCents,
      'scheduled_for': instance.scheduledFor,
    };
