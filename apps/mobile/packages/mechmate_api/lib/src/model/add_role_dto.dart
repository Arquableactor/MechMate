//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'add_role_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class AddRoleDto {
  /// Returns a new [AddRoleDto] instance.
  AddRoleDto({

    required  this.role,
  });

      /// Rol a añadir. Solo mechanic|seller|customer (courier/admin se rechazan con 400).
  @JsonKey(
    
    name: r'role',
    required: true,
    includeIfNull: false,
  )


  final AddRoleDtoRoleEnum role;





    @override
    bool operator ==(Object other) => identical(this, other) || other is AddRoleDto &&
      other.role == role;

    @override
    int get hashCode =>
        role.hashCode;

  factory AddRoleDto.fromJson(Map<String, dynamic> json) => _$AddRoleDtoFromJson(json);

  Map<String, dynamic> toJson() => _$AddRoleDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Rol a añadir. Solo mechanic|seller|customer (courier/admin se rechazan con 400).
enum AddRoleDtoRoleEnum {
@JsonValue(r'mechanic')
mechanic(r'mechanic'),
@JsonValue(r'seller')
seller(r'seller'),
@JsonValue(r'customer')
customer(r'customer');

const AddRoleDtoRoleEnum(this.value);

final String value;

@override
String toString() => value;
}


