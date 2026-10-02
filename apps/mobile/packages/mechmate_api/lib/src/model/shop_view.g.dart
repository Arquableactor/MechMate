// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shop_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ShopViewCWProxy {
  ShopView id(String id);

  ShopView name(String name);

  ShopView type(ShopType type);

  ShopView commissionBps(int commissionBps);

  ShopView myRole(ShopMemberRole myRole);

  ShopView createdAt(String createdAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ShopView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ShopView(...).copyWith(id: 12, name: "My name")
  /// ````
  ShopView call({
    String id,
    String name,
    ShopType type,
    int commissionBps,
    ShopMemberRole myRole,
    String createdAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfShopView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfShopView.copyWith.fieldName(...)`
class _$ShopViewCWProxyImpl implements _$ShopViewCWProxy {
  const _$ShopViewCWProxyImpl(this._value);

  final ShopView _value;

  @override
  ShopView id(String id) => this(id: id);

  @override
  ShopView name(String name) => this(name: name);

  @override
  ShopView type(ShopType type) => this(type: type);

  @override
  ShopView commissionBps(int commissionBps) =>
      this(commissionBps: commissionBps);

  @override
  ShopView myRole(ShopMemberRole myRole) => this(myRole: myRole);

  @override
  ShopView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ShopView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ShopView(...).copyWith(id: 12, name: "My name")
  /// ````
  ShopView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? name = const $CopyWithPlaceholder(),
    Object? type = const $CopyWithPlaceholder(),
    Object? commissionBps = const $CopyWithPlaceholder(),
    Object? myRole = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
  }) {
    return ShopView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      name: name == const $CopyWithPlaceholder()
          ? _value.name
          // ignore: cast_nullable_to_non_nullable
          : name as String,
      type: type == const $CopyWithPlaceholder()
          ? _value.type
          // ignore: cast_nullable_to_non_nullable
          : type as ShopType,
      commissionBps: commissionBps == const $CopyWithPlaceholder()
          ? _value.commissionBps
          // ignore: cast_nullable_to_non_nullable
          : commissionBps as int,
      myRole: myRole == const $CopyWithPlaceholder()
          ? _value.myRole
          // ignore: cast_nullable_to_non_nullable
          : myRole as ShopMemberRole,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
    );
  }
}

extension $ShopViewCopyWith on ShopView {
  /// Returns a callable class that can be used as follows: `instanceOfShopView.copyWith(...)` or like so:`instanceOfShopView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ShopViewCWProxy get copyWith => _$ShopViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ShopView _$ShopViewFromJson(Map<String, dynamic> json) => $checkedCreate(
  'ShopView',
  json,
  ($checkedConvert) {
    $checkKeys(
      json,
      requiredKeys: const [
        'id',
        'name',
        'type',
        'commission_bps',
        'my_role',
        'created_at',
      ],
    );
    final val = ShopView(
      id: $checkedConvert('id', (v) => v as String),
      name: $checkedConvert('name', (v) => v as String),
      type: $checkedConvert('type', (v) => $enumDecode(_$ShopTypeEnumMap, v)),
      commissionBps: $checkedConvert(
        'commission_bps',
        (v) => (v as num).toInt(),
      ),
      myRole: $checkedConvert(
        'my_role',
        (v) => $enumDecode(_$ShopMemberRoleEnumMap, v),
      ),
      createdAt: $checkedConvert('created_at', (v) => v as String),
    );
    return val;
  },
  fieldKeyMap: const {
    'commissionBps': 'commission_bps',
    'myRole': 'my_role',
    'createdAt': 'created_at',
  },
);

Map<String, dynamic> _$ShopViewToJson(ShopView instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'type': _$ShopTypeEnumMap[instance.type]!,
  'commission_bps': instance.commissionBps,
  'my_role': _$ShopMemberRoleEnumMap[instance.myRole]!,
  'created_at': instance.createdAt,
};

const _$ShopTypeEnumMap = {
  ShopType.mechanicShop: 'mechanic_shop',
  ShopType.partsSeller: 'parts_seller',
};

const _$ShopMemberRoleEnumMap = {
  ShopMemberRole.owner: 'owner',
  ShopMemberRole.mechanic: 'mechanic',
  ShopMemberRole.advisor: 'advisor',
};
