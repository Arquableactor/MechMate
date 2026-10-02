//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

enum WorkOrderStatus {
      @JsonValue(r'draft')
      draft(r'draft'),
      @JsonValue(r'awaiting_approval')
      awaitingApproval(r'awaiting_approval'),
      @JsonValue(r'approved')
      approved(r'approved'),
      @JsonValue(r'in_progress')
      inProgress(r'in_progress'),
      @JsonValue(r'completed')
      completed(r'completed'),
      @JsonValue(r'invoiced')
      invoiced(r'invoiced'),
      @JsonValue(r'paid')
      paid(r'paid'),
      @JsonValue(r'cancelled')
      cancelled(r'cancelled');

  const WorkOrderStatus(this.value);

  final String value;

  @override
  String toString() => value;
}
