//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

enum ItemApprovalStatus {
      @JsonValue(r'approved')
      approved(r'approved'),
      @JsonValue(r'proposed')
      proposed(r'proposed'),
      @JsonValue(r'declined')
      declined(r'declined');

  const ItemApprovalStatus(this.value);

  final String value;

  @override
  String toString() => value;
}
