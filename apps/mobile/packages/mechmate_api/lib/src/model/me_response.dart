//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/role.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'me_response.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class MeResponse {
  /// Returns a new [MeResponse] instance.
  MeResponse({

    required  this.id,

    required  this.auth0Sub,

    required  this.email,

    required  this.phone,

    required  this.fullName,

    required  this.status,

    required  this.kycStatus,

    required  this.roles,

    required  this.createdAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'auth0_sub',
    required: true,
    includeIfNull: false,
  )


  final String auth0Sub;



  @JsonKey(
    
    name: r'email',
    required: true,
    includeIfNull: true,
  )


  final String? email;



  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: true,
  )


  final String? phone;



  @JsonKey(
    
    name: r'full_name',
    required: true,
    includeIfNull: true,
  )


  final String? fullName;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final String status;



  @JsonKey(
    
    name: r'kyc_status',
    required: true,
    includeIfNull: false,
  )


  final String kycStatus;



  @JsonKey(
    
    name: r'roles',
    required: true,
    includeIfNull: false,
  )


  final List<Role> roles;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is MeResponse &&
      other.id == id &&
      other.auth0Sub == auth0Sub &&
      other.email == email &&
      other.phone == phone &&
      other.fullName == fullName &&
      other.status == status &&
      other.kycStatus == kycStatus &&
      other.roles == roles &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        auth0Sub.hashCode +
        (email == null ? 0 : email.hashCode) +
        (phone == null ? 0 : phone.hashCode) +
        (fullName == null ? 0 : fullName.hashCode) +
        status.hashCode +
        kycStatus.hashCode +
        roles.hashCode +
        createdAt.hashCode;

  factory MeResponse.fromJson(Map<String, dynamic> json) => _$MeResponseFromJson(json);

  Map<String, dynamic> toJson() => _$MeResponseToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

