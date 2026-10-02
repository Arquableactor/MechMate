//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'update_finding_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateFindingDto {
  /// Returns a new [UpdateFindingDto] instance.
  UpdateFindingDto({

     this.area,

     this.title,

     this.severity,

     this.notes,
  });

  @JsonKey(
    
    name: r'area',
    required: false,
    includeIfNull: false,
  )


  final String? area;



  @JsonKey(
    
    name: r'title',
    required: false,
    includeIfNull: false,
  )


  final String? title;



      /// ok = verde, attention = amarillo, urgent = rojo.
  @JsonKey(
    
    name: r'severity',
    required: false,
    includeIfNull: false,
  )


  final UpdateFindingDtoSeverityEnum? severity;



  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateFindingDto &&
      other.area == area &&
      other.title == title &&
      other.severity == severity &&
      other.notes == notes;

    @override
    int get hashCode =>
        area.hashCode +
        title.hashCode +
        severity.hashCode +
        (notes == null ? 0 : notes.hashCode);

  factory UpdateFindingDto.fromJson(Map<String, dynamic> json) => _$UpdateFindingDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateFindingDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// ok = verde, attention = amarillo, urgent = rojo.
enum UpdateFindingDtoSeverityEnum {
@JsonValue(r'ok')
ok(r'ok'),
@JsonValue(r'attention')
attention(r'attention'),
@JsonValue(r'urgent')
urgent(r'urgent');

const UpdateFindingDtoSeverityEnum(this.value);

final String value;

@override
String toString() => value;
}


