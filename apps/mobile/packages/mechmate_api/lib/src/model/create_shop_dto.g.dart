// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_shop_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$CreateShopDtoCWProxy {
  CreateShopDto name(String name);

  CreateShopDto type(CreateShopDtoTypeEnum? type);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CreateShopDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CreateShopDto(...).copyWith(id: 12, name: "My name")
  /// ````
  CreateShopDto call({String name, CreateShopDtoTypeEnum? type});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfCreateShopDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfCreateShopDto.copyWith.fieldName(...)`
class _$CreateShopDtoCWProxyImpl implements _$CreateShopDtoCWProxy {
  const _$CreateShopDtoCWProxyImpl(this._value);

  final CreateShopDto _value;

  @override
  CreateShopDto name(String name) => this(name: name);

  @override
  CreateShopDto type(CreateShopDtoTypeEnum? type) => this(type: type);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CreateShopDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CreateShopDto(...).copyWith(id: 12, name: "My name")
  /// ````
  CreateShopDto call({
    Object? name = const $CopyWithPlaceholder(),
    Object? type = const $CopyWithPlaceholder(),
  }) {
    return CreateShopDto(
      name: name == const $CopyWithPlaceholder()
          ? _value.name
          // ignore: cast_nullable_to_non_nullable
          : name as String,
      type: type == const $CopyWithPlaceholder()
          ? _value.type
          // ignore: cast_nullable_to_non_nullable
          : type as CreateShopDtoTypeEnum?,
    );
  }
}

extension $CreateShopDtoCopyWith on CreateShopDto {
  /// Returns a callable class that can be used as follows: `instanceOfCreateShopDto.copyWith(...)` or like so:`instanceOfCreateShopDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$CreateShopDtoCWProxy get copyWith => _$CreateShopDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateShopDto _$CreateShopDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CreateShopDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['name']);
      final val = CreateShopDto(
        name: $checkedConvert('name', (v) => v as String),
        type: $checkedConvert(
          'type',
          (v) => $enumDecodeNullable(_$CreateShopDtoTypeEnumEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$CreateShopDtoToJson(CreateShopDto instance) =>
    <String, dynamic>{
      'name': instance.name,
      'type': ?_$CreateShopDtoTypeEnumEnumMap[instance.type],
    };

const _$CreateShopDtoTypeEnumEnumMap = {
  CreateShopDtoTypeEnum.mechanicShop: 'mechanic_shop',
  CreateShopDtoTypeEnum.partsSeller: 'parts_seller',
};
