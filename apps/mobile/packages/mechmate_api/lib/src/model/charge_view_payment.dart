//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/payment_method.dart';
import 'package:mechmate_api/src/model/payment_status.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'charge_view_payment.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChargeViewPayment {
  /// Returns a new [ChargeViewPayment] instance.
  ChargeViewPayment({

    required  this.id,

    required  this.method,

    required  this.status,

    required  this.amountCents,

    required  this.commissionCents,

    required  this.currency,

    required  this.providerRef,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  )


  final PaymentMethod method;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final PaymentStatus status;



  @JsonKey(
    
    name: r'amount_cents',
    required: true,
    includeIfNull: false,
  )


  final String amountCents;



      /// Comisión de la plataforma. En efectivo/transferencia queda como deuda del taller.
  @JsonKey(
    
    name: r'commission_cents',
    required: true,
    includeIfNull: false,
  )


  final String commissionCents;



  @JsonKey(
    
    name: r'currency',
    required: true,
    includeIfNull: false,
  )


  final String currency;



  @JsonKey(
    
    name: r'provider_ref',
    required: true,
    includeIfNull: true,
  )


  final String? providerRef;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChargeViewPayment &&
      other.id == id &&
      other.method == method &&
      other.status == status &&
      other.amountCents == amountCents &&
      other.commissionCents == commissionCents &&
      other.currency == currency &&
      other.providerRef == providerRef;

    @override
    int get hashCode =>
        id.hashCode +
        method.hashCode +
        status.hashCode +
        amountCents.hashCode +
        commissionCents.hashCode +
        currency.hashCode +
        (providerRef == null ? 0 : providerRef.hashCode);

  factory ChargeViewPayment.fromJson(Map<String, dynamic> json) => _$ChargeViewPaymentFromJson(json);

  Map<String, dynamic> toJson() => _$ChargeViewPaymentToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

