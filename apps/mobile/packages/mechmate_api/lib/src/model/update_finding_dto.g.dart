// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_finding_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$UpdateFindingDtoCWProxy {
  UpdateFindingDto area(String? area);

  UpdateFindingDto title(String? title);

  UpdateFindingDto severity(UpdateFindingDtoSeverityEnum? severity);

  UpdateFindingDto notes(String? notes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateFindingDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateFindingDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateFindingDto call({
    String? area,
    String? title,
    UpdateFindingDtoSeverityEnum? severity,
    String? notes,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfUpdateFindingDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfUpdateFindingDto.copyWith.fieldName(...)`
class _$UpdateFindingDtoCWProxyImpl implements _$UpdateFindingDtoCWProxy {
  const _$UpdateFindingDtoCWProxyImpl(this._value);

  final UpdateFindingDto _value;

  @override
  UpdateFindingDto area(String? area) => this(area: area);

  @override
  UpdateFindingDto title(String? title) => this(title: title);

  @override
  UpdateFindingDto severity(UpdateFindingDtoSeverityEnum? severity) =>
      this(severity: severity);

  @override
  UpdateFindingDto notes(String? notes) => this(notes: notes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateFindingDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateFindingDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateFindingDto call({
    Object? area = const $CopyWithPlaceholder(),
    Object? title = const $CopyWithPlaceholder(),
    Object? severity = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
  }) {
    return UpdateFindingDto(
      area: area == const $CopyWithPlaceholder()
          ? _value.area
          // ignore: cast_nullable_to_non_nullable
          : area as String?,
      title: title == const $CopyWithPlaceholder()
          ? _value.title
          // ignore: cast_nullable_to_non_nullable
          : title as String?,
      severity: severity == const $CopyWithPlaceholder()
          ? _value.severity
          // ignore: cast_nullable_to_non_nullable
          : severity as UpdateFindingDtoSeverityEnum?,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
    );
  }
}

extension $UpdateFindingDtoCopyWith on UpdateFindingDto {
  /// Returns a callable class that can be used as follows: `instanceOfUpdateFindingDto.copyWith(...)` or like so:`instanceOfUpdateFindingDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$UpdateFindingDtoCWProxy get copyWith => _$UpdateFindingDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateFindingDto _$UpdateFindingDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('UpdateFindingDto', json, ($checkedConvert) {
      final val = UpdateFindingDto(
        area: $checkedConvert('area', (v) => v as String?),
        title: $checkedConvert('title', (v) => v as String?),
        severity: $checkedConvert(
          'severity',
          (v) => $enumDecodeNullable(_$UpdateFindingDtoSeverityEnumEnumMap, v),
        ),
        notes: $checkedConvert('notes', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$UpdateFindingDtoToJson(UpdateFindingDto instance) =>
    <String, dynamic>{
      'area': ?instance.area,
      'title': ?instance.title,
      'severity': ?_$UpdateFindingDtoSeverityEnumEnumMap[instance.severity],
      'notes': ?instance.notes,
    };

const _$UpdateFindingDtoSeverityEnumEnumMap = {
  UpdateFindingDtoSeverityEnum.ok: 'ok',
  UpdateFindingDtoSeverityEnum.attention: 'attention',
  UpdateFindingDtoSeverityEnum.urgent: 'urgent',
};
