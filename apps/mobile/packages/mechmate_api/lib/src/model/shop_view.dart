//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/shop_member_role.dart';
import 'package:mechmate_api/src/model/shop_type.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'shop_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ShopView {
  /// Returns a new [ShopView] instance.
  ShopView({

    required  this.id,

    required  this.name,

    required  this.type,

    required  this.commissionBps,

    required  this.myRole,

    required  this.createdAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final String name;



  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  )


  final ShopType type;



      /// Comisión de la plataforma en basis points (800 = 8%).
  @JsonKey(
    
    name: r'commission_bps',
    required: true,
    includeIfNull: false,
  )


  final int commissionBps;



  @JsonKey(
    
    name: r'my_role',
    required: true,
    includeIfNull: false,
  )


  final ShopMemberRole myRole;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ShopView &&
      other.id == id &&
      other.name == name &&
      other.type == type &&
      other.commissionBps == commissionBps &&
      other.myRole == myRole &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        type.hashCode +
        commissionBps.hashCode +
        myRole.hashCode +
        createdAt.hashCode;

  factory ShopView.fromJson(Map<String, dynamic> json) => _$ShopViewFromJson(json);

  Map<String, dynamic> toJson() => _$ShopViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

