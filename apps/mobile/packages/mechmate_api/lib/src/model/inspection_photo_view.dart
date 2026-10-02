//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'inspection_photo_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class InspectionPhotoView {
  /// Returns a new [InspectionPhotoView] instance.
  InspectionPhotoView({

    required  this.id,

    required  this.status,

    required  this.contentType,

    required  this.sizeBytes,

    required  this.url,

    required  this.urlExpiresAt,

    required  this.createdAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final InspectionPhotoViewStatusEnum status;



  @JsonKey(
    
    name: r'content_type',
    required: true,
    includeIfNull: false,
  )


  final String contentType;



  @JsonKey(
    
    name: r'size_bytes',
    required: true,
    includeIfNull: false,
  )


  final int sizeBytes;



      /// URL firmada para ver la foto (solo si está subida); vence en `url_expires_at`.
  @JsonKey(
    
    name: r'url',
    required: true,
    includeIfNull: true,
  )


  final String? url;



  @JsonKey(
    
    name: r'url_expires_at',
    required: true,
    includeIfNull: true,
  )


  final String? urlExpiresAt;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is InspectionPhotoView &&
      other.id == id &&
      other.status == status &&
      other.contentType == contentType &&
      other.sizeBytes == sizeBytes &&
      other.url == url &&
      other.urlExpiresAt == urlExpiresAt &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        status.hashCode +
        contentType.hashCode +
        sizeBytes.hashCode +
        (url == null ? 0 : url.hashCode) +
        (urlExpiresAt == null ? 0 : urlExpiresAt.hashCode) +
        createdAt.hashCode;

  factory InspectionPhotoView.fromJson(Map<String, dynamic> json) => _$InspectionPhotoViewFromJson(json);

  Map<String, dynamic> toJson() => _$InspectionPhotoViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum InspectionPhotoViewStatusEnum {
@JsonValue(r'pending')
pending(r'pending'),
@JsonValue(r'uploaded')
uploaded(r'uploaded');

const InspectionPhotoViewStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


