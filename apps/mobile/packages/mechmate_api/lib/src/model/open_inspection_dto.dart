//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'open_inspection_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OpenInspectionDto {
  /// Returns a new [OpenInspectionDto] instance.
  OpenInspectionDto({

     this.notes,
  });

  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OpenInspectionDto &&
      other.notes == notes;

    @override
    int get hashCode =>
        (notes == null ? 0 : notes.hashCode);

  factory OpenInspectionDto.fromJson(Map<String, dynamic> json) => _$OpenInspectionDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OpenInspectionDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

