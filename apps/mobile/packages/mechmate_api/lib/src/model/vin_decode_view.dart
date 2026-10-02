//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/decoded_vehicle_view.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vin_decode_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VinDecodeView {
  /// Returns a new [VinDecodeView] instance.
  VinDecodeView({

    required  this.vin,

    required  this.checkDigitValid,

    required  this.found,

    required  this.source_,

    required  this.providerUnavailable,

    required  this.vehicle,

    required  this.warnings,
  });

      /// VIN normalizado (mayúsculas, sin espacios ni guiones).
  @JsonKey(
    
    name: r'vin',
    required: true,
    includeIfNull: false,
  )


  final String vin;



      /// Dígito verificador (posición 9). false no invalida: solo es un aviso.
  @JsonKey(
    
    name: r'check_digit_valid',
    required: true,
    includeIfNull: false,
  )


  final bool checkDigitValid;



  @JsonKey(
    
    name: r'found',
    required: true,
    includeIfNull: false,
  )


  final bool found;



      /// De dónde salió: `cache` o el nombre del proveedor (`nhtsa`, `tecdoc`…). null si no se encontró.
  @JsonKey(
    
    name: r'source',
    required: true,
    includeIfNull: true,
  )


  final String? source_;



      /// El proveedor no respondió: se puede reintentar o cargar el vehículo a mano.
  @JsonKey(
    
    name: r'provider_unavailable',
    required: true,
    includeIfNull: false,
  )


  final bool providerUnavailable;



  @JsonKey(
    
    name: r'vehicle',
    required: true,
    includeIfNull: true,
  )


  final DecodedVehicleView? vehicle;



      /// Avisos en español para mostrar al mecánico.
  @JsonKey(
    
    name: r'warnings',
    required: true,
    includeIfNull: false,
  )


  final List<String> warnings;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VinDecodeView &&
      other.vin == vin &&
      other.checkDigitValid == checkDigitValid &&
      other.found == found &&
      other.source_ == source_ &&
      other.providerUnavailable == providerUnavailable &&
      other.vehicle == vehicle &&
      other.warnings == warnings;

    @override
    int get hashCode =>
        vin.hashCode +
        checkDigitValid.hashCode +
        found.hashCode +
        (source_ == null ? 0 : source_.hashCode) +
        providerUnavailable.hashCode +
        (vehicle == null ? 0 : vehicle.hashCode) +
        warnings.hashCode;

  factory VinDecodeView.fromJson(Map<String, dynamic> json) => _$VinDecodeViewFromJson(json);

  Map<String, dynamic> toJson() => _$VinDecodeViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

