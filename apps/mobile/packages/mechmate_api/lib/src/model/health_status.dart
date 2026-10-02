//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'health_status.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class HealthStatus {
  /// Returns a new [HealthStatus] instance.
  HealthStatus({

    required  this.status,

    required  this.uptime,

    required  this.timestamp,

    required  this.db,

    required  this.redis,
  });

      /// Siempre 'ok' mientras el proceso responde (la DB se reporta aparte en `db`).
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final HealthStatusStatusEnum status;



      /// Segundos que lleva el proceso vivo (`process.uptime()`).
  @JsonKey(
    
    name: r'uptime',
    required: true,
    includeIfNull: false,
  )


  final num uptime;



      /// Instante de la respuesta en ISO-8601.
  @JsonKey(
    
    name: r'timestamp',
    required: true,
    includeIfNull: false,
  )


  final String timestamp;



      /// Resultado del `SELECT 1` contra Postgres.
  @JsonKey(
    
    name: r'db',
    required: true,
    includeIfNull: false,
  )


  final HealthStatusDbEnum db;



      /// Ping a Redis (colas BullMQ). 'disabled' = sin REDIS_URL (solo dev/test).
  @JsonKey(
    
    name: r'redis',
    required: true,
    includeIfNull: false,
  )


  final HealthStatusRedisEnum redis;





    @override
    bool operator ==(Object other) => identical(this, other) || other is HealthStatus &&
      other.status == status &&
      other.uptime == uptime &&
      other.timestamp == timestamp &&
      other.db == db &&
      other.redis == redis;

    @override
    int get hashCode =>
        status.hashCode +
        uptime.hashCode +
        timestamp.hashCode +
        db.hashCode +
        redis.hashCode;

  factory HealthStatus.fromJson(Map<String, dynamic> json) => _$HealthStatusFromJson(json);

  Map<String, dynamic> toJson() => _$HealthStatusToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Siempre 'ok' mientras el proceso responde (la DB se reporta aparte en `db`).
enum HealthStatusStatusEnum {
@JsonValue(r'ok')
ok(r'ok');

const HealthStatusStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Resultado del `SELECT 1` contra Postgres.
enum HealthStatusDbEnum {
@JsonValue(r'up')
up(r'up'),
@JsonValue(r'down')
down(r'down');

const HealthStatusDbEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Ping a Redis (colas BullMQ). 'disabled' = sin REDIS_URL (solo dev/test).
enum HealthStatusRedisEnum {
@JsonValue(r'up')
up(r'up'),
@JsonValue(r'down')
down(r'down'),
@JsonValue(r'disabled')
disabled(r'disabled');

const HealthStatusRedisEnum(this.value);

final String value;

@override
String toString() => value;
}


