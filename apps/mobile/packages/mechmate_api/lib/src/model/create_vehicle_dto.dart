//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_vehicle_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateVehicleDto {
  /// Returns a new [CreateVehicleDto] instance.
  CreateVehicleDto({

    required  this.customerId,

     this.vin,

     this.chassisNumber,

     this.plate,

     this.make,

     this.model,

     this.year,

     this.trim,

     this.engine,

     this.fuelType,

     this.color,

     this.mileageKm,

     this.notes,
  });

      /// Cliente dueño (del mismo taller).
  @JsonKey(
    
    name: r'customer_id',
    required: true,
    includeIfNull: false,
  )


  final String customerId;



      /// Si viene, autocompleta marca/modelo/año/motor.
  @JsonKey(
    
    name: r'vin',
    required: false,
    includeIfNull: false,
  )


  final String? vin;



      /// Para vehículos sin VIN (p. ej. japoneses).
  @JsonKey(
    
    name: r'chassis_number',
    required: false,
    includeIfNull: false,
  )


  final String? chassisNumber;



  @JsonKey(
    
    name: r'plate',
    required: false,
    includeIfNull: false,
  )


  final String? plate;



      /// Obligatoria si no hay VIN decodificable.
  @JsonKey(
    
    name: r'make',
    required: false,
    includeIfNull: false,
  )


  final String? make;



  @JsonKey(
    
    name: r'model',
    required: false,
    includeIfNull: false,
  )


  final String? model;



  @JsonKey(
    
    name: r'year',
    required: false,
    includeIfNull: false,
  )


  final int? year;



  @JsonKey(
    
    name: r'trim',
    required: false,
    includeIfNull: false,
  )


  final String? trim;



  @JsonKey(
    
    name: r'engine',
    required: false,
    includeIfNull: false,
  )


  final String? engine;



  @JsonKey(
    
    name: r'fuel_type',
    required: false,
    includeIfNull: false,
  )


  final String? fuelType;



  @JsonKey(
    
    name: r'color',
    required: false,
    includeIfNull: false,
  )


  final String? color;



  @JsonKey(
    
    name: r'mileage_km',
    required: false,
    includeIfNull: false,
  )


  final int? mileageKm;



  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateVehicleDto &&
      other.customerId == customerId &&
      other.vin == vin &&
      other.chassisNumber == chassisNumber &&
      other.plate == plate &&
      other.make == make &&
      other.model == model &&
      other.year == year &&
      other.trim == trim &&
      other.engine == engine &&
      other.fuelType == fuelType &&
      other.color == color &&
      other.mileageKm == mileageKm &&
      other.notes == notes;

    @override
    int get hashCode =>
        customerId.hashCode +
        (vin == null ? 0 : vin.hashCode) +
        (chassisNumber == null ? 0 : chassisNumber.hashCode) +
        (plate == null ? 0 : plate.hashCode) +
        make.hashCode +
        (model == null ? 0 : model.hashCode) +
        (year == null ? 0 : year.hashCode) +
        (trim == null ? 0 : trim.hashCode) +
        (engine == null ? 0 : engine.hashCode) +
        (fuelType == null ? 0 : fuelType.hashCode) +
        (color == null ? 0 : color.hashCode) +
        (mileageKm == null ? 0 : mileageKm.hashCode) +
        (notes == null ? 0 : notes.hashCode);

  factory CreateVehicleDto.fromJson(Map<String, dynamic> json) => _$CreateVehicleDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateVehicleDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

