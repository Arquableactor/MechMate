// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'photo_upload_view_upload.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$PhotoUploadViewUploadCWProxy {
  PhotoUploadViewUpload url(String url);

  PhotoUploadViewUpload method(PhotoUploadViewUploadMethodEnum method);

  PhotoUploadViewUpload headers(Map<String, String> headers);

  PhotoUploadViewUpload expiresAt(String expiresAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PhotoUploadViewUpload(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PhotoUploadViewUpload(...).copyWith(id: 12, name: "My name")
  /// ````
  PhotoUploadViewUpload call({
    String url,
    PhotoUploadViewUploadMethodEnum method,
    Map<String, String> headers,
    String expiresAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfPhotoUploadViewUpload.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfPhotoUploadViewUpload.copyWith.fieldName(...)`
class _$PhotoUploadViewUploadCWProxyImpl
    implements _$PhotoUploadViewUploadCWProxy {
  const _$PhotoUploadViewUploadCWProxyImpl(this._value);

  final PhotoUploadViewUpload _value;

  @override
  PhotoUploadViewUpload url(String url) => this(url: url);

  @override
  PhotoUploadViewUpload method(PhotoUploadViewUploadMethodEnum method) =>
      this(method: method);

  @override
  PhotoUploadViewUpload headers(Map<String, String> headers) =>
      this(headers: headers);

  @override
  PhotoUploadViewUpload expiresAt(String expiresAt) =>
      this(expiresAt: expiresAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PhotoUploadViewUpload(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PhotoUploadViewUpload(...).copyWith(id: 12, name: "My name")
  /// ````
  PhotoUploadViewUpload call({
    Object? url = const $CopyWithPlaceholder(),
    Object? method = const $CopyWithPlaceholder(),
    Object? headers = const $CopyWithPlaceholder(),
    Object? expiresAt = const $CopyWithPlaceholder(),
  }) {
    return PhotoUploadViewUpload(
      url: url == const $CopyWithPlaceholder()
          ? _value.url
          // ignore: cast_nullable_to_non_nullable
          : url as String,
      method: method == const $CopyWithPlaceholder()
          ? _value.method
          // ignore: cast_nullable_to_non_nullable
          : method as PhotoUploadViewUploadMethodEnum,
      headers: headers == const $CopyWithPlaceholder()
          ? _value.headers
          // ignore: cast_nullable_to_non_nullable
          : headers as Map<String, String>,
      expiresAt: expiresAt == const $CopyWithPlaceholder()
          ? _value.expiresAt
          // ignore: cast_nullable_to_non_nullable
          : expiresAt as String,
    );
  }
}

extension $PhotoUploadViewUploadCopyWith on PhotoUploadViewUpload {
  /// Returns a callable class that can be used as follows: `instanceOfPhotoUploadViewUpload.copyWith(...)` or like so:`instanceOfPhotoUploadViewUpload.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$PhotoUploadViewUploadCWProxy get copyWith =>
      _$PhotoUploadViewUploadCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PhotoUploadViewUpload _$PhotoUploadViewUploadFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PhotoUploadViewUpload', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['url', 'method', 'headers', 'expires_at'],
  );
  final val = PhotoUploadViewUpload(
    url: $checkedConvert('url', (v) => v as String),
    method: $checkedConvert(
      'method',
      (v) => $enumDecode(_$PhotoUploadViewUploadMethodEnumEnumMap, v),
    ),
    headers: $checkedConvert(
      'headers',
      (v) => Map<String, String>.from(v as Map),
    ),
    expiresAt: $checkedConvert('expires_at', (v) => v as String),
  );
  return val;
}, fieldKeyMap: const {'expiresAt': 'expires_at'});

Map<String, dynamic> _$PhotoUploadViewUploadToJson(
  PhotoUploadViewUpload instance,
) => <String, dynamic>{
  'url': instance.url,
  'method': _$PhotoUploadViewUploadMethodEnumEnumMap[instance.method]!,
  'headers': instance.headers,
  'expires_at': instance.expiresAt,
};

const _$PhotoUploadViewUploadMethodEnumEnumMap = {
  PhotoUploadViewUploadMethodEnum.PUT: 'PUT',
};
