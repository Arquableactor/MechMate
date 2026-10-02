//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/work_order_item_type.dart';
import 'package:mechmate_api/src/model/item_approval_status.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_approval_item.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicApprovalItem {
  /// Returns a new [PublicApprovalItem] instance.
  PublicApprovalItem({

    required  this.id,

    required  this.type,

    required  this.description,

    required  this.quantity,

    required  this.totalCents,

    required  this.approvalStatus,
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
    
    name: r'quantity',
    required: true,
    includeIfNull: false,
  )


  final String quantity;



  @JsonKey(
    
    name: r'total_cents',
    required: true,
    includeIfNull: false,
  )


  final String totalCents;



  @JsonKey(
    
    name: r'approval_status',
    required: true,
    includeIfNull: false,
  )


  final ItemApprovalStatus approvalStatus;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicApprovalItem &&
      other.id == id &&
      other.type == type &&
      other.description == description &&
      other.quantity == quantity &&
      other.totalCents == totalCents &&
      other.approvalStatus == approvalStatus;

    @override
    int get hashCode =>
        id.hashCode +
        type.hashCode +
        description.hashCode +
        quantity.hashCode +
        totalCents.hashCode +
        approvalStatus.hashCode;

  factory PublicApprovalItem.fromJson(Map<String, dynamic> json) => _$PublicApprovalItemFromJson(json);

  Map<String, dynamic> toJson() => _$PublicApprovalItemToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

