//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/work_order_item_type.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'invoice_line_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class InvoiceLineView {
  /// Returns a new [InvoiceLineView] instance.
  InvoiceLineView({

    required  this.position,

    required  this.type,

    required  this.description,

    required  this.partNumber,

    required  this.quantity,

    required  this.unitPriceCents,

    required  this.taxRateBps,

    required  this.subtotalCents,

    required  this.taxCents,

    required  this.totalCents,
  });

  @JsonKey(
    
    name: r'position',
    required: true,
    includeIfNull: false,
  )


  final int position;



  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  )


  final WorkOrderItemType type;



  @JsonKey(
    
    name: r'description',
    required: true,
    includeIfNull: false,
  )


  final String description;



  @JsonKey(
    
    name: r'part_number',
    required: true,
    includeIfNull: true,
  )


  final String? partNumber;



  @JsonKey(
    
    name: r'quantity',
    required: true,
    includeIfNull: false,
  )


  final String quantity;



  @JsonKey(
    
    name: r'unit_price_cents',
    required: true,
    includeIfNull: false,
  )


  final String unitPriceCents;



  @JsonKey(
    
    name: r'tax_rate_bps',
    required: true,
    includeIfNull: false,
  )


  final int taxRateBps;



  @JsonKey(
    
    name: r'subtotal_cents',
    required: true,
    includeIfNull: false,
  )


  final String subtotalCents;



  @JsonKey(
    
    name: r'tax_cents',
    required: true,
    includeIfNull: false,
  )


  final String taxCents;



  @JsonKey(
    
    name: r'total_cents',
    required: true,
    includeIfNull: false,
  )


  final String totalCents;





    @override
    bool operator ==(Object other) => identical(this, other) || other is InvoiceLineView &&
      other.position == position &&
      other.type == type &&
      other.description == description &&
      other.partNumber == partNumber &&
      other.quantity == quantity &&
      other.unitPriceCents == unitPriceCents &&
      other.taxRateBps == taxRateBps &&
      other.subtotalCents == subtotalCents &&
      other.taxCents == taxCents &&
      other.totalCents == totalCents;

    @override
    int get hashCode =>
        position.hashCode +
        type.hashCode +
        description.hashCode +
        (partNumber == null ? 0 : partNumber.hashCode) +
        quantity.hashCode +
        unitPriceCents.hashCode +
        taxRateBps.hashCode +
        subtotalCents.hashCode +
        taxCents.hashCode +
        totalCents.hashCode;

  factory InvoiceLineView.fromJson(Map<String, dynamic> json) => _$InvoiceLineViewFromJson(json);

  Map<String, dynamic> toJson() => _$InvoiceLineViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

