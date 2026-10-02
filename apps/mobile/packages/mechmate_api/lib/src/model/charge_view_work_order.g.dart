// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'charge_view_work_order.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ChargeViewWorkOrderCWProxy {
  ChargeViewWorkOrder id(String id);

  ChargeViewWorkOrder code(String code);

  ChargeViewWorkOrder status(WorkOrderStatus status);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewWorkOrder(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewWorkOrder(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewWorkOrder call({String id, String code, WorkOrderStatus status});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfChargeViewWorkOrder.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfChargeViewWorkOrder.copyWith.fieldName(...)`
class _$ChargeViewWorkOrderCWProxyImpl implements _$ChargeViewWorkOrderCWProxy {
  const _$ChargeViewWorkOrderCWProxyImpl(this._value);

  final ChargeViewWorkOrder _value;

  @override
  ChargeViewWorkOrder id(String id) => this(id: id);

  @override
  ChargeViewWorkOrder code(String code) => this(code: code);

  @override
  ChargeViewWorkOrder status(WorkOrderStatus status) => this(status: status);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ChargeViewWorkOrder(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ChargeViewWorkOrder(...).copyWith(id: 12, name: "My name")
  /// ````
  ChargeViewWorkOrder call({
    Object? id = const $CopyWithPlaceholder(),
    Object? code = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
  }) {
    return ChargeViewWorkOrder(
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
          : status as WorkOrderStatus,
    );
  }
}

extension $ChargeViewWorkOrderCopyWith on ChargeViewWorkOrder {
  /// Returns a callable class that can be used as follows: `instanceOfChargeViewWorkOrder.copyWith(...)` or like so:`instanceOfChargeViewWorkOrder.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ChargeViewWorkOrderCWProxy get copyWith =>
      _$ChargeViewWorkOrderCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeViewWorkOrder _$ChargeViewWorkOrderFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ChargeViewWorkOrder', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['id', 'code', 'status']);
      final val = ChargeViewWorkOrder(
        id: $checkedConvert('id', (v) => v as String),
        code: $checkedConvert('code', (v) => v as String),
        status: $checkedConvert(
          'status',
          (v) => $enumDecode(_$WorkOrderStatusEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$ChargeViewWorkOrderToJson(
  ChargeViewWorkOrder instance,
) => <String, dynamic>{
  'id': instance.id,
  'code': instance.code,
  'status': _$WorkOrderStatusEnumMap[instance.status]!,
};

const _$WorkOrderStatusEnumMap = {
  WorkOrderStatus.draft: 'draft',
  WorkOrderStatus.awaitingApproval: 'awaiting_approval',
  WorkOrderStatus.approved: 'approved',
  WorkOrderStatus.inProgress: 'in_progress',
  WorkOrderStatus.completed: 'completed',
  WorkOrderStatus.invoiced: 'invoiced',
  WorkOrderStatus.paid: 'paid',
  WorkOrderStatus.cancelled: 'cancelled',
};
