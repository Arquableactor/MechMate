// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'decoded_vehicle_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$DecodedVehicleViewCWProxy {
  DecodedVehicleView make(String make);

  DecodedVehicleView model(String? model);

  DecodedVehicleView year(int? year);

  DecodedVehicleView trim(String? trim);

  DecodedVehicleView engine(String? engine);

  DecodedVehicleView fuelType(String? fuelType);

  DecodedVehicleView bodyClass(String? bodyClass);

  DecodedVehicleView driveType(String? driveType);

  DecodedVehicleView transmission(String? transmission);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `DecodedVehicleView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// DecodedVehicleView(...).copyWith(id: 12, name: "My name")
  /// ````
  DecodedVehicleView call({
    String make,
    String? model,
    int? year,
    String? trim,
    String? engine,
    String? fuelType,
    String? bodyClass,
    String? driveType,
    String? transmission,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfDecodedVehicleView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfDecodedVehicleView.copyWith.fieldName(...)`
class _$DecodedVehicleViewCWProxyImpl implements _$DecodedVehicleViewCWProxy {
  const _$DecodedVehicleViewCWProxyImpl(this._value);

  final DecodedVehicleView _value;

  @override
  DecodedVehicleView make(String make) => this(make: make);

  @override
  DecodedVehicleView model(String? model) => this(model: model);

  @override
  DecodedVehicleView year(int? year) => this(year: year);

  @override
  DecodedVehicleView trim(String? trim) => this(trim: trim);

  @override
  DecodedVehicleView engine(String? engine) => this(engine: engine);

  @override
  DecodedVehicleView fuelType(String? fuelType) => this(fuelType: fuelType);

  @override
  DecodedVehicleView bodyClass(String? bodyClass) => this(bodyClass: bodyClass);

  @override
  DecodedVehicleView driveType(String? driveType) => this(driveType: driveType);

  @override
  DecodedVehicleView transmission(String? transmission) =>
      this(transmission: transmission);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `DecodedVehicleView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// DecodedVehicleView(...).copyWith(id: 12, name: "My name")
  /// ````
  DecodedVehicleView call({
    Object? make = const $CopyWithPlaceholder(),
    Object? model = const $CopyWithPlaceholder(),
    Object? year = const $CopyWithPlaceholder(),
    Object? trim = const $CopyWithPlaceholder(),
    Object? engine = const $CopyWithPlaceholder(),
    Object? fuelType = const $CopyWithPlaceholder(),
    Object? bodyClass = const $CopyWithPlaceholder(),
    Object? driveType = const $CopyWithPlaceholder(),
    Object? transmission = const $CopyWithPlaceholder(),
  }) {
    return DecodedVehicleView(
      make: make == const $CopyWithPlaceholder()
          ? _value.make
          // ignore: cast_nullable_to_non_nullable
          : make as String,
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
      bodyClass: bodyClass == const $CopyWithPlaceholder()
          ? _value.bodyClass
          // ignore: cast_nullable_to_non_nullable
          : bodyClass as String?,
      driveType: driveType == const $CopyWithPlaceholder()
          ? _value.driveType
          // ignore: cast_nullable_to_non_nullable
          : driveType as String?,
      transmission: transmission == const $CopyWithPlaceholder()
          ? _value.transmission
          // ignore: cast_nullable_to_non_nullable
          : transmission as String?,
    );
  }
}

extension $DecodedVehicleViewCopyWith on DecodedVehicleView {
  /// Returns a callable class that can be used as follows: `instanceOfDecodedVehicleView.copyWith(...)` or like so:`instanceOfDecodedVehicleView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$DecodedVehicleViewCWProxy get copyWith =>
      _$DecodedVehicleViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DecodedVehicleView _$DecodedVehicleViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'DecodedVehicleView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'make',
            'model',
            'year',
            'trim',
            'engine',
            'fuel_type',
            'body_class',
            'drive_type',
            'transmission',
          ],
        );
        final val = DecodedVehicleView(
          make: $checkedConvert('make', (v) => v as String),
          model: $checkedConvert('model', (v) => v as String?),
          year: $checkedConvert('year', (v) => (v as num?)?.toInt()),
          trim: $checkedConvert('trim', (v) => v as String?),
          engine: $checkedConvert('engine', (v) => v as String?),
          fuelType: $checkedConvert('fuel_type', (v) => v as String?),
          bodyClass: $checkedConvert('body_class', (v) => v as String?),
          driveType: $checkedConvert('drive_type', (v) => v as String?),
          transmission: $checkedConvert('transmission', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {
        'fuelType': 'fuel_type',
        'bodyClass': 'body_class',
        'driveType': 'drive_type',
      },
    );

Map<String, dynamic> _$DecodedVehicleViewToJson(DecodedVehicleView instance) =>
    <String, dynamic>{
      'make': instance.make,
      'model': instance.model,
      'year': instance.year,
      'trim': instance.trim,
      'engine': instance.engine,
      'fuel_type': instance.fuelType,
      'body_class': instance.bodyClass,
      'drive_type': instance.driveType,
      'transmission': instance.transmission,
    };
