//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

enum PaymentMethod {
      @JsonValue(r'card')
      card(r'card'),
      @JsonValue(r'cash')
      cash(r'cash'),
      @JsonValue(r'transfer')
      transfer(r'transfer');

  const PaymentMethod(this.value);

  final String value;

  @override
  String toString() => value;
}
