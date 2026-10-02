//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/finding_severity.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_approval_view_findings_inner.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicApprovalViewFindingsInner {
  /// Returns a new [PublicApprovalViewFindingsInner] instance.
  PublicApprovalViewFindingsInner({

    required  this.area,

    required  this.title,

    required  this.severity,

    required  this.notes,

    required  this.photoUrls,
  });

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



      /// URLs firmadas (1 h) de las fotos subidas.
  @JsonKey(
    
    name: r'photo_urls',
    required: true,
    includeIfNull: false,
  )


  final List<String> photoUrls;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicApprovalViewFindingsInner &&
      other.area == area &&
      other.title == title &&
      other.severity == severity &&
      other.notes == notes &&
      other.photoUrls == photoUrls;

    @override
    int get hashCode =>
        area.hashCode +
        title.hashCode +
        severity.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        photoUrls.hashCode;

  factory PublicApprovalViewFindingsInner.fromJson(Map<String, dynamic> json) => _$PublicApprovalViewFindingsInnerFromJson(json);

  Map<String, dynamic> toJson() => _$PublicApprovalViewFindingsInnerToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

