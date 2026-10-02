// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_view_page.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$CustomerViewPageCWProxy {
  CustomerViewPage items(List<CustomerView> items);

  CustomerViewPage nextCursor(String? nextCursor);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CustomerViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CustomerViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  CustomerViewPage call({List<CustomerView> items, String? nextCursor});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfCustomerViewPage.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfCustomerViewPage.copyWith.fieldName(...)`
class _$CustomerViewPageCWProxyImpl implements _$CustomerViewPageCWProxy {
  const _$CustomerViewPageCWProxyImpl(this._value);

  final CustomerViewPage _value;

  @override
  CustomerViewPage items(List<CustomerView> items) => this(items: items);

  @override
  CustomerViewPage nextCursor(String? nextCursor) =>
      this(nextCursor: nextCursor);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CustomerViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CustomerViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  CustomerViewPage call({
    Object? items = const $CopyWithPlaceholder(),
    Object? nextCursor = const $CopyWithPlaceholder(),
  }) {
    return CustomerViewPage(
      items: items == const $CopyWithPlaceholder()
          ? _value.items
          // ignore: cast_nullable_to_non_nullable
          : items as List<CustomerView>,
      nextCursor: nextCursor == const $CopyWithPlaceholder()
          ? _value.nextCursor
          // ignore: cast_nullable_to_non_nullable
          : nextCursor as String?,
    );
  }
}

extension $CustomerViewPageCopyWith on CustomerViewPage {
  /// Returns a callable class that can be used as follows: `instanceOfCustomerViewPage.copyWith(...)` or like so:`instanceOfCustomerViewPage.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$CustomerViewPageCWProxy get copyWith => _$CustomerViewPageCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerViewPage _$CustomerViewPageFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CustomerViewPage', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'next_cursor']);
      final val = CustomerViewPage(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map((e) => CustomerView.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        nextCursor: $checkedConvert('next_cursor', (v) => v as String?),
      );
      return val;
    }, fieldKeyMap: const {'nextCursor': 'next_cursor'});

Map<String, dynamic> _$CustomerViewPageToJson(CustomerViewPage instance) =>
    <String, dynamic>{
      'items': instance.items.map((e) => e.toJson()).toList(),
      'next_cursor': instance.nextCursor,
    };
