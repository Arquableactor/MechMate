// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inspection_photo_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InspectionPhotoViewCWProxy {
  InspectionPhotoView id(String id);

  InspectionPhotoView status(InspectionPhotoViewStatusEnum status);

  InspectionPhotoView contentType(String contentType);

  InspectionPhotoView sizeBytes(int sizeBytes);

  InspectionPhotoView url(String? url);

  InspectionPhotoView urlExpiresAt(String? urlExpiresAt);

  InspectionPhotoView createdAt(String createdAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InspectionPhotoView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InspectionPhotoView(...).copyWith(id: 12, name: "My name")
  /// ````
  InspectionPhotoView call({
    String id,
    InspectionPhotoViewStatusEnum status,
    String contentType,
    int sizeBytes,
    String? url,
    String? urlExpiresAt,
    String createdAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInspectionPhotoView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInspectionPhotoView.copyWith.fieldName(...)`
class _$InspectionPhotoViewCWProxyImpl implements _$InspectionPhotoViewCWProxy {
  const _$InspectionPhotoViewCWProxyImpl(this._value);

  final InspectionPhotoView _value;

  @override
  InspectionPhotoView id(String id) => this(id: id);

  @override
  InspectionPhotoView status(InspectionPhotoViewStatusEnum status) =>
      this(status: status);

  @override
  InspectionPhotoView contentType(String contentType) =>
      this(contentType: contentType);

  @override
  InspectionPhotoView sizeBytes(int sizeBytes) => this(sizeBytes: sizeBytes);

  @override
  InspectionPhotoView url(String? url) => this(url: url);

  @override
  InspectionPhotoView urlExpiresAt(String? urlExpiresAt) =>
      this(urlExpiresAt: urlExpiresAt);

  @override
  InspectionPhotoView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InspectionPhotoView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InspectionPhotoView(...).copyWith(id: 12, name: "My name")
  /// ````
  InspectionPhotoView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? contentType = const $CopyWithPlaceholder(),
    Object? sizeBytes = const $CopyWithPlaceholder(),
    Object? url = const $CopyWithPlaceholder(),
    Object? urlExpiresAt = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
  }) {
    return InspectionPhotoView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as InspectionPhotoViewStatusEnum,
      contentType: contentType == const $CopyWithPlaceholder()
          ? _value.contentType
          // ignore: cast_nullable_to_non_nullable
          : contentType as String,
      sizeBytes: sizeBytes == const $CopyWithPlaceholder()
          ? _value.sizeBytes
          // ignore: cast_nullable_to_non_nullable
          : sizeBytes as int,
      url: url == const $CopyWithPlaceholder()
          ? _value.url
          // ignore: cast_nullable_to_non_nullable
          : url as String?,
      urlExpiresAt: urlExpiresAt == const $CopyWithPlaceholder()
          ? _value.urlExpiresAt
          // ignore: cast_nullable_to_non_nullable
          : urlExpiresAt as String?,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
    );
  }
}

extension $InspectionPhotoViewCopyWith on InspectionPhotoView {
  /// Returns a callable class that can be used as follows: `instanceOfInspectionPhotoView.copyWith(...)` or like so:`instanceOfInspectionPhotoView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InspectionPhotoViewCWProxy get copyWith =>
      _$InspectionPhotoViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InspectionPhotoView _$InspectionPhotoViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'InspectionPhotoView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'status',
            'content_type',
            'size_bytes',
            'url',
            'url_expires_at',
            'created_at',
          ],
        );
        final val = InspectionPhotoView(
          id: $checkedConvert('id', (v) => v as String),
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$InspectionPhotoViewStatusEnumEnumMap, v),
          ),
          contentType: $checkedConvert('content_type', (v) => v as String),
          sizeBytes: $checkedConvert('size_bytes', (v) => (v as num).toInt()),
          url: $checkedConvert('url', (v) => v as String?),
          urlExpiresAt: $checkedConvert('url_expires_at', (v) => v as String?),
          createdAt: $checkedConvert('created_at', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'contentType': 'content_type',
        'sizeBytes': 'size_bytes',
        'urlExpiresAt': 'url_expires_at',
        'createdAt': 'created_at',
      },
    );

Map<String, dynamic> _$InspectionPhotoViewToJson(
  InspectionPhotoView instance,
) => <String, dynamic>{
  'id': instance.id,
  'status': _$InspectionPhotoViewStatusEnumEnumMap[instance.status]!,
  'content_type': instance.contentType,
  'size_bytes': instance.sizeBytes,
  'url': instance.url,
  'url_expires_at': instance.urlExpiresAt,
  'created_at': instance.createdAt,
};

const _$InspectionPhotoViewStatusEnumEnumMap = {
  InspectionPhotoViewStatusEnum.pending: 'pending',
  InspectionPhotoViewStatusEnum.uploaded: 'uploaded',
};
