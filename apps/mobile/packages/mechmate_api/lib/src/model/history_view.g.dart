// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'history_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$HistoryViewCWProxy {
  HistoryView items(List<HistoryEntry> items);

  HistoryView nextCursor(String? nextCursor);

  HistoryView summary(HistorySummary summary);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryView(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryView call({
    List<HistoryEntry> items,
    String? nextCursor,
    HistorySummary summary,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfHistoryView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfHistoryView.copyWith.fieldName(...)`
class _$HistoryViewCWProxyImpl implements _$HistoryViewCWProxy {
  const _$HistoryViewCWProxyImpl(this._value);

  final HistoryView _value;

  @override
  HistoryView items(List<HistoryEntry> items) => this(items: items);

  @override
  HistoryView nextCursor(String? nextCursor) => this(nextCursor: nextCursor);

  @override
  HistoryView summary(HistorySummary summary) => this(summary: summary);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistoryView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistoryView(...).copyWith(id: 12, name: "My name")
  /// ````
  HistoryView call({
    Object? items = const $CopyWithPlaceholder(),
    Object? nextCursor = const $CopyWithPlaceholder(),
    Object? summary = const $CopyWithPlaceholder(),
  }) {
    return HistoryView(
      items: items == const $CopyWithPlaceholder()
          ? _value.items
          // ignore: cast_nullable_to_non_nullable
          : items as List<HistoryEntry>,
      nextCursor: nextCursor == const $CopyWithPlaceholder()
          ? _value.nextCursor
          // ignore: cast_nullable_to_non_nullable
          : nextCursor as String?,
      summary: summary == const $CopyWithPlaceholder()
          ? _value.summary
          // ignore: cast_nullable_to_non_nullable
          : summary as HistorySummary,
    );
  }
}

extension $HistoryViewCopyWith on HistoryView {
  /// Returns a callable class that can be used as follows: `instanceOfHistoryView.copyWith(...)` or like so:`instanceOfHistoryView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$HistoryViewCWProxy get copyWith => _$HistoryViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistoryView _$HistoryViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate('HistoryView', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'next_cursor', 'summary']);
      final val = HistoryView(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map((e) => HistoryEntry.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        nextCursor: $checkedConvert('next_cursor', (v) => v as String?),
        summary: $checkedConvert(
          'summary',
          (v) => HistorySummary.fromJson(v as Map<String, dynamic>),
        ),
      );
      return val;
    }, fieldKeyMap: const {'nextCursor': 'next_cursor'});

Map<String, dynamic> _$HistoryViewToJson(HistoryView instance) =>
    <String, dynamic>{
      'items': instance.items.map((e) => e.toJson()).toList(),
      'next_cursor': instance.nextCursor,
      'summary': instance.summary.toJson(),
    };
