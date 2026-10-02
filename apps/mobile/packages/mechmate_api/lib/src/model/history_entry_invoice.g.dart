// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'history_entry_invoice.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$HistoryEntryInvoiceCWProxy {
  HistoryEntryInvoice id(String id);

  HistoryEntryInvoice code(String code);

  HistoryEntryInvoice status(HistoryEntryInvoiceStatusEnum status);

  HistoryEntryInvoice ncf(String? ncf);

  HistoryEntryInvoice totalCents(String totalCents);

  HistoryEntryInvoice paidAt(String? paidAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryEntryInvoice(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryEntryInvoice(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryEntryInvoice call({
    String id,
    String code,
    HistoryEntryInvoiceStatusEnum status,
    String? ncf,
    String totalCents,
    String? paidAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfHistoryEntryInvoice.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfHistoryEntryInvoice.copyWith.fieldName(...)`
class _$HistoryEntryInvoiceCWProxyImpl implements _$HistoryEntryInvoiceCWProxy {
  const _$HistoryEntryInvoiceCWProxyImpl(this._value);

  final HistoryEntryInvoice _value;

  @override
  HistoryEntryInvoice id(String id) => this(id: id);

  @override
  HistoryEntryInvoice code(String code) => this(code: code);

  @override
  HistoryEntryInvoice status(HistoryEntryInvoiceStatusEnum status) =>
      this(status: status);

  @override
  HistoryEntryInvoice ncf(String? ncf) => this(ncf: ncf);

  @override
  HistoryEntryInvoice totalCents(String totalCents) =>
      this(totalCents: totalCents);

  @override
  HistoryEntryInvoice paidAt(String? paidAt) => this(paidAt: paidAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryEntryInvoice(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryEntryInvoice(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryEntryInvoice call({
    Object? id = const $CopyWithPlaceholder(),
    Object? code = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? ncf = const $CopyWithPlaceholder(),
    Object? totalCents = const $CopyWithPlaceholder(),
    Object? paidAt = const $CopyWithPlaceholder(),
  }) {
    return HistoryEntryInvoice(
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
          : status as HistoryEntryInvoiceStatusEnum,
      ncf: ncf == const $CopyWithPlaceholder()
          ? _value.ncf
          // ignore: cast_nullable_to_non_nullable
          : ncf as String?,
      totalCents: totalCents == const $CopyWithPlaceholder()
          ? _value.totalCents
          // ignore: cast_nullable_to_non_nullable
          : totalCents as String,
      paidAt: paidAt == const $CopyWithPlaceholder()
          ? _value.paidAt
          // ignore: cast_nullable_to_non_nullable
          : paidAt as String?,
    );
  }
}

extension $HistoryEntryInvoiceCopyWith on HistoryEntryInvoice {
  /// Returns a callable class that can be used as follows: `instanceOfHistoryEntryInvoice.copyWith(...)` or like so:`instanceOfHistoryEntryInvoice.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$HistoryEntryInvoiceCWProxy get copyWith =>
      _$HistoryEntryInvoiceCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistoryEntryInvoice _$HistoryEntryInvoiceFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'HistoryEntryInvoice',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'code',
            'status',
            'ncf',
            'total_cents',
            'paid_at',
          ],
        );
        final val = HistoryEntryInvoice(
          id: $checkedConvert('id', (v) => v as String),
          code: $checkedConvert('code', (v) => v as String),
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$HistoryEntryInvoiceStatusEnumEnumMap, v),
          ),
          ncf: $checkedConvert('ncf', (v) => v as String?),
          totalCents: $checkedConvert('total_cents', (v) => v as String),
          paidAt: $checkedConvert('paid_at', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {'totalCents': 'total_cents', 'paidAt': 'paid_at'},
    );

Map<String, dynamic> _$HistoryEntryInvoiceToJson(
  HistoryEntryInvoice instance,
) => <String, dynamic>{
  'id': instance.id,
  'code': instance.code,
  'status': _$HistoryEntryInvoiceStatusEnumEnumMap[instance.status]!,
  'ncf': instance.ncf,
  'total_cents': instance.totalCents,
  'paid_at': instance.paidAt,
};

const _$HistoryEntryInvoiceStatusEnumEnumMap = {
  HistoryEntryInvoiceStatusEnum.issued: 'issued',
  HistoryEntryInvoiceStatusEnum.paid: 'paid',
  HistoryEntryInvoiceStatusEnum.voided: 'voided',
};
