//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'request_photo_upload_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class RequestPhotoUploadDto {
  /// Returns a new [RequestPhotoUploadDto] instance.
  RequestPhotoUploadDto({

    required  this.contentType,

    required  this.sizeBytes,
  });

  @JsonKey(
    
    name: r'content_type',
    required: true,
    includeIfNull: false,
  )


  final RequestPhotoUploadDtoContentTypeEnum contentType;



      /// Tamaño EXACTO del archivo en bytes (queda firmado).
          // maximum: 10485760
  @JsonKey(
    
    name: r'size_bytes',
    required: true,
    includeIfNull: false,
  )


  final num sizeBytes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is RequestPhotoUploadDto &&
      other.contentType == contentType &&
      other.sizeBytes == sizeBytes;

    @override
    int get hashCode =>
        contentType.hashCode +
        sizeBytes.hashCode;

  factory RequestPhotoUploadDto.fromJson(Map<String, dynamic> json) => _$RequestPhotoUploadDtoFromJson(json);

  Map<String, dynamic> toJson() => _$RequestPhotoUploadDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum RequestPhotoUploadDtoContentTypeEnum {
@JsonValue(r'image/jpeg')
imageSlashJpeg(r'image/jpeg'),
@JsonValue(r'image/png')
imageSlashPng(r'image/png'),
@JsonValue(r'image/webp')
imageSlashWebp(r'image/webp'),
@JsonValue(r'image/heic')
imageSlashHeic(r'image/heic');

const RequestPhotoUploadDtoContentTypeEnum(this.value);

final String value;

@override
String toString() => value;
}


