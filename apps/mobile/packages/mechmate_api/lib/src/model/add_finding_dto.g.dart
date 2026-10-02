// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_finding_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$AddFindingDtoCWProxy {
  AddFindingDto area(String area);

  AddFindingDto title(String title);

  AddFindingDto severity(AddFindingDtoSeverityEnum severity);

  AddFindingDto notes(String? notes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `AddFindingDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// AddFindingDto(...).copyWith(id: 12, name: "My name")
  /// ````
  AddFindingDto call({
    String area,
    String title,
    AddFindingDtoSeverityEnum severity,
    String? notes,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfAddFindingDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfAddFindingDto.copyWith.fieldName(...)`
class _$AddFindingDtoCWProxyImpl implements _$AddFindingDtoCWProxy {
  const _$AddFindingDtoCWProxyImpl(this._value);

  final AddFindingDto _value;

  @override
  AddFindingDto area(String area) => this(area: area);

  @override
  AddFindingDto title(String title) => this(title: title);

  @override
  AddFindingDto severity(AddFindingDtoSeverityEnum severity) =>
      this(severity: severity);

  @override
  AddFindingDto notes(String? notes) => this(notes: notes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `AddFindingDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// AddFindingDto(...).copyWith(id: 12, name: "My name")
  /// ````
  AddFindingDto call({
    Object? area = const $CopyWithPlaceholder(),
    Object? title = const $CopyWithPlaceholder(),
    Object? severity = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
  }) {
    return AddFindingDto(
      area: area == const $CopyWithPlaceholder()
          ? _value.area
          // ignore: cast_nullable_to_non_nullable
          : area as String,
      title: title == const $CopyWithPlaceholder()
          ? _value.title
          // ignore: cast_nullable_to_non_nullable
          : title as String,
      severity: severity == const $CopyWithPlaceholder()
          ? _value.severity
          // ignore: cast_nullable_to_non_nullable
          : severity as AddFindingDtoSeverityEnum,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
    );
  }
}

extension $AddFindingDtoCopyWith on AddFindingDto {
  /// Returns a callable class that can be used as follows: `instanceOfAddFindingDto.copyWith(...)` or like so:`instanceOfAddFindingDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$AddFindingDtoCWProxy get copyWith => _$AddFindingDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddFindingDto _$AddFindingDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('AddFindingDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['area', 'title', 'severity']);
      final val = AddFindingDto(
        area: $checkedConvert('area', (v) => v as String),
        title: $checkedConvert('title', (v) => v as String),
        severity: $checkedConvert(
          'severity',
          (v) => $enumDecode(_$AddFindingDtoSeverityEnumEnumMap, v),
        ),
        notes: $checkedConvert('notes', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$AddFindingDtoToJson(AddFindingDto instance) =>
    <String, dynamic>{
      'area': instance.area,
      'title': instance.title,
      'severity': _$AddFindingDtoSeverityEnumEnumMap[instance.severity]!,
      'notes': ?instance.notes,
    };

const _$AddFindingDtoSeverityEnumEnumMap = {
  AddFindingDtoSeverityEnum.ok: 'ok',
  AddFindingDtoSeverityEnum.attention: 'attention',
  AddFindingDtoSeverityEnum.urgent: 'urgent',
};
