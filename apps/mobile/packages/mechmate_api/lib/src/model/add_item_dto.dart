//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'add_item_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class AddItemDto {
  /// Returns a new [AddItemDto] instance.
  AddItemDto({

    required  this.type,

    required  this.description,

     this.partNumber,

    required  this.quantity,

    required  this.unitPriceCents,

     this.taxRateBps,

     this.requiresApproval,
  });

      /// labor = mano de obra; part = pieza.
  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  )


  final AddItemDtoTypeEnum type;



  @JsonKey(
    
    name: r'description',
    required: true,
    includeIfNull: false,
  )


  final String description;



  @JsonKey(
    
    name: r'part_number',
    required: false,
    includeIfNull: false,
  )


  final String? partNumber;



      /// Hasta 3 decimales (horas, unidades, galones…).
  @JsonKey(
    
    name: r'quantity',
    required: true,
    includeIfNull: false,
  )


  final String quantity;



      /// Centavos como string: \"120000\" = RD$1,200.00.
  @JsonKey(
    
    name: r'unit_price_cents',
    required: true,
    includeIfNull: false,
  )


  final String unitPriceCents;



      /// ITBIS en basis points (1800 = 18%, 0 = exento). Si no se envía al crear: 1800.
  @JsonKey(
    
    name: r'tax_rate_bps',
    required: false,
    includeIfNull: false,
  )


  final int? taxRateBps;



      /// true = línea propuesta: el cliente la aprueba o rechaza desde el enlace de la DVI. Si no se envía al crear: false.
  @JsonKey(
    
    name: r'requires_approval',
    required: false,
    includeIfNull: false,
  )


  final bool? requiresApproval;





    @override
    bool operator ==(Object other) => identical(this, other) || other is AddItemDto &&
      other.type == type &&
      other.description == description &&
      other.partNumber == partNumber &&
      other.quantity == quantity &&
      other.unitPriceCents == unitPriceCents &&
      other.taxRateBps == taxRateBps &&
      other.requiresApproval == requiresApproval;

    @override
    int get hashCode =>
        type.hashCode +
        description.hashCode +
        (partNumber == null ? 0 : partNumber.hashCode) +
        quantity.hashCode +
        unitPriceCents.hashCode +
        taxRateBps.hashCode +
        requiresApproval.hashCode;

  factory AddItemDto.fromJson(Map<String, dynamic> json) => _$AddItemDtoFromJson(json);

  Map<String, dynamic> toJson() => _$AddItemDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// labor = mano de obra; part = pieza.
enum AddItemDtoTypeEnum {
@JsonValue(r'labor')
labor(r'labor'),
@JsonValue(r'part')
part_(r'part');

const AddItemDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}


