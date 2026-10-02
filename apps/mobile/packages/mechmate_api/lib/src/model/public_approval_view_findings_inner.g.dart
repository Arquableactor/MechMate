// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_approval_view_findings_inner.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$PublicApprovalViewFindingsInnerCWProxy {
  PublicApprovalViewFindingsInner area(String area);

  PublicApprovalViewFindingsInner title(String title);

  PublicApprovalViewFindingsInner severity(FindingSeverity severity);

  PublicApprovalViewFindingsInner notes(String? notes);

  PublicApprovalViewFindingsInner photoUrls(List<String> photoUrls);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PublicApprovalViewFindingsInner(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PublicApprovalViewFindingsInner(...).copyWith(id: 12, name: "My name")
  /// ````
  PublicApprovalViewFindingsInner call({
    String area,
    String title,
    FindingSeverity severity,
    String? notes,
    List<String> photoUrls,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfPublicApprovalViewFindingsInner.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfPublicApprovalViewFindingsInner.copyWith.fieldName(...)`
class _$PublicApprovalViewFindingsInnerCWProxyImpl
    implements _$PublicApprovalViewFindingsInnerCWProxy {
  const _$PublicApprovalViewFindingsInnerCWProxyImpl(this._value);

  final PublicApprovalViewFindingsInner _value;

  @override
  PublicApprovalViewFindingsInner area(String area) => this(area: area);

  @override
  PublicApprovalViewFindingsInner title(String title) => this(title: title);

  @override
  PublicApprovalViewFindingsInner severity(FindingSeverity severity) =>
      this(severity: severity);

  @override
  PublicApprovalViewFindingsInner notes(String? notes) => this(notes: notes);

  @override
  PublicApprovalViewFindingsInner photoUrls(List<String> photoUrls) =>
      this(photoUrls: photoUrls);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PublicApprovalViewFindingsInner(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PublicApprovalViewFindingsInner(...).copyWith(id: 12, name: "My name")
  /// ````
  PublicApprovalViewFindingsInner call({
    Object? area = const $CopyWithPlaceholder(),
    Object? title = const $CopyWithPlaceholder(),
    Object? severity = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? photoUrls = const $CopyWithPlaceholder(),
  }) {
    return PublicApprovalViewFindingsInner(
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
      photoUrls: photoUrls == const $CopyWithPlaceholder()
          ? _value.photoUrls
          // ignore: cast_nullable_to_non_nullable
          : photoUrls as List<String>,
    );
  }
}

extension $PublicApprovalViewFindingsInnerCopyWith
    on PublicApprovalViewFindingsInner {
  /// Returns a callable class that can be used as follows: `instanceOfPublicApprovalViewFindingsInner.copyWith(...)` or like so:`instanceOfPublicApprovalViewFindingsInner.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$PublicApprovalViewFindingsInnerCWProxy get copyWith =>
      _$PublicApprovalViewFindingsInnerCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicApprovalViewFindingsInner _$PublicApprovalViewFindingsInnerFromJson(
  Map<String, dynamic> json,
) => $checkedCreate(
  'PublicApprovalViewFindingsInner',
  json,
  ($checkedConvert) {
    $checkKeys(
      json,
      requiredKeys: const ['area', 'title', 'severity', 'notes', 'photo_urls'],
    );
    final val = PublicApprovalViewFindingsInner(
      area: $checkedConvert('area', (v) => v as String),
      title: $checkedConvert('title', (v) => v as String),
      severity: $checkedConvert(
        'severity',
        (v) => $enumDecode(_$FindingSeverityEnumMap, v),
      ),
      notes: $checkedConvert('notes', (v) => v as String?),
      photoUrls: $checkedConvert(
        'photo_urls',
        (v) => (v as List<dynamic>).map((e) => e as String).toList(),
      ),
    );
    return val;
  },
  fieldKeyMap: const {'photoUrls': 'photo_urls'},
);

Map<String, dynamic> _$PublicApprovalViewFindingsInnerToJson(
  PublicApprovalViewFindingsInner instance,
) => <String, dynamic>{
  'area': instance.area,
  'title': instance.title,
  'severity': _$FindingSeverityEnumMap[instance.severity]!,
  'notes': instance.notes,
  'photo_urls': instance.photoUrls,
};

const _$FindingSeverityEnumMap = {
  FindingSeverity.ok: 'ok',
  FindingSeverity.attention: 'attention',
  FindingSeverity.urgent: 'urgent',
};
