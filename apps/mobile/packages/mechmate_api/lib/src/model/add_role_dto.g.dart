// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_role_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$AddRoleDtoCWProxy {
  AddRoleDto role(AddRoleDtoRoleEnum role);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `AddRoleDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// AddRoleDto(...).copyWith(id: 12, name: "My name")
  /// ````
  AddRoleDto call({AddRoleDtoRoleEnum role});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfAddRoleDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfAddRoleDto.copyWith.fieldName(...)`
class _$AddRoleDtoCWProxyImpl implements _$AddRoleDtoCWProxy {
  const _$AddRoleDtoCWProxyImpl(this._value);

  final AddRoleDto _value;

  @override
  AddRoleDto role(AddRoleDtoRoleEnum role) => this(role: role);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `AddRoleDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// AddRoleDto(...).copyWith(id: 12, name: "My name")
  /// ````
  AddRoleDto call({Object? role = const $CopyWithPlaceholder()}) {
    return AddRoleDto(
      role: role == const $CopyWithPlaceholder()
          ? _value.role
          // ignore: cast_nullable_to_non_nullable
          : role as AddRoleDtoRoleEnum,
    );
  }
}

extension $AddRoleDtoCopyWith on AddRoleDto {
  /// Returns a callable class that can be used as follows: `instanceOfAddRoleDto.copyWith(...)` or like so:`instanceOfAddRoleDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$AddRoleDtoCWProxy get copyWith => _$AddRoleDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddRoleDto _$AddRoleDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('AddRoleDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['role']);
      final val = AddRoleDto(
        role: $checkedConvert(
          'role',
          (v) => $enumDecode(_$AddRoleDtoRoleEnumEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$AddRoleDtoToJson(AddRoleDto instance) =>
    <String, dynamic>{'role': _$AddRoleDtoRoleEnumEnumMap[instance.role]!};

const _$AddRoleDtoRoleEnumEnumMap = {
  AddRoleDtoRoleEnum.mechanic: 'mechanic',
  AddRoleDtoRoleEnum.seller: 'seller',
  AddRoleDtoRoleEnum.customer: 'customer',
};
