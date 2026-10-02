//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vehicle_summary.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VehicleSummary {
  /// Returns a new [VehicleSummary] instance.
  VehicleSummary({

    required  this.id,

    required  this.make,

    required  this.model,

    required  this.year,

    required  this.plate,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



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
    
    name: r'plate',
    required: true,
    includeIfNull: true,
  )


  final String? plate;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VehicleSummary &&
      other.id == id &&
      other.make == make &&
      other.model == model &&
      other.year == year &&
      other.plate == plate;

    @override
    int get hashCode =>
        id.hashCode +
        make.hashCode +
        (model == null ? 0 : model.hashCode) +
        (year == null ? 0 : year.hashCode) +
        (plate == null ? 0 : plate.hashCode);

  factory VehicleSummary.fromJson(Map<String, dynamic> json) => _$VehicleSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$VehicleSummaryToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

