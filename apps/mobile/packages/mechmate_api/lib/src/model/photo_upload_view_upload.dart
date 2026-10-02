//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'photo_upload_view_upload.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PhotoUploadViewUpload {
  /// Returns a new [PhotoUploadViewUpload] instance.
  PhotoUploadViewUpload({

    required  this.url,

    required  this.method,

    required  this.headers,

    required  this.expiresAt,
  });

  @JsonKey(
    
    name: r'url',
    required: true,
    includeIfNull: false,
  )


  final String url;



  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  )


  final PhotoUploadViewUploadMethodEnum method;



      /// Enviar EXACTAMENTE estos headers (están firmados).
  @JsonKey(
    
    name: r'headers',
    required: true,
    includeIfNull: false,
  )


  final Map<String, String> headers;



  @JsonKey(
    
    name: r'expires_at',
    required: true,
    includeIfNull: false,
  )


  final String expiresAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PhotoUploadViewUpload &&
      other.url == url &&
      other.method == method &&
      other.headers == headers &&
      other.expiresAt == expiresAt;

    @override
    int get hashCode =>
        url.hashCode +
        method.hashCode +
        headers.hashCode +
        expiresAt.hashCode;

  factory PhotoUploadViewUpload.fromJson(Map<String, dynamic> json) => _$PhotoUploadViewUploadFromJson(json);

  Map<String, dynamic> toJson() => _$PhotoUploadViewUploadToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum PhotoUploadViewUploadMethodEnum {
@JsonValue(r'PUT')
PUT(r'PUT');

const PhotoUploadViewUploadMethodEnum(this.value);

final String value;

@override
String toString() => value;
}


