// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'photo_upload_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$PhotoUploadViewCWProxy {
  PhotoUploadView photo(InspectionPhotoView photo);

  PhotoUploadView upload(PhotoUploadViewUpload upload);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PhotoUploadView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PhotoUploadView(...).copyWith(id: 12, name: "My name")
  /// ````
  PhotoUploadView call({
    InspectionPhotoView photo,
    PhotoUploadViewUpload upload,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfPhotoUploadView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfPhotoUploadView.copyWith.fieldName(...)`
class _$PhotoUploadViewCWProxyImpl implements _$PhotoUploadViewCWProxy {
  const _$PhotoUploadViewCWProxyImpl(this._value);

  final PhotoUploadView _value;

  @override
  PhotoUploadView photo(InspectionPhotoView photo) => this(photo: photo);

  @override
  PhotoUploadView upload(PhotoUploadViewUpload upload) => this(upload: upload);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PhotoUploadView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PhotoUploadView(...).copyWith(id: 12, name: "My name")
  /// ````
  PhotoUploadView call({
    Object? photo = const $CopyWithPlaceholder(),
    Object? upload = const $CopyWithPlaceholder(),
  }) {
    return PhotoUploadView(
      photo: photo == const $CopyWithPlaceholder()
          ? _value.photo
          // ignore: cast_nullable_to_non_nullable
          : photo as InspectionPhotoView,
      upload: upload == const $CopyWithPlaceholder()
          ? _value.upload
          // ignore: cast_nullable_to_non_nullable
          : upload as PhotoUploadViewUpload,
    );
  }
}

extension $PhotoUploadViewCopyWith on PhotoUploadView {
  /// Returns a callable class that can be used as follows: `instanceOfPhotoUploadView.copyWith(...)` or like so:`instanceOfPhotoUploadView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$PhotoUploadViewCWProxy get copyWith => _$PhotoUploadViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PhotoUploadView _$PhotoUploadViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate('PhotoUploadView', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['photo', 'upload']);
      final val = PhotoUploadView(
        photo: $checkedConvert(
          'photo',
          (v) => InspectionPhotoView.fromJson(v as Map<String, dynamic>),
        ),
        upload: $checkedConvert(
          'upload',
          (v) => PhotoUploadViewUpload.fromJson(v as Map<String, dynamic>),
        ),
      );
      return val;
    });

Map<String, dynamic> _$PhotoUploadViewToJson(PhotoUploadView instance) =>
    <String, dynamic>{
      'photo': instance.photo.toJson(),
      'upload': instance.upload.toJson(),
    };
