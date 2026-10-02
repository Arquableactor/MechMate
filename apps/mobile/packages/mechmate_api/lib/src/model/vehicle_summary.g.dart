// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_summary.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$VehicleSummaryCWProxy {
  VehicleSummary id(String id);

  VehicleSummary make(String make);

  VehicleSummary model(String? model);

  VehicleSummary year(int? year);

  VehicleSummary plate(String? plate);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `VehicleSummary(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// VehicleSummary(...).copyWith(id: 12, name: "My name")
  /// ````
  VehicleSummary call({
    String id,
    String make,
    String? model,
    int? year,
    String? plate,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfVehicleSummary.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfVehicleSummary.copyWith.fieldName(...)`
class _$VehicleSummaryCWProxyImpl implements _$VehicleSummaryCWProxy {
  const _$VehicleSummaryCWProxyImpl(this._value);

  final VehicleSummary _value;

  @override
  VehicleSummary id(String id) => this(id: id);

  @override
  VehicleSummary make(String make) => this(make: make);

  @override
  VehicleSummary model(String? model) => this(model: model);

  @override
  VehicleSummary year(int? year) => this(year: year);

  @override
  VehicleSummary plate(String? plate) => this(plate: plate);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `VehicleSummary(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// VehicleSummary(...).copyWith(id: 12, name: "My name")
  /// ````
  VehicleSummary call({
    Object? id = const $CopyWithPlaceholder(),
    Object? make = const $CopyWithPlaceholder(),
    Object? model = const $CopyWithPlaceholder(),
    Object? year = const $CopyWithPlaceholder(),
    Object? plate = const $CopyWithPlaceholder(),
  }) {
    return VehicleSummary(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
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
      plate: plate == const $CopyWithPlaceholder()
          ? _value.plate
          // ignore: cast_nullable_to_non_nullable
          : plate as String?,
    );
  }
}

extension $VehicleSummaryCopyWith on VehicleSummary {
  /// Returns a callable class that can be used as follows: `instanceOfVehicleSummary.copyWith(...)` or like so:`instanceOfVehicleSummary.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$VehicleSummaryCWProxy get copyWith => _$VehicleSummaryCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VehicleSummary _$VehicleSummaryFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VehicleSummary', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const ['id', 'make', 'model', 'year', 'plate'],
      );
      final val = VehicleSummary(
        id: $checkedConvert('id', (v) => v as String),
        make: $checkedConvert('make', (v) => v as String),
        model: $checkedConvert('model', (v) => v as String?),
        year: $checkedConvert('year', (v) => (v as num?)?.toInt()),
        plate: $checkedConvert('plate', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$VehicleSummaryToJson(VehicleSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'make': instance.make,
      'model': instance.model,
      'year': instance.year,
      'plate': instance.plate,
    };
