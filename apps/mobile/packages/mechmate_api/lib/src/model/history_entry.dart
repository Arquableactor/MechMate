//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/history_entry_invoice.dart';
import 'package:mechmate_api/src/model/work_order_view.dart';
import 'package:mechmate_api/src/model/history_entry_payment.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'history_entry.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class HistoryEntry {
  /// Returns a new [HistoryEntry] instance.
  HistoryEntry({

    required  this.workOrder,

    required  this.invoice,

    required  this.payment,
  });

  @JsonKey(
    
    name: r'work_order',
    required: true,
    includeIfNull: false,
  )


  final WorkOrderView workOrder;



  @JsonKey(
    
    name: r'invoice',
    required: true,
    includeIfNull: true,
  )


  final HistoryEntryInvoice? invoice;



  @JsonKey(
    
    name: r'payment',
    required: true,
    includeIfNull: true,
  )


  final HistoryEntryPayment? payment;





    @override
    bool operator ==(Object other) => identical(this, other) || other is HistoryEntry &&
      other.workOrder == workOrder &&
      other.invoice == invoice &&
      other.payment == payment;

    @override
    int get hashCode =>
        workOrder.hashCode +
        (invoice == null ? 0 : invoice.hashCode) +
        (payment == null ? 0 : payment.hashCode);

  factory HistoryEntry.fromJson(Map<String, dynamic> json) => _$HistoryEntryFromJson(json);

  Map<String, dynamic> toJson() => _$HistoryEntryToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

