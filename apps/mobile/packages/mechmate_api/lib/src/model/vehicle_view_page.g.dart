// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_view_page.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$VehicleViewPageCWProxy {
  VehicleViewPage items(List<VehicleView> items);

  VehicleViewPage nextCursor(String? nextCursor);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `VehicleViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// VehicleViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  VehicleViewPage call({List<VehicleView> items, String? nextCursor});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfVehicleViewPage.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfVehicleViewPage.copyWith.fieldName(...)`
class _$VehicleViewPageCWProxyImpl implements _$VehicleViewPageCWProxy {
  const _$VehicleViewPageCWProxyImpl(this._value);

  final VehicleViewPage _value;

  @override
  VehicleViewPage items(List<VehicleView> items) => this(items: items);

  @override
  VehicleViewPage nextCursor(String? nextCursor) =>
      this(nextCursor: nextCursor);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `VehicleViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// VehicleViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  VehicleViewPage call({
    Object? items = const $CopyWithPlaceholder(),
    Object? nextCursor = const $CopyWithPlaceholder(),
  }) {
    return VehicleViewPage(
      items: items == const $CopyWithPlaceholder()
          ? _value.items
          // ignore: cast_nullable_to_non_nullable
          : items as List<VehicleView>,
      nextCursor: nextCursor == const $CopyWithPlaceholder()
          ? _value.nextCursor
          // ignore: cast_nullable_to_non_nullable
          : nextCursor as String?,
    );
  }
}

extension $VehicleViewPageCopyWith on VehicleViewPage {
  /// Returns a callable class that can be used as follows: `instanceOfVehicleViewPage.copyWith(...)` or like so:`instanceOfVehicleViewPage.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$VehicleViewPageCWProxy get copyWith => _$VehicleViewPageCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VehicleViewPage _$VehicleViewPageFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VehicleViewPage', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'next_cursor']);
      final val = VehicleViewPage(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map((e) => VehicleView.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        nextCursor: $checkedConvert('next_cursor', (v) => v as String?),
      );
      return val;
    }, fieldKeyMap: const {'nextCursor': 'next_cursor'});

Map<String, dynamic> _$VehicleViewPageToJson(VehicleViewPage instance) =>
    <String, dynamic>{
      'items': instance.items.map((e) => e.toJson()).toList(),
      'next_cursor': instance.nextCursor,
    };
