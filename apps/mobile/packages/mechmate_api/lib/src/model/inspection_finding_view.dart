//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/inspection_photo_view.dart';
import 'package:mechmate_api/src/model/finding_severity.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'inspection_finding_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class InspectionFindingView {
  /// Returns a new [InspectionFindingView] instance.
  InspectionFindingView({

    required  this.id,

    required  this.area,

    required  this.title,

    required  this.severity,

    required  this.notes,

    required  this.photos,

    required  this.createdAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// Área del vehículo: \"Frenos\", \"Suspensión\", \"Luces\"…
  @JsonKey(
    
    name: r'area',
    required: true,
    includeIfNull: false,
  )


  final String area;



  @JsonKey(
    
    name: r'title',
    required: true,
    includeIfNull: false,
  )


  final String title;



  @JsonKey(
    
    name: r'severity',
    required: true,
    includeIfNull: false,
  )


  final FindingSeverity severity;



  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



  @JsonKey(
    
    name: r'photos',
    required: true,
    includeIfNull: false,
  )


  final List<InspectionPhotoView> photos;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is InspectionFindingView &&
      other.id == id &&
      other.area == area &&
      other.title == title &&
      other.severity == severity &&
      other.notes == notes &&
      other.photos == photos &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        area.hashCode +
        title.hashCode +
        severity.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        photos.hashCode +
        createdAt.hashCode;

  factory InspectionFindingView.fromJson(Map<String, dynamic> json) => _$InspectionFindingViewFromJson(json);

  Map<String, dynamic> toJson() => _$InspectionFindingViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

