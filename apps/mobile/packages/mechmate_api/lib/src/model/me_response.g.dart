// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'me_response.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$MeResponseCWProxy {
  MeResponse id(String id);

  MeResponse auth0Sub(String auth0Sub);

  MeResponse email(String? email);

  MeResponse phone(String? phone);

  MeResponse fullName(String? fullName);

  MeResponse status(String status);

  MeResponse kycStatus(String kycStatus);

  MeResponse roles(List<Role> roles);

  MeResponse createdAt(String createdAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `MeResponse(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// MeResponse(...).copyWith(id: 12, name: "My name")
  /// ````
  MeResponse call({
    String id,
    String auth0Sub,
    String? email,
    String? phone,
    String? fullName,
    String status,
    String kycStatus,
    List<Role> roles,
    String createdAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfMeResponse.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfMeResponse.copyWith.fieldName(...)`
class _$MeResponseCWProxyImpl implements _$MeResponseCWProxy {
  const _$MeResponseCWProxyImpl(this._value);

  final MeResponse _value;

  @override
  MeResponse id(String id) => this(id: id);

  @override
  MeResponse auth0Sub(String auth0Sub) => this(auth0Sub: auth0Sub);

  @override
  MeResponse email(String? email) => this(email: email);

  @override
  MeResponse phone(String? phone) => this(phone: phone);

  @override
  MeResponse fullName(String? fullName) => this(fullName: fullName);

  @override
  MeResponse status(String status) => this(status: status);

  @override
  MeResponse kycStatus(String kycStatus) => this(kycStatus: kycStatus);

  @override
  MeResponse roles(List<Role> roles) => this(roles: roles);

  @override
  MeResponse createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `MeResponse(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// MeResponse(...).copyWith(id: 12, name: "My name")
  /// ````
  MeResponse call({
    Object? id = const $CopyWithPlaceholder(),
    Object? auth0Sub = const $CopyWithPlaceholder(),
    Object? email = const $CopyWithPlaceholder(),
    Object? phone = const $CopyWithPlaceholder(),
    Object? fullName = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? kycStatus = const $CopyWithPlaceholder(),
    Object? roles = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
  }) {
    return MeResponse(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      auth0Sub: auth0Sub == const $CopyWithPlaceholder()
          ? _value.auth0Sub
          // ignore: cast_nullable_to_non_nullable
          : auth0Sub as String,
      email: email == const $CopyWithPlaceholder()
          ? _value.email
          // ignore: cast_nullable_to_non_nullable
          : email as String?,
      phone: phone == const $CopyWithPlaceholder()
          ? _value.phone
          // ignore: cast_nullable_to_non_nullable
          : phone as String?,
      fullName: fullName == const $CopyWithPlaceholder()
          ? _value.fullName
          // ignore: cast_nullable_to_non_nullable
          : fullName as String?,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as String,
      kycStatus: kycStatus == const $CopyWithPlaceholder()
          ? _value.kycStatus
          // ignore: cast_nullable_to_non_nullable
          : kycStatus as String,
      roles: roles == const $CopyWithPlaceholder()
          ? _value.roles
          // ignore: cast_nullable_to_non_nullable
          : roles as List<Role>,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
    );
  }
}

extension $MeResponseCopyWith on MeResponse {
  /// Returns a callable class that can be used as follows: `instanceOfMeResponse.copyWith(...)` or like so:`instanceOfMeResponse.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$MeResponseCWProxy get copyWith => _$MeResponseCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MeResponse _$MeResponseFromJson(Map<String, dynamic> json) => $checkedCreate(
  'MeResponse',
  json,
  ($checkedConvert) {
    $checkKeys(
      json,
      requiredKeys: const [
        'id',
        'auth0_sub',
        'email',
        'phone',
        'full_name',
        'status',
        'kyc_status',
        'roles',
        'created_at',
      ],
    );
    final val = MeResponse(
      id: $checkedConvert('id', (v) => v as String),
      auth0Sub: $checkedConvert('auth0_sub', (v) => v as String),
      email: $checkedConvert('email', (v) => v as String?),
      phone: $checkedConvert('phone', (v) => v as String?),
      fullName: $checkedConvert('full_name', (v) => v as String?),
      status: $checkedConvert('status', (v) => v as String),
      kycStatus: $checkedConvert('kyc_status', (v) => v as String),
      roles: $checkedConvert(
        'roles',
        (v) => (v as List<dynamic>)
            .map((e) => $enumDecode(_$RoleEnumMap, e))
            .toList(),
      ),
      createdAt: $checkedConvert('created_at', (v) => v as String),
    );
    return val;
  },
  fieldKeyMap: const {
    'auth0Sub': 'auth0_sub',
    'fullName': 'full_name',
    'kycStatus': 'kyc_status',
    'createdAt': 'created_at',
  },
);

Map<String, dynamic> _$MeResponseToJson(MeResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'auth0_sub': instance.auth0Sub,
      'email': instance.email,
      'phone': instance.phone,
      'full_name': instance.fullName,
      'status': instance.status,
      'kyc_status': instance.kycStatus,
      'roles': instance.roles.map((e) => _$RoleEnumMap[e]!).toList(),
      'created_at': instance.createdAt,
    };

const _$RoleEnumMap = {
  Role.mechanic: 'mechanic',
  Role.seller: 'seller',
  Role.customer: 'customer',
  Role.courier: 'courier',
  Role.admin: 'admin',
};
