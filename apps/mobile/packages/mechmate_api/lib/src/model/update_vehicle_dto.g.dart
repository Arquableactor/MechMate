// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_vehicle_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$UpdateVehicleDtoCWProxy {
  UpdateVehicleDto customerId(String? customerId);

  UpdateVehicleDto vin(String? vin);

  UpdateVehicleDto chassisNumber(String? chassisNumber);

  UpdateVehicleDto plate(String? plate);

  UpdateVehicleDto make(String? make);

  UpdateVehicleDto model(String? model);

  UpdateVehicleDto year(int? year);

  UpdateVehicleDto trim(String? trim);

  UpdateVehicleDto engine(String? engine);

  UpdateVehicleDto fuelType(String? fuelType);

  UpdateVehicleDto color(String? color);

  UpdateVehicleDto mileageKm(int? mileageKm);

  UpdateVehicleDto notes(String? notes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateVehicleDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateVehicleDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateVehicleDto call({
    String? customerId,
    String? vin,
    String? chassisNumber,
    String? plate,
    String? make,
    String? model,
    int? year,
    String? trim,
    String? engine,
    String? fuelType,
    String? color,
    int? mileageKm,
    String? notes,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfUpdateVehicleDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfUpdateVehicleDto.copyWith.fieldName(...)`
class _$UpdateVehicleDtoCWProxyImpl implements _$UpdateVehicleDtoCWProxy {
  const _$UpdateVehicleDtoCWProxyImpl(this._value);

  final UpdateVehicleDto _value;

  @override
  UpdateVehicleDto customerId(String? customerId) =>
      this(customerId: customerId);

  @override
  UpdateVehicleDto vin(String? vin) => this(vin: vin);

  @override
  UpdateVehicleDto chassisNumber(String? chassisNumber) =>
      this(chassisNumber: chassisNumber);

  @override
  UpdateVehicleDto plate(String? plate) => this(plate: plate);

  @override
  UpdateVehicleDto make(String? make) => this(make: make);

  @override
  UpdateVehicleDto model(String? model) => this(model: model);

  @override
  UpdateVehicleDto year(int? year) => this(year: year);

  @override
  UpdateVehicleDto trim(String? trim) => this(trim: trim);

  @override
  UpdateVehicleDto engine(String? engine) => this(engine: engine);

  @override
  UpdateVehicleDto fuelType(String? fuelType) => this(fuelType: fuelType);

  @override
  UpdateVehicleDto color(String? color) => this(color: color);

  @override
  UpdateVehicleDto mileageKm(int? mileageKm) => this(mileageKm: mileageKm);

  @override
  UpdateVehicleDto notes(String? notes) => this(notes: notes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateVehicleDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateVehicleDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateVehicleDto call({
    Object? customerId = const $CopyWithPlaceholder(),
    Object? vin = const $CopyWithPlaceholder(),
    Object? chassisNumber = const $CopyWithPlaceholder(),
    Object? plate = const $CopyWithPlaceholder(),
    Object? make = const $CopyWithPlaceholder(),
    Object? model = const $CopyWithPlaceholder(),
    Object? year = const $CopyWithPlaceholder(),
    Object? trim = const $CopyWithPlaceholder(),
    Object? engine = const $CopyWithPlaceholder(),
    Object? fuelType = const $CopyWithPlaceholder(),
    Object? color = const $CopyWithPlaceholder(),
    Object? mileageKm = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
  }) {
    return UpdateVehicleDto(
      customerId: customerId == const $CopyWithPlaceholder()
          ? _value.customerId
          // ignore: cast_nullable_to_non_nullable
          : customerId as String?,
      vin: vin == const $CopyWithPlaceholder()
          ? _value.vin
          // ignore: cast_nullable_to_non_nullable
          : vin as String?,
      chassisNumber: chassisNumber == const $CopyWithPlaceholder()
          ? _value.chassisNumber
          // ignore: cast_nullable_to_non_nullable
          : chassisNumber as String?,
      plate: plate == const $CopyWithPlaceholder()
          ? _value.plate
          // ignore: cast_nullable_to_non_nullable
          : plate as String?,
      make: make == const $CopyWithPlaceholder()
          ? _value.make
          // ignore: cast_nullable_to_non_nullable
          : make as String?,
      model: model == const $CopyWithPlaceholder()
          ? _value.model
          // ignore: cast_nullable_to_non_nullable
          : model as String?,
      year: year == const $CopyWithPlaceholder()
          ? _value.year
          // ignore: cast_nullable_to_non_nullable
          : year as int?,
      trim: trim == const $CopyWithPlaceholder()
          ? _value.trim
          // ignore: cast_nullable_to_non_nullable
          : trim as String?,
      engine: engine == const $CopyWithPlaceholder()
          ? _value.engine
          // ignore: cast_nullable_to_non_nullable
          : engine as String?,
      fuelType: fuelType == const $CopyWithPlaceholder()
          ? _value.fuelType
          // ignore: cast_nullable_to_non_nullable
          : fuelType as String?,
      color: color == const $CopyWithPlaceholder()
          ? _value.color
          // ignore: cast_nullable_to_non_nullable
          : color as String?,
      mileageKm: mileageKm == const $CopyWithPlaceholder()
          ? _value.mileageKm
          // ignore: cast_nullable_to_non_nullable
          : mileageKm as int?,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
    );
  }
}

extension $UpdateVehicleDtoCopyWith on UpdateVehicleDto {
  /// Returns a callable class that can be used as follows: `instanceOfUpdateVehicleDto.copyWith(...)` or like so:`instanceOfUpdateVehicleDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$UpdateVehicleDtoCWProxy get copyWith => _$UpdateVehicleDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateVehicleDto _$UpdateVehicleDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'UpdateVehicleDto',
      json,
      ($checkedConvert) {
        final val = UpdateVehicleDto(
          customerId: $checkedConvert('customer_id', (v) => v as String?),
          vin: $checkedConvert('vin', (v) => v as String?),
          chassisNumber: $checkedConvert('chassis_number', (v) => v as String?),
          plate: $checkedConvert('plate', (v) => v as String?),
          make: $checkedConvert('make', (v) => v as String?),
          model: $checkedConvert('model', (v) => v as String?),
          year: $checkedConvert('year', (v) => (v as num?)?.toInt()),
          trim: $checkedConvert('trim', (v) => v as String?),
          engine: $checkedConvert('engine', (v) => v as String?),
          fuelType: $checkedConvert('fuel_type', (v) => v as String?),
          color: $checkedConvert('color', (v) => v as String?),
          mileageKm: $checkedConvert('mileage_km', (v) => (v as num?)?.toInt()),
          notes: $checkedConvert('notes', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {
        'customerId': 'customer_id',
        'chassisNumber': 'chassis_number',
        'fuelType': 'fuel_type',
        'mileageKm': 'mileage_km',
      },
    );

Map<String, dynamic> _$UpdateVehicleDtoToJson(UpdateVehicleDto instance) =>
    <String, dynamic>{
      'customer_id': ?instance.customerId,
      'vin': ?instance.vin,
      'chassis_number': ?instance.chassisNumber,
      'plate': ?instance.plate,
      'make': ?instance.make,
      'model': ?instance.model,
      'year': ?instance.year,
      'trim': ?instance.trim,
      'engine': ?instance.engine,
      'fuel_type': ?instance.fuelType,
      'color': ?instance.color,
      'mileage_km': ?instance.mileageKm,
      'notes': ?instance.notes,
    };
