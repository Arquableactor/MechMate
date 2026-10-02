//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'charge_view_invoice.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChargeViewInvoice {
  /// Returns a new [ChargeViewInvoice] instance.
  ChargeViewInvoice({

    required  this.id,

    required  this.code,

    required  this.status,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final ChargeViewInvoiceStatusEnum status;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChargeViewInvoice &&
      other.id == id &&
      other.code == code &&
      other.status == status;

    @override
    int get hashCode =>
        id.hashCode +
        code.hashCode +
        status.hashCode;

  factory ChargeViewInvoice.fromJson(Map<String, dynamic> json) => _$ChargeViewInvoiceFromJson(json);

  Map<String, dynamic> toJson() => _$ChargeViewInvoiceToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum ChargeViewInvoiceStatusEnum {
@JsonValue(r'issued')
issued(r'issued'),
@JsonValue(r'paid')
paid(r'paid'),
@JsonValue(r'voided')
voided(r'voided');

const ChargeViewInvoiceStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


