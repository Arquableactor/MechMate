//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'invite_member_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class InviteMemberDto {
  /// Returns a new [InviteMemberDto] instance.
  InviteMemberDto({

    required  this.email,

    required  this.role,
  });

  @JsonKey(
    
    name: r'email',
    required: true,
    includeIfNull: false,
  )


  final String email;



  @JsonKey(
    
    name: r'role',
    required: true,
    includeIfNull: false,
  )


  final InviteMemberDtoRoleEnum role;





    @override
    bool operator ==(Object other) => identical(this, other) || other is InviteMemberDto &&
      other.email == email &&
      other.role == role;

    @override
    int get hashCode =>
        email.hashCode +
        role.hashCode;

  factory InviteMemberDto.fromJson(Map<String, dynamic> json) => _$InviteMemberDtoFromJson(json);

  Map<String, dynamic> toJson() => _$InviteMemberDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum InviteMemberDtoRoleEnum {
@JsonValue(r'mechanic')
mechanic(r'mechanic'),
@JsonValue(r'advisor')
advisor(r'advisor');

const InviteMemberDtoRoleEnum(this.value);

final String value;

@override
String toString() => value;
}


