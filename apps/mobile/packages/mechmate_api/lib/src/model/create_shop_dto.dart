//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_shop_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateShopDto {
  /// Returns a new [CreateShopDto] instance.
  CreateShopDto({

    required  this.name,

     this.type,
  });

  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final String name;



      /// Si no se envía: mechanic_shop.
  @JsonKey(
    
    name: r'type',
    required: false,
    includeIfNull: false,
  )


  final CreateShopDtoTypeEnum? type;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateShopDto &&
      other.name == name &&
      other.type == type;

    @override
    int get hashCode =>
        name.hashCode +
        type.hashCode;

  factory CreateShopDto.fromJson(Map<String, dynamic> json) => _$CreateShopDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateShopDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Si no se envía: mechanic_shop.
enum CreateShopDtoTypeEnum {
@JsonValue(r'mechanic_shop')
mechanicShop(r'mechanic_shop'),
@JsonValue(r'parts_seller')
partsSeller(r'parts_seller');

const CreateShopDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}


