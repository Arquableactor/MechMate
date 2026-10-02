// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice_view_page.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InvoiceViewPageCWProxy {
  InvoiceViewPage items(List<InvoiceView> items);

  InvoiceViewPage nextCursor(String? nextCursor);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InvoiceViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InvoiceViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  InvoiceViewPage call({List<InvoiceView> items, String? nextCursor});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInvoiceViewPage.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInvoiceViewPage.copyWith.fieldName(...)`
class _$InvoiceViewPageCWProxyImpl implements _$InvoiceViewPageCWProxy {
  const _$InvoiceViewPageCWProxyImpl(this._value);

  final InvoiceViewPage _value;

  @override
  InvoiceViewPage items(List<InvoiceView> items) => this(items: items);

  @override
  InvoiceViewPage nextCursor(String? nextCursor) =>
      this(nextCursor: nextCursor);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InvoiceViewPage(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InvoiceViewPage(...).copyWith(id: 12, name: "My name")
  /// ````
  InvoiceViewPage call({
    Object? items = const $CopyWithPlaceholder(),
    Object? nextCursor = const $CopyWithPlaceholder(),
  }) {
    return InvoiceViewPage(
      items: items == const $CopyWithPlaceholder()
          ? _value.items
          // ignore: cast_nullable_to_non_nullable
          : items as List<InvoiceView>,
      nextCursor: nextCursor == const $CopyWithPlaceholder()
          ? _value.nextCursor
          // ignore: cast_nullable_to_non_nullable
          : nextCursor as String?,
    );
  }
}

extension $InvoiceViewPageCopyWith on InvoiceViewPage {
  /// Returns a callable class that can be used as follows: `instanceOfInvoiceViewPage.copyWith(...)` or like so:`instanceOfInvoiceViewPage.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InvoiceViewPageCWProxy get copyWith => _$InvoiceViewPageCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InvoiceViewPage _$InvoiceViewPageFromJson(Map<String, dynamic> json) =>
    $checkedCreate('InvoiceViewPage', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'next_cursor']);
      final val = InvoiceViewPage(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map((e) => InvoiceView.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        nextCursor: $checkedConvert('next_cursor', (v) => v as String?),
      );
      return val;
    }, fieldKeyMap: const {'nextCursor': 'next_cursor'});

Map<String, dynamic> _$InvoiceViewPageToJson(InvoiceViewPage instance) =>
    <String, dynamic>{
      'items': instance.items.map((e) => e.toJson()).toList(),
      'next_cursor': instance.nextCursor,
    };
