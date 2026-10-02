//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/photo_upload_view_upload.dart';
import 'package:mechmate_api/src/model/inspection_photo_view.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'photo_upload_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PhotoUploadView {
  /// Returns a new [PhotoUploadView] instance.
  PhotoUploadView({

    required  this.photo,

    required  this.upload,
  });

  @JsonKey(
    
    name: r'photo',
    required: true,
    includeIfNull: false,
  )


  final InspectionPhotoView photo;



  @JsonKey(
    
    name: r'upload',
    required: true,
    includeIfNull: false,
  )


  final PhotoUploadViewUpload upload;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PhotoUploadView &&
      other.photo == photo &&
      other.upload == upload;

    @override
    int get hashCode =>
        photo.hashCode +
        upload.hashCode;

  factory PhotoUploadView.fromJson(Map<String, dynamic> json) => _$PhotoUploadViewFromJson(json);

  Map<String, dynamic> toJson() => _$PhotoUploadViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

