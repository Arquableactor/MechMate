//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'transition_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class TransitionDto {
  /// Returns a new [TransitionDto] instance.
  TransitionDto({

    required  this.to,

     this.reason,
  });

  @JsonKey(
    
    name: r'to',
    required: true,
    includeIfNull: false,
  )


  final TransitionDtoToEnum to;



      /// Solo para cancelled.
  @JsonKey(
    
    name: r'reason',
    required: false,
    includeIfNull: false,
  )


  final String? reason;





    @override
    bool operator ==(Object other) => identical(this, other) || other is TransitionDto &&
      other.to == to &&
      other.reason == reason;

    @override
    int get hashCode =>
        to.hashCode +
        (reason == null ? 0 : reason.hashCode);

  factory TransitionDto.fromJson(Map<String, dynamic> json) => _$TransitionDtoFromJson(json);

  Map<String, dynamic> toJson() => _$TransitionDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum TransitionDtoToEnum {
@JsonValue(r'in_progress')
inProgress(r'in_progress'),
@JsonValue(r'completed')
completed(r'completed'),
@JsonValue(r'cancelled')
cancelled(r'cancelled');

const TransitionDtoToEnum(this.value);

final String value;

@override
String toString() => value;
}


