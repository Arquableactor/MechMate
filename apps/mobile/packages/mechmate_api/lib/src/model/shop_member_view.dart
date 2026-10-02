//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/shop_member_role.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'shop_member_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ShopMemberView {
  /// Returns a new [ShopMemberView] instance.
  ShopMemberView({

    required  this.id,

    required  this.role,

    required  this.status,

    required  this.accountId,

    required  this.email,

    required  this.fullName,

    required  this.createdAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'role',
    required: true,
    includeIfNull: false,
  )


  final ShopMemberRole role;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final ShopMemberViewStatusEnum status;



      /// null mientras la invitación no se vincula a una cuenta.
  @JsonKey(
    
    name: r'account_id',
    required: true,
    includeIfNull: true,
  )


  final String? accountId;



      /// Email de la cuenta, o el invitado si aún no hay cuenta.
  @JsonKey(
    
    name: r'email',
    required: true,
    includeIfNull: true,
  )


  final String? email;



  @JsonKey(
    
    name: r'full_name',
    required: true,
    includeIfNull: true,
  )


  final String? fullName;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ShopMemberView &&
      other.id == id &&
      other.role == role &&
      other.status == status &&
      other.accountId == accountId &&
      other.email == email &&
      other.fullName == fullName &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        role.hashCode +
        status.hashCode +
        (accountId == null ? 0 : accountId.hashCode) +
        (email == null ? 0 : email.hashCode) +
        (fullName == null ? 0 : fullName.hashCode) +
        createdAt.hashCode;

  factory ShopMemberView.fromJson(Map<String, dynamic> json) => _$ShopMemberViewFromJson(json);

  Map<String, dynamic> toJson() => _$ShopMemberViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum ShopMemberViewStatusEnum {
@JsonValue(r'invited')
invited(r'invited'),
@JsonValue(r'active')
active(r'active');

const ShopMemberViewStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


