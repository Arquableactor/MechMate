//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

enum PaymentStatus {
      @JsonValue(r'requires_action')
      requiresAction(r'requires_action'),
      @JsonValue(r'captured')
      captured(r'captured'),
      @JsonValue(r'failed')
      failed(r'failed'),
      @JsonValue(r'refunded')
      refunded(r'refunded');

  const PaymentStatus(this.value);

  final String value;

  @override
  String toString() => value;
}
