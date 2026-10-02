//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'charge_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChargeDto {
  /// Returns a new [ChargeDto] instance.
  ChargeDto({

    required  this.method,
  });

      /// El monto sale de la factura: no se envía.
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  )


  final ChargeDtoMethodEnum method;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChargeDto &&
      other.method == method;

    @override
    int get hashCode =>
        method.hashCode;

  factory ChargeDto.fromJson(Map<String, dynamic> json) => _$ChargeDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ChargeDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// El monto sale de la factura: no se envía.
enum ChargeDtoMethodEnum {
@JsonValue(r'card')
card(r'card'),
@JsonValue(r'cash')
cash(r'cash'),
@JsonValue(r'transfer')
transfer(r'transfer');

const ChargeDtoMethodEnum(this.value);

final String value;

@override
String toString() => value;
}


