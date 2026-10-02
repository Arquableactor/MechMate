// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vin_decode_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$VinDecodeViewCWProxy {
  VinDecodeView vin(String vin);

  VinDecodeView checkDigitValid(bool checkDigitValid);

  VinDecodeView found(bool found);

  VinDecodeView source_(String? source_);

  VinDecodeView providerUnavailable(bool providerUnavailable);

  VinDecodeView vehicle(DecodedVehicleView? vehicle);

  VinDecodeView warnings(List<String> warnings);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `VinDecodeView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// VinDecodeView(...).copyWith(id: 12, name: "My name")
  /// ````
  VinDecodeView call({
    String vin,
    bool checkDigitValid,
    bool found,
    String? source_,
    bool providerUnavailable,
    DecodedVehicleView? vehicle,
    List<String> warnings,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfVinDecodeView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfVinDecodeView.copyWith.fieldName(...)`
class _$VinDecodeViewCWProxyImpl implements _$VinDecodeViewCWProxy {
  const _$VinDecodeViewCWProxyImpl(this._value);

  final VinDecodeView _value;

  @override
  VinDecodeView vin(String vin) => this(vin: vin);

  @override
  VinDecodeView checkDigitValid(bool checkDigitValid) =>
      this(checkDigitValid: checkDigitValid);

  @override
  VinDecodeView found(bool found) => this(found: found);

  @override
  VinDecodeView source_(String? source_) => this(source_: source_);

  @override
  VinDecodeView providerUnavailable(bool providerUnavailable) =>
      this(providerUnavailable: providerUnavailable);

  @override
  VinDecodeView vehicle(DecodedVehicleView? vehicle) => this(vehicle: vehicle);

  @override
  VinDecodeView warnings(List<String> warnings) => this(warnings: warnings);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `VinDecodeView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// VinDecodeView(...).copyWith(id: 12, name: "My name")
  /// ````
  VinDecodeView call({
    Object? vin = const $CopyWithPlaceholder(),
    Object? checkDigitValid = const $CopyWithPlaceholder(),
    Object? found = const $CopyWithPlaceholder(),
    Object? source_ = const $CopyWithPlaceholder(),
    Object? providerUnavailable = const $CopyWithPlaceholder(),
    Object? vehicle = const $CopyWithPlaceholder(),
    Object? warnings = const $CopyWithPlaceholder(),
  }) {
    return VinDecodeView(
      vin: vin == const $CopyWithPlaceholder()
          ? _value.vin
          // ignore: cast_nullable_to_non_nullable
          : vin as String,
      checkDigitValid: checkDigitValid == const $CopyWithPlaceholder()
          ? _value.checkDigitValid
          // ignore: cast_nullable_to_non_nullable
          : checkDigitValid as bool,
      found: found == const $CopyWithPlaceholder()
          ? _value.found
          // ignore: cast_nullable_to_non_nullable
          : found as bool,
      source_: source_ == const $CopyWithPlaceholder()
          ? _value.source_
          // ignore: cast_nullable_to_non_nullable
          : source_ as String?,
      providerUnavailable: providerUnavailable == const $CopyWithPlaceholder()
          ? _value.providerUnavailable
          // ignore: cast_nullable_to_non_nullable
          : providerUnavailable as bool,
      vehicle: vehicle == const $CopyWithPlaceholder()
          ? _value.vehicle
          // ignore: cast_nullable_to_non_nullable
          : vehicle as DecodedVehicleView?,
      warnings: warnings == const $CopyWithPlaceholder()
          ? _value.warnings
          // ignore: cast_nullable_to_non_nullable
          : warnings as List<String>,
    );
  }
}

extension $VinDecodeViewCopyWith on VinDecodeView {
  /// Returns a callable class that can be used as follows: `instanceOfVinDecodeView.copyWith(...)` or like so:`instanceOfVinDecodeView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$VinDecodeViewCWProxy get copyWith => _$VinDecodeViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VinDecodeView _$VinDecodeViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'VinDecodeView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'vin',
            'check_digit_valid',
            'found',
            'source',
            'provider_unavailable',
            'vehicle',
            'warnings',
          ],
        );
        final val = VinDecodeView(
          vin: $checkedConvert('vin', (v) => v as String),
          checkDigitValid: $checkedConvert(
            'check_digit_valid',
            (v) => v as bool,
          ),
          found: $checkedConvert('found', (v) => v as bool),
          source_: $checkedConvert('source', (v) => v as String?),
          providerUnavailable: $checkedConvert(
            'provider_unavailable',
            (v) => v as bool,
          ),
          vehicle: $checkedConvert(
            'vehicle',
            (v) => v == null
                ? null
                : DecodedVehicleView.fromJson(v as Map<String, dynamic>),
          ),
          warnings: $checkedConvert(
            'warnings',
            (v) => (v as List<dynamic>).map((e) => e as String).toList(),
          ),
        );
        return val;
      },
      fieldKeyMap: const {
        'checkDigitValid': 'check_digit_valid',
        'source_': 'source',
        'providerUnavailable': 'provider_unavailable',
      },
    );

Map<String, dynamic> _$VinDecodeViewToJson(VinDecodeView instance) =>
    <String, dynamic>{
      'vin': instance.vin,
      'check_digit_valid': instance.checkDigitValid,
      'found': instance.found,
      'source': instance.source_,
      'provider_unavailable': instance.providerUnavailable,
      'vehicle': instance.vehicle?.toJson(),
      'warnings': instance.warnings,
    };
