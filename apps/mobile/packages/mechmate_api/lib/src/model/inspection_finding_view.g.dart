// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inspection_finding_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InspectionFindingViewCWProxy {
  InspectionFindingView id(String id);

  InspectionFindingView area(String area);

  InspectionFindingView title(String title);

  InspectionFindingView severity(FindingSeverity severity);

  InspectionFindingView notes(String? notes);

  InspectionFindingView photos(List<InspectionPhotoView> photos);

  InspectionFindingView createdAt(String createdAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InspectionFindingView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InspectionFindingView(...).copyWith(id: 12, name: "My name")
  /// ````
  InspectionFindingView call({
    String id,
    String area,
    String title,
    FindingSeverity severity,
    String? notes,
    List<InspectionPhotoView> photos,
    String createdAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInspectionFindingView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInspectionFindingView.copyWith.fieldName(...)`
class _$InspectionFindingViewCWProxyImpl
    implements _$InspectionFindingViewCWProxy {
  const _$InspectionFindingViewCWProxyImpl(this._value);

  final InspectionFindingView _value;

  @override
  InspectionFindingView id(String id) => this(id: id);

  @override
  InspectionFindingView area(String area) => this(area: area);

  @override
  InspectionFindingView title(String title) => this(title: title);

  @override
  InspectionFindingView severity(FindingSeverity severity) =>
      this(severity: severity);

  @override
  InspectionFindingView notes(String? notes) => this(notes: notes);

  @override
  InspectionFindingView photos(List<InspectionPhotoView> photos) =>
      this(photos: photos);

  @override
  InspectionFindingView createdAt(String createdAt) =>
      this(createdAt: createdAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InspectionFindingView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InspectionFindingView(...).copyWith(id: 12, name: "My name")
  /// ````
  InspectionFindingView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? area = const $CopyWithPlaceholder(),
    Object? title = const $CopyWithPlaceholder(),
    Object? severity = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? photos = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
  }) {
    return InspectionFindingView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
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
          : severity as FindingSeverity,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
      photos: photos == const $CopyWithPlaceholder()
          ? _value.photos
          // ignore: cast_nullable_to_non_nullable
          : photos as List<InspectionPhotoView>,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
    );
  }
}

extension $InspectionFindingViewCopyWith on InspectionFindingView {
  /// Returns a callable class that can be used as follows: `instanceOfInspectionFindingView.copyWith(...)` or like so:`instanceOfInspectionFindingView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InspectionFindingViewCWProxy get copyWith =>
      _$InspectionFindingViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InspectionFindingView _$InspectionFindingViewFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('InspectionFindingView', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'area',
      'title',
      'severity',
      'notes',
      'photos',
      'created_at',
    ],
  );
  final val = InspectionFindingView(
    id: $checkedConvert('id', (v) => v as String),
    area: $checkedConvert('area', (v) => v as String),
    title: $checkedConvert('title', (v) => v as String),
    severity: $checkedConvert(
      'severity',
      (v) => $enumDecode(_$FindingSeverityEnumMap, v),
    ),
    notes: $checkedConvert('notes', (v) => v as String?),
    photos: $checkedConvert(
      'photos',
      (v) => (v as List<dynamic>)
          .map((e) => InspectionPhotoView.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    createdAt: $checkedConvert('created_at', (v) => v as String),
  );
  return val;
}, fieldKeyMap: const {'createdAt': 'created_at'});

Map<String, dynamic> _$InspectionFindingViewToJson(
  InspectionFindingView instance,
) => <String, dynamic>{
  'id': instance.id,
  'area': instance.area,
  'title': instance.title,
  'severity': _$FindingSeverityEnumMap[instance.severity]!,
  'notes': instance.notes,
  'photos': instance.photos.map((e) => e.toJson()).toList(),
  'created_at': instance.createdAt,
};

const _$FindingSeverityEnumMap = {
  FindingSeverity.ok: 'ok',
  FindingSeverity.attention: 'attention',
  FindingSeverity.urgent: 'urgent',
};
