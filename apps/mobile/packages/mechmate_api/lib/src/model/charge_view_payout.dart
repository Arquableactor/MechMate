//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'charge_view_payout.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChargeViewPayout {
  /// Returns a new [ChargeViewPayout] instance.
  ChargeViewPayout({

    required  this.id,

    required  this.amountCents,

    required  this.scheduledFor,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'amount_cents',
    required: true,
    includeIfNull: false,
  )


  final String amountCents;



  @JsonKey(
    
    name: r'scheduled_for',
    required: true,
    includeIfNull: false,
  )


  final String scheduledFor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChargeViewPayout &&
      other.id == id &&
      other.amountCents == amountCents &&
      other.scheduledFor == scheduledFor;

    @override
    int get hashCode =>
        id.hashCode +
        amountCents.hashCode +
        scheduledFor.hashCode;

  factory ChargeViewPayout.fromJson(Map<String, dynamic> json) => _$ChargeViewPayoutFromJson(json);

  Map<String, dynamic> toJson() => _$ChargeViewPayoutToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

