//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// Conjunto canónico de roles de dominio (viven en la DB, no en Auth0).
enum Role {
      @JsonValue(r'mechanic')
      mechanic(r'mechanic'),
      @JsonValue(r'seller')
      seller(r'seller'),
      @JsonValue(r'customer')
      customer(r'customer'),
      @JsonValue(r'courier')
      courier(r'courier'),
      @JsonValue(r'admin')
      admin(r'admin');

  const Role(this.value);

  final String value;

  @override
  String toString() => value;
}
