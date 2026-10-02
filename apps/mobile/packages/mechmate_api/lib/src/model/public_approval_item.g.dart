// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_approval_item.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$PublicApprovalItemCWProxy {
  PublicApprovalItem id(String id);

  PublicApprovalItem type(WorkOrderItemType type);

  PublicApprovalItem description(String description);

  PublicApprovalItem quantity(String quantity);

  PublicApprovalItem totalCents(String totalCents);

  PublicApprovalItem approvalStatus(ItemApprovalStatus approvalStatus);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PublicApprovalItem(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PublicApprovalItem(...).copyWith(id: 12, name: "My name")
  /// ````
  PublicApprovalItem call({
    String id,
    WorkOrderItemType type,
    String description,
    String quantity,
    String totalCents,
    ItemApprovalStatus approvalStatus,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfPublicApprovalItem.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfPublicApprovalItem.copyWith.fieldName(...)`
class _$PublicApprovalItemCWProxyImpl implements _$PublicApprovalItemCWProxy {
  const _$PublicApprovalItemCWProxyImpl(this._value);

  final PublicApprovalItem _value;

  @override
  PublicApprovalItem id(String id) => this(id: id);

  @override
  PublicApprovalItem type(WorkOrderItemType type) => this(type: type);

  @override
  PublicApprovalItem description(String description) =>
      this(description: description);

  @override
  PublicApprovalItem quantity(String quantity) => this(quantity: quantity);

  @override
  PublicApprovalItem totalCents(String totalCents) =>
      this(totalCents: totalCents);

  @override
  PublicApprovalItem approvalStatus(ItemApprovalStatus approvalStatus) =>
      this(approvalStatus: approvalStatus);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PublicApprovalItem(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PublicApprovalItem(...).copyWith(id: 12, name: "My name")
  /// ````
  PublicApprovalItem call({
    Object? id = const $CopyWithPlaceholder(),
    Object? type = const $CopyWithPlaceholder(),
    Object? description = const $CopyWithPlaceholder(),
    Object? quantity = const $CopyWithPlaceholder(),
    Object? totalCents = const $CopyWithPlaceholder(),
    Object? approvalStatus = const $CopyWithPlaceholder(),
  }) {
    return PublicApprovalItem(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      type: type == const $CopyWithPlaceholder()
          ? _value.type
          // ignore: cast_nullable_to_non_nullable
          : type as WorkOrderItemType,
      description: description == const $CopyWithPlaceholder()
          ? _value.description
          // ignore: cast_nullable_to_non_nullable
          : description as String,
      quantity: quantity == const $CopyWithPlaceholder()
          ? _value.quantity
          // ignore: cast_nullable_to_non_nullable
          : quantity as String,
      totalCents: totalCents == const $CopyWithPlaceholder()
          ? _value.totalCents
          // ignore: cast_nullable_to_non_nullable
          : totalCents as String,
      approvalStatus: approvalStatus == const $CopyWithPlaceholder()
          ? _value.approvalStatus
          // ignore: cast_nullable_to_non_nullable
          : approvalStatus as ItemApprovalStatus,
    );
  }
}

extension $PublicApprovalItemCopyWith on PublicApprovalItem {
  /// Returns a callable class that can be used as follows: `instanceOfPublicApprovalItem.copyWith(...)` or like so:`instanceOfPublicApprovalItem.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$PublicApprovalItemCWProxy get copyWith =>
      _$PublicApprovalItemCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicApprovalItem _$PublicApprovalItemFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'PublicApprovalItem',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'type',
            'description',
            'quantity',
            'total_cents',
            'approval_status',
          ],
        );
        final val = PublicApprovalItem(
          id: $checkedConvert('id', (v) => v as String),
          type: $checkedConvert(
            'type',
            (v) => $enumDecode(_$WorkOrderItemTypeEnumMap, v),
          ),
          description: $checkedConvert('description', (v) => v as String),
          quantity: $checkedConvert('quantity', (v) => v as String),
          totalCents: $checkedConvert('total_cents', (v) => v as String),
          approvalStatus: $checkedConvert(
            'approval_status',
            (v) => $enumDecode(_$ItemApprovalStatusEnumMap, v),
          ),
        );
        return val;
      },
      fieldKeyMap: const {
        'totalCents': 'total_cents',
        'approvalStatus': 'approval_status',
      },
    );

Map<String, dynamic> _$PublicApprovalItemToJson(PublicApprovalItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$WorkOrderItemTypeEnumMap[instance.type]!,
      'description': instance.description,
      'quantity': instance.quantity,
      'total_cents': instance.totalCents,
      'approval_status': _$ItemApprovalStatusEnumMap[instance.approvalStatus]!,
    };

const _$WorkOrderItemTypeEnumMap = {
  WorkOrderItemType.labor: 'labor',
  WorkOrderItemType.part_: 'part',
};

const _$ItemApprovalStatusEnumMap = {
  ItemApprovalStatus.approved: 'approved',
  ItemApprovalStatus.proposed: 'proposed',
  ItemApprovalStatus.declined: 'declined',
};
