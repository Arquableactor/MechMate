// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'history_entry.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$HistoryEntryCWProxy {
  HistoryEntry workOrder(WorkOrderView workOrder);

  HistoryEntry invoice(HistoryEntryInvoice? invoice);

  HistoryEntry payment(HistoryEntryPayment? payment);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryEntry(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryEntry(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryEntry call({
    WorkOrderView workOrder,
    HistoryEntryInvoice? invoice,
    HistoryEntryPayment? payment,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfHistoryEntry.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfHistoryEntry.copyWith.fieldName(...)`
class _$HistoryEntryCWProxyImpl implements _$HistoryEntryCWProxy {
  const _$HistoryEntryCWProxyImpl(this._value);

  final HistoryEntry _value;

  @override
  HistoryEntry workOrder(WorkOrderView workOrder) => this(workOrder: workOrder);

  @override
  HistoryEntry invoice(HistoryEntryInvoice? invoice) => this(invoice: invoice);

  @override
  HistoryEntry payment(HistoryEntryPayment? payment) => this(payment: payment);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryEntry(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryEntry(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryEntry call({
    Object? workOrder = const $CopyWithPlaceholder(),
    Object? invoice = const $CopyWithPlaceholder(),
    Object? payment = const $CopyWithPlaceholder(),
  }) {
    return HistoryEntry(
      workOrder: workOrder == const $CopyWithPlaceholder()
          ? _value.workOrder
          // ignore: cast_nullable_to_non_nullable
          : workOrder as WorkOrderView,
      invoice: invoice == const $CopyWithPlaceholder()
          ? _value.invoice
          // ignore: cast_nullable_to_non_nullable
          : invoice as HistoryEntryInvoice?,
      payment: payment == const $CopyWithPlaceholder()
          ? _value.payment
          // ignore: cast_nullable_to_non_nullable
          : payment as HistoryEntryPayment?,
    );
  }
}

extension $HistoryEntryCopyWith on HistoryEntry {
  /// Returns a callable class that can be used as follows: `instanceOfHistoryEntry.copyWith(...)` or like so:`instanceOfHistoryEntry.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$HistoryEntryCWProxy get copyWith => _$HistoryEntryCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistoryEntry _$HistoryEntryFromJson(Map<String, dynamic> json) =>
    $checkedCreate('HistoryEntry', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const ['work_order', 'invoice', 'payment'],
      );
      final val = HistoryEntry(
        workOrder: $checkedConvert(
          'work_order',
          (v) => WorkOrderView.fromJson(v as Map<String, dynamic>),
        ),
        invoice: $checkedConvert(
          'invoice',
          (v) => v == null
              ? null
              : HistoryEntryInvoice.fromJson(v as Map<String, dynamic>),
        ),
        payment: $checkedConvert(
          'payment',
          (v) => v == null
              ? null
              : HistoryEntryPayment.fromJson(v as Map<String, dynamic>),
        ),
      );
      return val;
    }, fieldKeyMap: const {'workOrder': 'work_order'});

Map<String, dynamic> _$HistoryEntryToJson(HistoryEntry instance) =>
    <String, dynamic>{
      'work_order': instance.workOrder.toJson(),
      'invoice': instance.invoice?.toJson(),
      'payment': instance.payment?.toJson(),
    };
