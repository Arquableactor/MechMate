// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_photo_upload_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$RequestPhotoUploadDtoCWProxy {
  RequestPhotoUploadDto contentType(
    RequestPhotoUploadDtoContentTypeEnum contentType,
  );

  RequestPhotoUploadDto sizeBytes(num sizeBytes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `RequestPhotoUploadDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// RequestPhotoUploadDto(...).copyWith(id: 12, name: "My name")
  /// ````
  RequestPhotoUploadDto call({
    RequestPhotoUploadDtoContentTypeEnum contentType,
    num sizeBytes,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfRequestPhotoUploadDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfRequestPhotoUploadDto.copyWith.fieldName(...)`
class _$RequestPhotoUploadDtoCWProxyImpl
    implements _$RequestPhotoUploadDtoCWProxy {
  const _$RequestPhotoUploadDtoCWProxyImpl(this._value);

  final RequestPhotoUploadDto _value;

  @override
  RequestPhotoUploadDto contentType(
    RequestPhotoUploadDtoContentTypeEnum contentType,
  ) => this(contentType: contentType);

  @override
  RequestPhotoUploadDto sizeBytes(num sizeBytes) => this(sizeBytes: sizeBytes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `RequestPhotoUploadDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// RequestPhotoUploadDto(...).copyWith(id: 12, name: "My name")
  /// ````
  RequestPhotoUploadDto call({
    Object? contentType = const $CopyWithPlaceholder(),
    Object? sizeBytes = const $CopyWithPlaceholder(),
  }) {
    return RequestPhotoUploadDto(
      contentType: contentType == const $CopyWithPlaceholder()
          ? _value.contentType
          // ignore: cast_nullable_to_non_nullable
          : contentType as RequestPhotoUploadDtoContentTypeEnum,
      sizeBytes: sizeBytes == const $CopyWithPlaceholder()
          ? _value.sizeBytes
          // ignore: cast_nullable_to_non_nullable
          : sizeBytes as num,
    );
  }
}

extension $RequestPhotoUploadDtoCopyWith on RequestPhotoUploadDto {
  /// Returns a callable class that can be used as follows: `instanceOfRequestPhotoUploadDto.copyWith(...)` or like so:`instanceOfRequestPhotoUploadDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$RequestPhotoUploadDtoCWProxy get copyWith =>
      _$RequestPhotoUploadDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RequestPhotoUploadDto _$RequestPhotoUploadDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate(
  'RequestPhotoUploadDto',
  json,
  ($checkedConvert) {
    $checkKeys(json, requiredKeys: const ['content_type', 'size_bytes']);
    final val = RequestPhotoUploadDto(
      contentType: $checkedConvert(
        'content_type',
        (v) => $enumDecode(_$RequestPhotoUploadDtoContentTypeEnumEnumMap, v),
      ),
      sizeBytes: $checkedConvert('size_bytes', (v) => v as num),
    );
    return val;
  },
  fieldKeyMap: const {'contentType': 'content_type', 'sizeBytes': 'size_bytes'},
);

Map<String, dynamic> _$RequestPhotoUploadDtoToJson(
  RequestPhotoUploadDto instance,
) => <String, dynamic>{
  'content_type':
      _$RequestPhotoUploadDtoContentTypeEnumEnumMap[instance.contentType]!,
  'size_bytes': instance.sizeBytes,
};

const _$RequestPhotoUploadDtoContentTypeEnumEnumMap = {
  RequestPhotoUploadDtoContentTypeEnum.imageSlashJpeg: 'image/jpeg',
  RequestPhotoUploadDtoContentTypeEnum.imageSlashPng: 'image/png',
  RequestPhotoUploadDtoContentTypeEnum.imageSlashWebp: 'image/webp',
  RequestPhotoUploadDtoContentTypeEnum.imageSlashHeic: 'image/heic',
};
