// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_work_order_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$UpdateWorkOrderDtoCWProxy {
  UpdateWorkOrderDto complaint(String? complaint);

  UpdateWorkOrderDto notes(String? notes);

  UpdateWorkOrderDto mileageIn(int? mileageIn);

  UpdateWorkOrderDto assignedMemberId(String? assignedMemberId);

  UpdateWorkOrderDto promisedAt(String? promisedAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateWorkOrderDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateWorkOrderDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateWorkOrderDto call({
    String? complaint,
    String? notes,
    int? mileageIn,
    String? assignedMemberId,
    String? promisedAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfUpdateWorkOrderDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfUpdateWorkOrderDto.copyWith.fieldName(...)`
class _$UpdateWorkOrderDtoCWProxyImpl implements _$UpdateWorkOrderDtoCWProxy {
  const _$UpdateWorkOrderDtoCWProxyImpl(this._value);

  final UpdateWorkOrderDto _value;

  @override
  UpdateWorkOrderDto complaint(String? complaint) => this(complaint: complaint);

  @override
  UpdateWorkOrderDto notes(String? notes) => this(notes: notes);

  @override
  UpdateWorkOrderDto mileageIn(int? mileageIn) => this(mileageIn: mileageIn);

  @override
  UpdateWorkOrderDto assignedMemberId(String? assignedMemberId) =>
      this(assignedMemberId: assignedMemberId);

  @override
  UpdateWorkOrderDto promisedAt(String? promisedAt) =>
      this(promisedAt: promisedAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateWorkOrderDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateWorkOrderDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateWorkOrderDto call({
    Object? complaint = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? mileageIn = const $CopyWithPlaceholder(),
    Object? assignedMemberId = const $CopyWithPlaceholder(),
    Object? promisedAt = const $CopyWithPlaceholder(),
  }) {
    return UpdateWorkOrderDto(
      complaint: complaint == const $CopyWithPlaceholder()
          ? _value.complaint
          // ignore: cast_nullable_to_non_nullable
          : complaint as String?,
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

extension $UpdateWorkOrderDtoCopyWith on UpdateWorkOrderDto {
  /// Returns a callable class that can be used as follows: `instanceOfUpdateWorkOrderDto.copyWith(...)` or like so:`instanceOfUpdateWorkOrderDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$UpdateWorkOrderDtoCWProxy get copyWith =>
      _$UpdateWorkOrderDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateWorkOrderDto _$UpdateWorkOrderDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'UpdateWorkOrderDto',
      json,
      ($checkedConvert) {
        final val = UpdateWorkOrderDto(
          complaint: $checkedConvert('complaint', (v) => v as String?),
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
        'mileageIn': 'mileage_in',
        'assignedMemberId': 'assigned_member_id',
        'promisedAt': 'promised_at',
      },
    );

Map<String, dynamic> _$UpdateWorkOrderDtoToJson(UpdateWorkOrderDto instance) =>
    <String, dynamic>{
      'complaint': ?instance.complaint,
      'notes': ?instance.notes,
      'mileage_in': ?instance.mileageIn,
      'assigned_member_id': ?instance.assignedMemberId,
      'promised_at': ?instance.promisedAt,
    };
