//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/work_order_status.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'charge_view_work_order.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChargeViewWorkOrder {
  /// Returns a new [ChargeViewWorkOrder] instance.
  ChargeViewWorkOrder({

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


  final WorkOrderStatus status;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChargeViewWorkOrder &&
      other.id == id &&
      other.code == code &&
      other.status == status;

    @override
    int get hashCode =>
        id.hashCode +
        code.hashCode +
        status.hashCode;

  factory ChargeViewWorkOrder.fromJson(Map<String, dynamic> json) => _$ChargeViewWorkOrderFromJson(json);

  Map<String, dynamic> toJson() => _$ChargeViewWorkOrderToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

