//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

enum FindingSeverity {
      @JsonValue(r'ok')
      ok(r'ok'),
      @JsonValue(r'attention')
      attention(r'attention'),
      @JsonValue(r'urgent')
      urgent(r'urgent');

  const FindingSeverity(this.value);

  final String value;

  @override
  String toString() => value;
}
