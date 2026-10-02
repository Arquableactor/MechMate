// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_work_order_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$CreateWorkOrderDtoCWProxy {
  CreateWorkOrderDto customerId(String customerId);

  CreateWorkOrderDto vehicleId(String vehicleId);

  CreateWorkOrderDto complaint(String complaint);

  CreateWorkOrderDto notes(String? notes);

  CreateWorkOrderDto mileageIn(int? mileageIn);

  CreateWorkOrderDto assignedMemberId(String? assignedMemberId);

  CreateWorkOrderDto promisedAt(String? promisedAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CreateWorkOrderDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CreateWorkOrderDto(...).copyWith(id: 12, name: "My name")
  /// ````
  CreateWorkOrderDto call({
    String customerId,
    String vehicleId,
    String complaint,
    String? notes,
    int? mileageIn,
    String? assignedMemberId,
    String? promisedAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfCreateWorkOrderDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfCreateWorkOrderDto.copyWith.fieldName(...)`
class _$CreateWorkOrderDtoCWProxyImpl implements _$CreateWorkOrderDtoCWProxy {
  const _$CreateWorkOrderDtoCWProxyImpl(this._value);

  final CreateWorkOrderDto _value;

  @override
  CreateWorkOrderDto customerId(String customerId) =>
      this(customerId: customerId);

  @override
  CreateWorkOrderDto vehicleId(String vehicleId) => this(vehicleId: vehicleId);

  @override
  CreateWorkOrderDto complaint(String complaint) => this(complaint: complaint);

  @override
  CreateWorkOrderDto notes(String? notes) => this(notes: notes);

  @override
  CreateWorkOrderDto mileageIn(int? mileageIn) => this(mileageIn: mileageIn);

  @override
  CreateWorkOrderDto assignedMemberId(String? assignedMemberId) =>
      this(assignedMemberId: assignedMemberId);

  @override
  CreateWorkOrderDto promisedAt(String? promisedAt) =>
      this(promisedAt: promisedAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CreateWorkOrderDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CreateWorkOrderDto(...).copyWith(id: 12, name: "My name")
  /// ````
  CreateWorkOrderDto call({
    Object? customerId = const $CopyWithPlaceholder(),
    Object? vehicleId = const $CopyWithPlaceholder(),
    Object? complaint = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? mileageIn = const $CopyWithPlaceholder(),
    Object? assignedMemberId = const $CopyWithPlaceholder(),
    Object? promisedAt = const $CopyWithPlaceholder(),
  }) {
    return CreateWorkOrderDto(
      customerId: customerId == const $CopyWithPlaceholder()
          ? _value.customerId
          // ignore: cast_nullable_to_non_nullable
          : customerId as String,
      vehicleId: vehicleId == const $CopyWithPlaceholder()
          ? _value.vehicleId
          // ignore: cast_nullable_to_non_nullable
          : vehicleId as String,
      complaint: complaint == const $CopyWithPlaceholder()
          ? _value.complaint
          // ignore: cast_nullable_to_non_nullable
          : complaint as String,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
      mileageIn: mileageIn == const $CopyWithPlaceholder()
          ? _value.mileageIn
          // ignore: cast_nullable_to_non_nullable
          : mileageIn as int?,
      assignedMemberId: assignedMemberId == const $CopyWithPlaceholder()
          ? _value.assignedMemberId
          // ignore: cast_nullable_to_non_nullable
          : assignedMemberId as String?,
      promisedAt: promisedAt == const $CopyWithPlaceholder()
          ? _value.promisedAt
          // ignore: cast_nullable_to_non_nullable
          : promisedAt as String?,
    );
  }
}

extension $CreateWorkOrderDtoCopyWith on CreateWorkOrderDto {
  /// Returns a callable class that can be used as follows: `instanceOfCreateWorkOrderDto.copyWith(...)` or like so:`instanceOfCreateWorkOrderDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$CreateWorkOrderDtoCWProxy get copyWith =>
      _$CreateWorkOrderDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateWorkOrderDto _$CreateWorkOrderDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'CreateWorkOrderDto',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const ['customer_id', 'vehicle_id', 'complaint'],
        );
        final val = CreateWorkOrderDto(
          customerId: $checkedConvert('customer_id', (v) => v as String),
          vehicleId: $checkedConvert('vehicle_id', (v) => v as String),
          complaint: $checkedConvert('complaint', (v) => v as String),
          notes: $checkedConvert('notes', (v) => v as String?),
          mileageIn: $checkedConvert('mileage_in', (v) => (v as num?)?.toInt()),
          assignedMemberId: $checkedConvert(
            'assigned_member_id',
            (v) => v as String?,
          ),
          promisedAt: $checkedConvert('promised_at', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {
        'customerId': 'customer_id',
        'vehicleId': 'vehicle_id',
        'mileageIn': 'mileage_in',
        'assignedMemberId': 'assigned_member_id',
        'promisedAt': 'promised_at',
      },
    );

Map<String, dynamic> _$CreateWorkOrderDtoToJson(CreateWorkOrderDto instance) =>
    <String, dynamic>{
      'customer_id': instance.customerId,
      'vehicle_id': instance.vehicleId,
      'complaint': instance.complaint,
      'notes': ?instance.notes,
      'mileage_in': ?instance.mileageIn,
      'assigned_member_id': ?instance.assignedMemberId,
      'promised_at': ?instance.promisedAt,
    };
