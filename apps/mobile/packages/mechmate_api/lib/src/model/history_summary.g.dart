// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'history_summary.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$HistorySummaryCWProxy {
  HistorySummary visits(int visits);

  HistorySummary openWorkOrders(int openWorkOrders);

  HistorySummary totalSpentCents(String totalSpentCents);

  HistorySummary currency(String currency);

  HistorySummary lastVisitAt(String? lastVisitAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistorySummary(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistorySummary(...).copyWith(id: 12, name: "My name")
  /// ````
  HistorySummary call({
    int visits,
    int openWorkOrders,
    String totalSpentCents,
    String currency,
    String? lastVisitAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfHistorySummary.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfHistorySummary.copyWith.fieldName(...)`
class _$HistorySummaryCWProxyImpl implements _$HistorySummaryCWProxy {
  const _$HistorySummaryCWProxyImpl(this._value);

  final HistorySummary _value;

  @override
  HistorySummary visits(int visits) => this(visits: visits);

  @override
  HistorySummary openWorkOrders(int openWorkOrders) =>
      this(openWorkOrders: openWorkOrders);

  @override
  HistorySummary totalSpentCents(String totalSpentCents) =>
      this(totalSpentCents: totalSpentCents);

  @override
  HistorySummary currency(String currency) => this(currency: currency);

  @override
  HistorySummary lastVisitAt(String? lastVisitAt) =>
      this(lastVisitAt: lastVisitAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HistorySummary(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HistorySummary(...).copyWith(id: 12, name: "My name")
  /// ````
  HistorySummary call({
    Object? visits = const $CopyWithPlaceholder(),
    Object? openWorkOrders = const $CopyWithPlaceholder(),
    Object? totalSpentCents = const $CopyWithPlaceholder(),
    Object? currency = const $CopyWithPlaceholder(),
    Object? lastVisitAt = const $CopyWithPlaceholder(),
  }) {
    return HistorySummary(
      visits: visits == const $CopyWithPlaceholder()
          ? _value.visits
          // ignore: cast_nullable_to_non_nullable
          : visits as int,
      openWorkOrders: openWorkOrders == const $CopyWithPlaceholder()
          ? _value.openWorkOrders
          // ignore: cast_nullable_to_non_nullable
          : openWorkOrders as int,
      totalSpentCents: totalSpentCents == const $CopyWithPlaceholder()
          ? _value.totalSpentCents
          // ignore: cast_nullable_to_non_nullable
          : totalSpentCents as String,
      currency: currency == const $CopyWithPlaceholder()
          ? _value.currency
          // ignore: cast_nullable_to_non_nullable
          : currency as String,
      lastVisitAt: lastVisitAt == const $CopyWithPlaceholder()
          ? _value.lastVisitAt
          // ignore: cast_nullable_to_non_nullable
          : lastVisitAt as String?,
    );
  }
}

extension $HistorySummaryCopyWith on HistorySummary {
  /// Returns a callable class that can be used as follows: `instanceOfHistorySummary.copyWith(...)` or like so:`instanceOfHistorySummary.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$HistorySummaryCWProxy get copyWith => _$HistorySummaryCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistorySummary _$HistorySummaryFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'HistorySummary',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'visits',
            'open_work_orders',
            'total_spent_cents',
            'currency',
            'last_visit_at',
          ],
        );
        final val = HistorySummary(
          visits: $checkedConvert('visits', (v) => (v as num).toInt()),
          openWorkOrders: $checkedConvert(
            'open_work_orders',
            (v) => (v as num).toInt(),
          ),
          totalSpentCents: $checkedConvert(
            'total_spent_cents',
            (v) => v as String,
          ),
          currency: $checkedConvert('currency', (v) => v as String),
          lastVisitAt: $checkedConvert('last_visit_at', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {
        'openWorkOrders': 'open_work_orders',
        'totalSpentCents': 'total_spent_cents',
        'lastVisitAt': 'last_visit_at',
      },
    );

Map<String, dynamic> _$HistorySummaryToJson(HistorySummary instance) =>
    <String, dynamic>{
      'visits': instance.visits,
      'open_work_orders': instance.openWorkOrders,
      'total_spent_cents': instance.totalSpentCents,
      'currency': instance.currency,
      'last_visit_at': instance.lastVisitAt,
    };
