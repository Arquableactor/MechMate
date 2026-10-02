//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'history_summary.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class HistorySummary {
  /// Returns a new [HistorySummary] instance.
  HistorySummary({

    required  this.visits,

    required  this.openWorkOrders,

    required  this.totalSpentCents,

    required  this.currency,

    required  this.lastVisitAt,
  });

      /// OT no canceladas.
  @JsonKey(
    
    name: r'visits',
    required: true,
    includeIfNull: false,
  )


  final int visits;



      /// OT en curso (ni completadas ni canceladas).
  @JsonKey(
    
    name: r'open_work_orders',
    required: true,
    includeIfNull: false,
  )


  final int openWorkOrders;



      /// Suma de las facturas PAGADAS.
  @JsonKey(
    
    name: r'total_spent_cents',
    required: true,
    includeIfNull: false,
  )


  final String totalSpentCents;



  @JsonKey(
    
    name: r'currency',
    required: true,
    includeIfNull: false,
  )


  final String currency;



      /// Fecha de entrada de la última OT no cancelada.
  @JsonKey(
    
    name: r'last_visit_at',
    required: true,
    includeIfNull: true,
  )


  final String? lastVisitAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is HistorySummary &&
      other.visits == visits &&
      other.openWorkOrders == openWorkOrders &&
      other.totalSpentCents == totalSpentCents &&
      other.currency == currency &&
      other.lastVisitAt == lastVisitAt;

    @override
    int get hashCode =>
        visits.hashCode +
        openWorkOrders.hashCode +
        totalSpentCents.hashCode +
        currency.hashCode +
        (lastVisitAt == null ? 0 : lastVisitAt.hashCode);

  factory HistorySummary.fromJson(Map<String, dynamic> json) => _$HistorySummaryFromJson(json);

  Map<String, dynamic> toJson() => _$HistorySummaryToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

