// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'work_order_view_page.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$WorkOrderViewPageCWProxy {
  WorkOrderViewPage items(List<WorkOrderView> items);

  WorkOrderViewPage nextCursor(String? nextCursor);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `WorkOrderViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// WorkOrderViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  WorkOrderViewPage call({List<WorkOrderView> items, String? nextCursor});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfWorkOrderViewPage.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfWorkOrderViewPage.copyWith.fieldName(...)`
class _$WorkOrderViewPageCWProxyImpl implements _$WorkOrderViewPageCWProxy {
  const _$WorkOrderViewPageCWProxyImpl(this._value);

  final WorkOrderViewPage _value;

  @override
  WorkOrderViewPage items(List<WorkOrderView> items) => this(items: items);

  @override
  WorkOrderViewPage nextCursor(String? nextCursor) =>
      this(nextCursor: nextCursor);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `WorkOrderViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// WorkOrderViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  WorkOrderViewPage call({
    Object? items = const $CopyWithPlaceholder(),
    Object? nextCursor = const $CopyWithPlaceholder(),
  }) {
    return WorkOrderViewPage(
      items: items == const $CopyWithPlaceholder()
          ? _value.items
          // ignore: cast_nullable_to_non_nullable
          : items as List<WorkOrderView>,
      nextCursor: nextCursor == const $CopyWithPlaceholder()
          ? _value.nextCursor
          // ignore: cast_nullable_to_non_nullable
          : nextCursor as String?,
    );
  }
}

extension $WorkOrderViewPageCopyWith on WorkOrderViewPage {
  /// Returns a callable class that can be used as follows: `instanceOfWorkOrderViewPage.copyWith(...)` or like so:`instanceOfWorkOrderViewPage.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$WorkOrderViewPageCWProxy get copyWith =>
      _$WorkOrderViewPageCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkOrderViewPage _$WorkOrderViewPageFromJson(Map<String, dynamic> json) =>
    $checkedCreate('WorkOrderViewPage', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'next_cursor']);
      final val = WorkOrderViewPage(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map((e) => WorkOrderView.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        nextCursor: $checkedConvert('next_cursor', (v) => v as String?),
      );
      return val;
    }, fieldKeyMap: const {'nextCursor': 'next_cursor'});

Map<String, dynamic> _$WorkOrderViewPageToJson(WorkOrderViewPage instance) =>
    <String, dynamic>{
      'items': instance.items.map((e) => e.toJson()).toList(),
      'next_cursor': instance.nextCursor,
    };
