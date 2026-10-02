// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invite_member_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InviteMemberDtoCWProxy {
  InviteMemberDto email(String email);

  InviteMemberDto role(InviteMemberDtoRoleEnum role);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InviteMemberDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InviteMemberDto(...).copyWith(id: 12, name: "My name")
  /// ````
  InviteMemberDto call({String email, InviteMemberDtoRoleEnum role});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInviteMemberDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInviteMemberDto.copyWith.fieldName(...)`
class _$InviteMemberDtoCWProxyImpl implements _$InviteMemberDtoCWProxy {
  const _$InviteMemberDtoCWProxyImpl(this._value);

  final InviteMemberDto _value;

  @override
  InviteMemberDto email(String email) => this(email: email);

  @override
  InviteMemberDto role(InviteMemberDtoRoleEnum role) => this(role: role);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InviteMemberDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InviteMemberDto(...).copyWith(id: 12, name: "My name")
  /// ````
  InviteMemberDto call({
    Object? email = const $CopyWithPlaceholder(),
    Object? role = const $CopyWithPlaceholder(),
  }) {
    return InviteMemberDto(
      email: email == const $CopyWithPlaceholder()
          ? _value.email
          // ignore: cast_nullable_to_non_nullable
          : email as String,
      role: role == const $CopyWithPlaceholder()
          ? _value.role
          // ignore: cast_nullable_to_non_nullable
          : role as InviteMemberDtoRoleEnum,
    );
  }
}

extension $InviteMemberDtoCopyWith on InviteMemberDto {
  /// Returns a callable class that can be used as follows: `instanceOfInviteMemberDto.copyWith(...)` or like so:`instanceOfInviteMemberDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InviteMemberDtoCWProxy get copyWith => _$InviteMemberDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InviteMemberDto _$InviteMemberDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('InviteMemberDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['email', 'role']);
      final val = InviteMemberDto(
        email: $checkedConvert('email', (v) => v as String),
        role: $checkedConvert(
          'role',
          (v) => $enumDecode(_$InviteMemberDtoRoleEnumEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$InviteMemberDtoToJson(InviteMemberDto instance) =>
    <String, dynamic>{
      'email': instance.email,
      'role': _$InviteMemberDtoRoleEnumEnumMap[instance.role]!,
    };

const _$InviteMemberDtoRoleEnumEnumMap = {
  InviteMemberDtoRoleEnum.mechanic: 'mechanic',
  InviteMemberDtoRoleEnum.advisor: 'advisor',
};
