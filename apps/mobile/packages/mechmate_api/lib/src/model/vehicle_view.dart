//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vehicle_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VehicleView {
  /// Returns a new [VehicleView] instance.
  VehicleView({

    required  this.id,

    required  this.customerId,

    required  this.vin,

    required  this.chassisNumber,

    required  this.plate,

    required  this.make,

    required  this.model,

    required  this.year,

    required  this.trim,

    required  this.engine,

    required  this.fuelType,

    required  this.color,

    required  this.mileageKm,

    required  this.dataSource,

    required  this.notes,

    required  this.createdAt,

    required  this.updatedAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'customer_id',
    required: true,
    includeIfNull: false,
  )


  final String customerId;



      /// VIN normalizado (17).
  @JsonKey(
    
    name: r'vin',
    required: true,
    includeIfNull: true,
  )


  final String? vin;



      /// Número de chasis (vehículos sin VIN, p. ej. importados de Japón).
  @JsonKey(
    
    name: r'chassis_number',
    required: true,
    includeIfNull: true,
  )


  final String? chassisNumber;



      /// Placa sin espacios ni guiones, p. ej. `A123456`.
  @JsonKey(
    
    name: r'plate',
    required: true,
    includeIfNull: true,
  )


  final String? plate;



  @JsonKey(
    
    name: r'make',
    required: true,
    includeIfNull: false,
  )


  final String make;



  @JsonKey(
    
    name: r'model',
    required: true,
    includeIfNull: true,
  )


  final String? model;



  @JsonKey(
    
    name: r'year',
    required: true,
    includeIfNull: true,
  )


  final int? year;



  @JsonKey(
    
    name: r'trim',
    required: true,
    includeIfNull: true,
  )


  final String? trim;



  @JsonKey(
    
    name: r'engine',
    required: true,
    includeIfNull: true,
  )


  final String? engine;



  @JsonKey(
    
    name: r'fuel_type',
    required: true,
    includeIfNull: true,
  )


  final String? fuelType;



  @JsonKey(
    
    name: r'color',
    required: true,
    includeIfNull: true,
  )


  final String? color;



  @JsonKey(
    
    name: r'mileage_km',
    required: true,
    includeIfNull: true,
  )


  final int? mileageKm;



      /// De dónde salieron los datos técnicos.
  @JsonKey(
    
    name: r'data_source',
    required: true,
    includeIfNull: false,
  )


  final VehicleViewDataSourceEnum dataSource;



  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;



  @JsonKey(
    
    name: r'updated_at',
    required: true,
    includeIfNull: false,
  )


  final String updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VehicleView &&
      other.id == id &&
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
      other.dataSource == dataSource &&
      other.notes == notes &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
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
        dataSource.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory VehicleView.fromJson(Map<String, dynamic> json) => _$VehicleViewFromJson(json);

  Map<String, dynamic> toJson() => _$VehicleViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// De dónde salieron los datos técnicos.
enum VehicleViewDataSourceEnum {
@JsonValue(r'vin_decode')
vinDecode(r'vin_decode'),
@JsonValue(r'manual')
manual(r'manual');

const VehicleViewDataSourceEnum(this.value);

final String value;

@override
String toString() => value;
}


