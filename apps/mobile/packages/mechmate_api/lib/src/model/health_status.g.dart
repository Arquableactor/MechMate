// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_status.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$HealthStatusCWProxy {
  HealthStatus status(HealthStatusStatusEnum status);

  HealthStatus uptime(num uptime);

  HealthStatus timestamp(String timestamp);

  HealthStatus db(HealthStatusDbEnum db);

  HealthStatus redis(HealthStatusRedisEnum redis);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HealthStatus(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HealthStatus(...).copyWith(id: 12, name: "My name")
  /// ````
  HealthStatus call({
    HealthStatusStatusEnum status,
    num uptime,
    String timestamp,
    HealthStatusDbEnum db,
    HealthStatusRedisEnum redis,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfHealthStatus.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfHealthStatus.copyWith.fieldName(...)`
class _$HealthStatusCWProxyImpl implements _$HealthStatusCWProxy {
  const _$HealthStatusCWProxyImpl(this._value);

  final HealthStatus _value;

  @override
  HealthStatus status(HealthStatusStatusEnum status) => this(status: status);

  @override
  HealthStatus uptime(num uptime) => this(uptime: uptime);

  @override
  HealthStatus timestamp(String timestamp) => this(timestamp: timestamp);

  @override
  HealthStatus db(HealthStatusDbEnum db) => this(db: db);

  @override
  HealthStatus redis(HealthStatusRedisEnum redis) => this(redis: redis);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `HealthStatus(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// HealthStatus(...).copyWith(id: 12, name: "My name")
  /// ````
  HealthStatus call({
    Object? status = const $CopyWithPlaceholder(),
    Object? uptime = const $CopyWithPlaceholder(),
    Object? timestamp = const $CopyWithPlaceholder(),
    Object? db = const $CopyWithPlaceholder(),
    Object? redis = const $CopyWithPlaceholder(),
  }) {
    return HealthStatus(
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as HealthStatusStatusEnum,
      uptime: uptime == const $CopyWithPlaceholder()
          ? _value.uptime
          // ignore: cast_nullable_to_non_nullable
          : uptime as num,
      timestamp: timestamp == const $CopyWithPlaceholder()
          ? _value.timestamp
          // ignore: cast_nullable_to_non_nullable
          : timestamp as String,
      db: db == const $CopyWithPlaceholder()
          ? _value.db
          // ignore: cast_nullable_to_non_nullable
          : db as HealthStatusDbEnum,
      redis: redis == const $CopyWithPlaceholder()
          ? _value.redis
          // ignore: cast_nullable_to_non_nullable
          : redis as HealthStatusRedisEnum,
    );
  }
}

extension $HealthStatusCopyWith on HealthStatus {
  /// Returns a callable class that can be used as follows: `instanceOfHealthStatus.copyWith(...)` or like so:`instanceOfHealthStatus.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$HealthStatusCWProxy get copyWith => _$HealthStatusCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HealthStatus _$HealthStatusFromJson(Map<String, dynamic> json) =>
    $checkedCreate('HealthStatus', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const ['status', 'uptime', 'timestamp', 'db', 'redis'],
      );
      final val = HealthStatus(
        status: $checkedConvert(
          'status',
          (v) => $enumDecode(_$HealthStatusStatusEnumEnumMap, v),
        ),
        uptime: $checkedConvert('uptime', (v) => v as num),
        timestamp: $checkedConvert('timestamp', (v) => v as String),
        db: $checkedConvert(
          'db',
          (v) => $enumDecode(_$HealthStatusDbEnumEnumMap, v),
        ),
        redis: $checkedConvert(
          'redis',
          (v) => $enumDecode(_$HealthStatusRedisEnumEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$HealthStatusToJson(HealthStatus instance) =>
    <String, dynamic>{
      'status': _$HealthStatusStatusEnumEnumMap[instance.status]!,
      'uptime': instance.uptime,
      'timestamp': instance.timestamp,
      'db': _$HealthStatusDbEnumEnumMap[instance.db]!,
      'redis': _$HealthStatusRedisEnumEnumMap[instance.redis]!,
    };

const _$HealthStatusStatusEnumEnumMap = {HealthStatusStatusEnum.ok: 'ok'};

const _$HealthStatusDbEnumEnumMap = {
  HealthStatusDbEnum.up: 'up',
  HealthStatusDbEnum.down: 'down',
};

const _$HealthStatusRedisEnumEnumMap = {
  HealthStatusRedisEnum.up: 'up',
  HealthStatusRedisEnum.down: 'down',
  HealthStatusRedisEnum.disabled: 'disabled',
};
