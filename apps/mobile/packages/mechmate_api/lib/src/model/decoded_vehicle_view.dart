//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'decoded_vehicle_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class DecodedVehicleView {
  /// Returns a new [DecodedVehicleView] instance.
  DecodedVehicleView({

    required  this.make,

    required  this.model,

    required  this.year,

    required  this.trim,

    required  this.engine,

    required  this.fuelType,

    required  this.bodyClass,

    required  this.driveType,

    required  this.transmission,
  });

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



      /// Legible: `3.0L V6`, `1.8L 4 cil.`
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
    
    name: r'body_class',
    required: true,
    includeIfNull: true,
  )


  final String? bodyClass;



  @JsonKey(
    
    name: r'drive_type',
    required: true,
    includeIfNull: true,
  )


  final String? driveType;



  @JsonKey(
    
    name: r'transmission',
    required: true,
    includeIfNull: true,
  )


  final String? transmission;





    @override
    bool operator ==(Object other) => identical(this, other) || other is DecodedVehicleView &&
      other.make == make &&
      other.model == model &&
      other.year == year &&
      other.trim == trim &&
      other.engine == engine &&
      other.fuelType == fuelType &&
      other.bodyClass == bodyClass &&
      other.driveType == driveType &&
      other.transmission == transmission;

    @override
    int get hashCode =>
        make.hashCode +
        (model == null ? 0 : model.hashCode) +
        (year == null ? 0 : year.hashCode) +
        (trim == null ? 0 : trim.hashCode) +
        (engine == null ? 0 : engine.hashCode) +
        (fuelType == null ? 0 : fuelType.hashCode) +
        (bodyClass == null ? 0 : bodyClass.hashCode) +
        (driveType == null ? 0 : driveType.hashCode) +
        (transmission == null ? 0 : transmission.hashCode);

  factory DecodedVehicleView.fromJson(Map<String, dynamic> json) => _$DecodedVehicleViewFromJson(json);

  Map<String, dynamic> toJson() => _$DecodedVehicleViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

