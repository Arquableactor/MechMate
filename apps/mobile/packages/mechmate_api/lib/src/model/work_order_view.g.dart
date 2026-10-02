// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'work_order_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$WorkOrderViewCWProxy {
  WorkOrderView id(String id);

  WorkOrderView number(int number);

  WorkOrderView code(String code);

  WorkOrderView status(WorkOrderStatus status);

  WorkOrderView customer(CustomerSummary customer);

  WorkOrderView vehicle(VehicleSummary vehicle);

  WorkOrderView complaint(String complaint);

  WorkOrderView notes(String? notes);

  WorkOrderView mileageIn(int? mileageIn);

  WorkOrderView assignedMemberId(String? assignedMemberId);

  WorkOrderView promisedAt(String? promisedAt);

  WorkOrderView currency(String currency);

  WorkOrderView subtotalCents(String subtotalCents);

  WorkOrderView taxCents(String taxCents);

  WorkOrderView totalCents(String totalCents);

  WorkOrderView startedAt(String? startedAt);

  WorkOrderView completedAt(String? completedAt);

  WorkOrderView cancelledAt(String? cancelledAt);

  WorkOrderView cancellationReason(String? cancellationReason);

  WorkOrderView createdByAccountId(String createdByAccountId);

  WorkOrderView createdAt(String createdAt);

  WorkOrderView updatedAt(String updatedAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `WorkOrderView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// WorkOrderView(...).copyWith(id: 12, name: "My name")
  /// ````
  WorkOrderView call({
    String id,
    int number,
    String code,
    WorkOrderStatus status,
    CustomerSummary customer,
    VehicleSummary vehicle,
    String complaint,
    String? notes,
    int? mileageIn,
    String? assignedMemberId,
    String? promisedAt,
    String currency,
    String subtotalCents,
    String taxCents,
    String totalCents,
    String? startedAt,
    String? completedAt,
    String? cancelledAt,
    String? cancellationReason,
    String createdByAccountId,
    String createdAt,
    String updatedAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfWorkOrderView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfWorkOrderView.copyWith.fieldName(...)`
class _$WorkOrderViewCWProxyImpl implements _$WorkOrderViewCWProxy {
  const _$WorkOrderViewCWProxyImpl(this._value);

  final WorkOrderView _value;

  @override
  WorkOrderView id(String id) => this(id: id);

  @override
  WorkOrderView number(int number) => this(number: number);

  @override
  WorkOrderView code(String code) => this(code: code);

  @override
  WorkOrderView status(WorkOrderStatus status) => this(status: status);

  @override
  WorkOrderView customer(CustomerSummary customer) => this(customer: customer);

  @override
  WorkOrderView vehicle(VehicleSummary vehicle) => this(vehicle: vehicle);

  @override
  WorkOrderView complaint(String complaint) => this(complaint: complaint);

  @override
  WorkOrderView notes(String? notes) => this(notes: notes);

  @override
  WorkOrderView mileageIn(int? mileageIn) => this(mileageIn: mileageIn);

  @override
  WorkOrderView assignedMemberId(String? assignedMemberId) =>
      this(assignedMemberId: assignedMemberId);

  @override
  WorkOrderView promisedAt(String? promisedAt) => this(promisedAt: promisedAt);

  @override
  WorkOrderView currency(String currency) => this(currency: currency);

  @override
  WorkOrderView subtotalCents(String subtotalCents) =>
      this(subtotalCents: subtotalCents);

  @override
  WorkOrderView taxCents(String taxCents) => this(taxCents: taxCents);

  @override
  WorkOrderView totalCents(String totalCents) => this(totalCents: totalCents);

  @override
  WorkOrderView startedAt(String? startedAt) => this(startedAt: startedAt);

  @override
  WorkOrderView completedAt(String? completedAt) =>
      this(completedAt: completedAt);

  @override
  WorkOrderView cancelledAt(String? cancelledAt) =>
      this(cancelledAt: cancelledAt);

  @override
  WorkOrderView cancellationReason(String? cancellationReason) =>
      this(cancellationReason: cancellationReason);

  @override
  WorkOrderView createdByAccountId(String createdByAccountId) =>
      this(createdByAccountId: createdByAccountId);

  @override
  WorkOrderView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  WorkOrderView updatedAt(String updatedAt) => this(updatedAt: updatedAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `WorkOrderView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// WorkOrderView(...).copyWith(id: 12, name: "My name")
  /// ````
  WorkOrderView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? number = const $CopyWithPlaceholder(),
    Object? code = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? customer = const $CopyWithPlaceholder(),
    Object? vehicle = const $CopyWithPlaceholder(),
    Object? complaint = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? mileageIn = const $CopyWithPlaceholder(),
    Object? assignedMemberId = const $CopyWithPlaceholder(),
    Object? promisedAt = const $CopyWithPlaceholder(),
    Object? currency = const $CopyWithPlaceholder(),
    Object? subtotalCents = const $CopyWithPlaceholder(),
    Object? taxCents = const $CopyWithPlaceholder(),
    Object? totalCents = const $CopyWithPlaceholder(),
    Object? startedAt = const $CopyWithPlaceholder(),
    Object? completedAt = const $CopyWithPlaceholder(),
    Object? cancelledAt = const $CopyWithPlaceholder(),
    Object? cancellationReason = const $CopyWithPlaceholder(),
    Object? createdByAccountId = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
    Object? updatedAt = const $CopyWithPlaceholder(),
  }) {
    return WorkOrderView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      number: number == const $CopyWithPlaceholder()
          ? _value.number
          // ignore: cast_nullable_to_non_nullable
          : number as int,
      code: code == const $CopyWithPlaceholder()
          ? _value.code
          // ignore: cast_nullable_to_non_nullable
          : code as String,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as WorkOrderStatus,
      customer: customer == const $CopyWithPlaceholder()
          ? _value.customer
          // ignore: cast_nullable_to_non_nullable
          : customer as CustomerSummary,
      vehicle: vehicle == const $CopyWithPlaceholder()
          ? _value.vehicle
          // ignore: cast_nullable_to_non_nullable
          : vehicle as VehicleSummary,
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
      currency: currency == const $CopyWithPlaceholder()
          ? _value.currency
          // ignore: cast_nullable_to_non_nullable
          : currency as String,
      subtotalCents: subtotalCents == const $CopyWithPlaceholder()
          ? _value.subtotalCents
          // ignore: cast_nullable_to_non_nullable
          : subtotalCents as String,
      taxCents: taxCents == const $CopyWithPlaceholder()
          ? _value.taxCents
          // ignore: cast_nullable_to_non_nullable
          : taxCents as String,
      totalCents: totalCents == const $CopyWithPlaceholder()
          ? _value.totalCents
          // ignore: cast_nullable_to_non_nullable
          : totalCents as String,
      startedAt: startedAt == const $CopyWithPlaceholder()
          ? _value.startedAt
          // ignore: cast_nullable_to_non_nullable
          : startedAt as String?,
      completedAt: completedAt == const $CopyWithPlaceholder()
          ? _value.completedAt
          // ignore: cast_nullable_to_non_nullable
          : completedAt as String?,
      cancelledAt: cancelledAt == const $CopyWithPlaceholder()
          ? _value.cancelledAt
          // ignore: cast_nullable_to_non_nullable
          : cancelledAt as String?,
      cancellationReason: cancellationReason == const $CopyWithPlaceholder()
          ? _value.cancellationReason
          // ignore: cast_nullable_to_non_nullable
          : cancellationReason as String?,
      createdByAccountId: createdByAccountId == const $CopyWithPlaceholder()
          ? _value.createdByAccountId
          // ignore: cast_nullable_to_non_nullable
          : createdByAccountId as String,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
      updatedAt: updatedAt == const $CopyWithPlaceholder()
          ? _value.updatedAt
          // ignore: cast_nullable_to_non_nullable
          : updatedAt as String,
    );
  }
}

extension $WorkOrderViewCopyWith on WorkOrderView {
  /// Returns a callable class that can be used as follows: `instanceOfWorkOrderView.copyWith(...)` or like so:`instanceOfWorkOrderView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$WorkOrderViewCWProxy get copyWith => _$WorkOrderViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkOrderView _$WorkOrderViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'WorkOrderView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'number',
            'code',
            'status',
            'customer',
            'vehicle',
            'complaint',
            'notes',
            'mileage_in',
            'assigned_member_id',
            'promised_at',
            'currency',
            'subtotal_cents',
            'tax_cents',
            'total_cents',
            'started_at',
            'completed_at',
            'cancelled_at',
            'cancellation_reason',
            'created_by_account_id',
            'created_at',
            'updated_at',
          ],
        );
        final val = WorkOrderView(
          id: $checkedConvert('id', (v) => v as String),
          number: $checkedConvert('number', (v) => (v as num).toInt()),
          code: $checkedConvert('code', (v) => v as String),
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$WorkOrderStatusEnumMap, v),
          ),
          customer: $checkedConvert(
            'customer',
            (v) => CustomerSummary.fromJson(v as Map<String, dynamic>),
          ),
          vehicle: $checkedConvert(
            'vehicle',
            (v) => VehicleSummary.fromJson(v as Map<String, dynamic>),
          ),
          complaint: $checkedConvert('complaint', (v) => v as String),
          notes: $checkedConvert('notes', (v) => v as String?),
          mileageIn: $checkedConvert('mileage_in', (v) => (v as num?)?.toInt()),
          assignedMemberId: $checkedConvert(
            'assigned_member_id',
            (v) => v as String?,
          ),
          promisedAt: $checkedConvert('promised_at', (v) => v as String?),
          currency: $checkedConvert('currency', (v) => v as String),
          subtotalCents: $checkedConvert('subtotal_cents', (v) => v as String),
          taxCents: $checkedConvert('tax_cents', (v) => v as String),
          totalCents: $checkedConvert('total_cents', (v) => v as String),
          startedAt: $checkedConvert('started_at', (v) => v as String?),
          completedAt: $checkedConvert('completed_at', (v) => v as String?),
          cancelledAt: $checkedConvert('cancelled_at', (v) => v as String?),
          cancellationReason: $checkedConvert(
            'cancellation_reason',
            (v) => v as String?,
          ),
          createdByAccountId: $checkedConvert(
            'created_by_account_id',
            (v) => v as String,
          ),
          createdAt: $checkedConvert('created_at', (v) => v as String),
          updatedAt: $checkedConvert('updated_at', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'mileageIn': 'mileage_in',
        'assignedMemberId': 'assigned_member_id',
        'promisedAt': 'promised_at',
        'subtotalCents': 'subtotal_cents',
        'taxCents': 'tax_cents',
        'totalCents': 'total_cents',
        'startedAt': 'started_at',
        'completedAt': 'completed_at',
        'cancelledAt': 'cancelled_at',
        'cancellationReason': 'cancellation_reason',
        'createdByAccountId': 'created_by_account_id',
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
      },
    );

Map<String, dynamic> _$WorkOrderViewToJson(WorkOrderView instance) =>
    <String, dynamic>{
      'id': instance.id,
      'number': instance.number,
      'code': instance.code,
      'status': _$WorkOrderStatusEnumMap[instance.status]!,
      'customer': instance.customer.toJson(),
      'vehicle': instance.vehicle.toJson(),
      'complaint': instance.complaint,
      'notes': instance.notes,
      'mileage_in': instance.mileageIn,
      'assigned_member_id': instance.assignedMemberId,
      'promised_at': instance.promisedAt,
      'currency': instance.currency,
      'subtotal_cents': instance.subtotalCents,
      'tax_cents': instance.taxCents,
      'total_cents': instance.totalCents,
      'started_at': instance.startedAt,
      'completed_at': instance.completedAt,
      'cancelled_at': instance.cancelledAt,
      'cancellation_reason': instance.cancellationReason,
      'created_by_account_id': instance.createdByAccountId,
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
    };

const _$WorkOrderStatusEnumMap = {
  WorkOrderStatus.draft: 'draft',
  WorkOrderStatus.awaitingApproval: 'awaiting_approval',
  WorkOrderStatus.approved: 'approved',
  WorkOrderStatus.inProgress: 'in_progress',
  WorkOrderStatus.completed: 'completed',
  WorkOrderStatus.invoiced: 'invoiced',
  WorkOrderStatus.paid: 'paid',
  WorkOrderStatus.cancelled: 'cancelled',
};
