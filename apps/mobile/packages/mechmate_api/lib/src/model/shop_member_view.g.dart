// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shop_member_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ShopMemberViewCWProxy {
  ShopMemberView id(String id);

  ShopMemberView role(ShopMemberRole role);

  ShopMemberView status(ShopMemberViewStatusEnum status);

  ShopMemberView accountId(String? accountId);

  ShopMemberView email(String? email);

  ShopMemberView fullName(String? fullName);

  ShopMemberView createdAt(String createdAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ShopMemberView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ShopMemberView(...).copyWith(id: 12, name: "My name")
  /// ````
  ShopMemberView call({
    String id,
    ShopMemberRole role,
    ShopMemberViewStatusEnum status,
    String? accountId,
    String? email,
    String? fullName,
    String createdAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfShopMemberView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfShopMemberView.copyWith.fieldName(...)`
class _$ShopMemberViewCWProxyImpl implements _$ShopMemberViewCWProxy {
  const _$ShopMemberViewCWProxyImpl(this._value);

  final ShopMemberView _value;

  @override
  ShopMemberView id(String id) => this(id: id);

  @override
  ShopMemberView role(ShopMemberRole role) => this(role: role);

  @override
  ShopMemberView status(ShopMemberViewStatusEnum status) =>
      this(status: status);

  @override
  ShopMemberView accountId(String? accountId) => this(accountId: accountId);

  @override
  ShopMemberView email(String? email) => this(email: email);

  @override
  ShopMemberView fullName(String? fullName) => this(fullName: fullName);

  @override
  ShopMemberView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ShopMemberView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ShopMemberView(...).copyWith(id: 12, name: "My name")
  /// ````
  ShopMemberView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? role = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? accountId = const $CopyWithPlaceholder(),
    Object? email = const $CopyWithPlaceholder(),
    Object? fullName = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
  }) {
    return ShopMemberView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      role: role == const $CopyWithPlaceholder()
          ? _value.role
          // ignore: cast_nullable_to_non_nullable
          : role as ShopMemberRole,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as ShopMemberViewStatusEnum,
      accountId: accountId == const $CopyWithPlaceholder()
          ? _value.accountId
          // ignore: cast_nullable_to_non_nullable
          : accountId as String?,
      email: email == const $CopyWithPlaceholder()
          ? _value.email
          // ignore: cast_nullable_to_non_nullable
          : email as String?,
      fullName: fullName == const $CopyWithPlaceholder()
          ? _value.fullName
          // ignore: cast_nullable_to_non_nullable
          : fullName as String?,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
    );
  }
}

extension $ShopMemberViewCopyWith on ShopMemberView {
  /// Returns a callable class that can be used as follows: `instanceOfShopMemberView.copyWith(...)` or like so:`instanceOfShopMemberView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ShopMemberViewCWProxy get copyWith => _$ShopMemberViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ShopMemberView _$ShopMemberViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'ShopMemberView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'role',
            'status',
            'account_id',
            'email',
            'full_name',
            'created_at',
          ],
        );
        final val = ShopMemberView(
          id: $checkedConvert('id', (v) => v as String),
          role: $checkedConvert(
            'role',
            (v) => $enumDecode(_$ShopMemberRoleEnumMap, v),
          ),
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$ShopMemberViewStatusEnumEnumMap, v),
          ),
          accountId: $checkedConvert('account_id', (v) => v as String?),
          email: $checkedConvert('email', (v) => v as String?),
          fullName: $checkedConvert('full_name', (v) => v as String?),
          createdAt: $checkedConvert('created_at', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'accountId': 'account_id',
        'fullName': 'full_name',
        'createdAt': 'created_at',
      },
    );

Map<String, dynamic> _$ShopMemberViewToJson(ShopMemberView instance) =>
    <String, dynamic>{
      'id': instance.id,
      'role': _$ShopMemberRoleEnumMap[instance.role]!,
      'status': _$ShopMemberViewStatusEnumEnumMap[instance.status]!,
      'account_id': instance.accountId,
      'email': instance.email,
      'full_name': instance.fullName,
      'created_at': instance.createdAt,
    };

const _$ShopMemberRoleEnumMap = {
  ShopMemberRole.owner: 'owner',
  ShopMemberRole.mechanic: 'mechanic',
  ShopMemberRole.advisor: 'advisor',
};

const _$ShopMemberViewStatusEnumEnumMap = {
  ShopMemberViewStatusEnum.invited: 'invited',
  ShopMemberViewStatusEnum.active: 'active',
};
