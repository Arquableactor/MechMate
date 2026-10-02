//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/charge_view_invoice.dart';
import 'package:mechmate_api/src/model/charge_view_payout.dart';
import 'package:mechmate_api/src/model/charge_view_work_order.dart';
import 'package:mechmate_api/src/model/charge_view_payment.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'charge_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChargeView {
  /// Returns a new [ChargeView] instance.
  ChargeView({

    required  this.payment,

    required  this.invoice,

    required  this.workOrder,

    required  this.payout,

    required  this.replayed,
  });

  @JsonKey(
    
    name: r'payment',
    required: true,
    includeIfNull: false,
  )


  final ChargeViewPayment payment;



  @JsonKey(
    
    name: r'invoice',
    required: true,
    includeIfNull: false,
  )


  final ChargeViewInvoice invoice;



  @JsonKey(
    
    name: r'work_order',
    required: true,
    includeIfNull: false,
  )


  final ChargeViewWorkOrder workOrder;



  @JsonKey(
    
    name: r'payout',
    required: true,
    includeIfNull: true,
  )


  final ChargeViewPayout? payout;



      /// true = respuesta repetida por la misma Idempotency-Key (no se cobró otra vez).
  @JsonKey(
    
    name: r'replayed',
    required: true,
    includeIfNull: false,
  )


  final bool replayed;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChargeView &&
      other.payment == payment &&
      other.invoice == invoice &&
      other.workOrder == workOrder &&
      other.payout == payout &&
      other.replayed == replayed;

    @override
    int get hashCode =>
        payment.hashCode +
        invoice.hashCode +
        workOrder.hashCode +
        (payout == null ? 0 : payout.hashCode) +
        replayed.hashCode;

  factory ChargeView.fromJson(Map<String, dynamic> json) => _$ChargeViewFromJson(json);

  Map<String, dynamic> toJson() => _$ChargeViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

