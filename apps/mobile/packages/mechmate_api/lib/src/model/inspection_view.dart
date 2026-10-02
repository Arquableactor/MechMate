//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/inspection_finding_view.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'inspection_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class InspectionView {
  /// Returns a new [InspectionView] instance.
  InspectionView({

    required  this.id,

    required  this.workOrderId,

    required  this.notes,

    required  this.findings,

    required  this.createdAt,

    required  this.updatedAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'work_order_id',
    required: true,
    includeIfNull: false,
  )


  final String workOrderId;



  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



  @JsonKey(
    
    name: r'findings',
    required: true,
    includeIfNull: false,
  )


  final List<InspectionFindingView> findings;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;



  @JsonKey(
    
    name: r'updated_at',
    required: true,
    includeIfNull: false,
  )


  final String updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is InspectionView &&
      other.id == id &&
      other.workOrderId == workOrderId &&
      other.notes == notes &&
      other.findings == findings &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
        workOrderId.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        findings.hashCode +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory InspectionView.fromJson(Map<String, dynamic> json) => _$InspectionViewFromJson(json);

  Map<String, dynamic> toJson() => _$InspectionViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

