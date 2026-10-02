//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

enum ShopMemberRole {
      @JsonValue(r'owner')
      owner(r'owner'),
      @JsonValue(r'mechanic')
      mechanic(r'mechanic'),
      @JsonValue(r'advisor')
      advisor(r'advisor');

  const ShopMemberRole(this.value);

  final String value;

  @override
  String toString() => value;
}
