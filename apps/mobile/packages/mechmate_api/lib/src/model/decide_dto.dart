//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/item_decision_dto.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'decide_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class DecideDto {
  /// Returns a new [DecideDto] instance.
  DecideDto({

    required  this.decisions,
  });

  @JsonKey(
    
    name: r'decisions',
    required: true,
    includeIfNull: false,
  )


  final List<ItemDecisionDto> decisions;





    @override
    bool operator ==(Object other) => identical(this, other) || other is DecideDto &&
      other.decisions == decisions;

    @override
    int get hashCode =>
        decisions.hashCode;

  factory DecideDto.fromJson(Map<String, dynamic> json) => _$DecideDtoFromJson(json);

  Map<String, dynamic> toJson() => _$DecideDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

