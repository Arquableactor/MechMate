// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'open_inspection_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$OpenInspectionDtoCWProxy {
  OpenInspectionDto notes(String? notes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `OpenInspectionDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// OpenInspectionDto(...).copyWith(id: 12, name: "My name")
  /// ````
  OpenInspectionDto call({String? notes});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfOpenInspectionDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfOpenInspectionDto.copyWith.fieldName(...)`
class _$OpenInspectionDtoCWProxyImpl implements _$OpenInspectionDtoCWProxy {
  const _$OpenInspectionDtoCWProxyImpl(this._value);

  final OpenInspectionDto _value;

  @override
  OpenInspectionDto notes(String? notes) => this(notes: notes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `OpenInspectionDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// OpenInspectionDto(...).copyWith(id: 12, name: "My name")
  /// ````
  OpenInspectionDto call({Object? notes = const $CopyWithPlaceholder()}) {
    return OpenInspectionDto(
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
    );
  }
}

extension $OpenInspectionDtoCopyWith on OpenInspectionDto {
  /// Returns a callable class that can be used as follows: `instanceOfOpenInspectionDto.copyWith(...)` or like so:`instanceOfOpenInspectionDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$OpenInspectionDtoCWProxy get copyWith =>
      _$OpenInspectionDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OpenInspectionDto _$OpenInspectionDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('OpenInspectionDto', json, ($checkedConvert) {
      final val = OpenInspectionDto(
        notes: $checkedConvert('notes', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$OpenInspectionDtoToJson(OpenInspectionDto instance) =>
    <String, dynamic>{'notes': ?instance.notes};
