// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'charge_view_invoice.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ChargeViewInvoiceCWProxy {
  ChargeViewInvoice id(String id);

  ChargeViewInvoice code(String code);

  ChargeViewInvoice status(ChargeViewInvoiceStatusEnum status);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewInvoice(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewInvoice(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewInvoice call({
    String id,
    String code,
    ChargeViewInvoiceStatusEnum status,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfChargeViewInvoice.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfChargeViewInvoice.copyWith.fieldName(...)`
class _$ChargeViewInvoiceCWProxyImpl implements _$ChargeViewInvoiceCWProxy {
  const _$ChargeViewInvoiceCWProxyImpl(this._value);

  final ChargeViewInvoice _value;

  @override
  ChargeViewInvoice id(String id) => this(id: id);

  @override
  ChargeViewInvoice code(String code) => this(code: code);

  @override
  ChargeViewInvoice status(ChargeViewInvoiceStatusEnum status) =>
      this(status: status);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewInvoice(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewInvoice(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewInvoice call({
    Object? id = const $CopyWithPlaceholder(),
    Object? code = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
  }) {
    return ChargeViewInvoice(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      code: code == const $CopyWithPlaceholder()
          ? _value.code
          // ignore: cast_nullable_to_non_nullable
          : code as String,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as ChargeViewInvoiceStatusEnum,
    );
  }
}

extension $ChargeViewInvoiceCopyWith on ChargeViewInvoice {
  /// Returns a callable class that can be used as follows: `instanceOfChargeViewInvoice.copyWith(...)` or like so:`instanceOfChargeViewInvoice.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ChargeViewInvoiceCWProxy get copyWith =>
      _$ChargeViewInvoiceCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeViewInvoice _$ChargeViewInvoiceFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ChargeViewInvoice', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['id', 'code', 'status']);
      final val = ChargeViewInvoice(
        id: $checkedConvert('id', (v) => v as String),
        code: $checkedConvert('code', (v) => v as String),
        status: $checkedConvert(
          'status',
          (v) => $enumDecode(_$ChargeViewInvoiceStatusEnumEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$ChargeViewInvoiceToJson(ChargeViewInvoice instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'status': _$ChargeViewInvoiceStatusEnumEnumMap[instance.status]!,
    };

const _$ChargeViewInvoiceStatusEnumEnumMap = {
  ChargeViewInvoiceStatusEnum.issued: 'issued',
  ChargeViewInvoiceStatusEnum.paid: 'paid',
  ChargeViewInvoiceStatusEnum.voided: 'voided',
};
