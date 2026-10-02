//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/work_order_item_type.dart';
import 'package:mechmate_api/src/model/item_approval_status.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'work_order_item_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class WorkOrderItemView {
  /// Returns a new [WorkOrderItemView] instance.
  WorkOrderItemView({

    required  this.id,

    required  this.type,

    required  this.description,

    required  this.partNumber,

    required  this.quantity,

    required  this.unitPriceCents,

    required  this.taxRateBps,

    required  this.approvalStatus,

    required  this.decidedAt,

    required  this.subtotalCents,

    required  this.taxCents,

    required  this.totalCents,

    required  this.createdAt,

    required  this.updatedAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



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



      /// Decimal como string: `\"1.5\"` (horas, unidades…).
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



      /// ITBIS en basis points: 1800 = 18%, 0 = exento.
  @JsonKey(
    
    name: r'tax_rate_bps',
    required: true,
    includeIfNull: false,
  )


  final int taxRateBps;



  @JsonKey(
    
    name: r'approval_status',
    required: true,
    includeIfNull: false,
  )


  final ItemApprovalStatus approvalStatus;



  @JsonKey(
    
    name: r'decided_at',
    required: true,
    includeIfNull: true,
  )


  final String? decidedAt;



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



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;



  @JsonKey(
    
    name: r'updated_at',
    required: true,
    includeIfNull: false,
  )


  final String updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is WorkOrderItemView &&
      other.id == id &&
      other.type == type &&
      other.description == description &&
      other.partNumber == partNumber &&
      other.quantity == quantity &&
      other.unitPriceCents == unitPriceCents &&
      other.taxRateBps == taxRateBps &&
      other.approvalStatus == approvalStatus &&
      other.decidedAt == decidedAt &&
      other.subtotalCents == subtotalCents &&
      other.taxCents == taxCents &&
      other.totalCents == totalCents &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
        type.hashCode +
        description.hashCode +
        (partNumber == null ? 0 : partNumber.hashCode) +
        quantity.hashCode +
        unitPriceCents.hashCode +
        taxRateBps.hashCode +
        approvalStatus.hashCode +
        (decidedAt == null ? 0 : decidedAt.hashCode) +
        subtotalCents.hashCode +
        taxCents.hashCode +
        totalCents.hashCode +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory WorkOrderItemView.fromJson(Map<String, dynamic> json) => _$WorkOrderItemViewFromJson(json);

  Map<String, dynamic> toJson() => _$WorkOrderItemViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

