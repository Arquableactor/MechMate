//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'item_decision_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ItemDecisionDto {
  /// Returns a new [ItemDecisionDto] instance.
  ItemDecisionDto({

    required  this.itemId,

    required  this.decision,
  });

  @JsonKey(
    
    name: r'item_id',
    required: true,
    includeIfNull: false,
  )


  final String itemId;



  @JsonKey(
    
    name: r'decision',
    required: true,
    includeIfNull: false,
  )


  final ItemDecisionDtoDecisionEnum decision;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ItemDecisionDto &&
      other.itemId == itemId &&
      other.decision == decision;

    @override
    int get hashCode =>
        itemId.hashCode +
        decision.hashCode;

  factory ItemDecisionDto.fromJson(Map<String, dynamic> json) => _$ItemDecisionDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ItemDecisionDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum ItemDecisionDtoDecisionEnum {
@JsonValue(r'approved')
approved(r'approved'),
@JsonValue(r'declined')
declined(r'declined');

const ItemDecisionDtoDecisionEnum(this.value);

final String value;

@override
String toString() => value;
}


