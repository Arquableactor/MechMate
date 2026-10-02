//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/work_order_status.dart';
import 'package:mechmate_api/src/model/vehicle_summary.dart';
import 'package:mechmate_api/src/model/work_order_item_view.dart';
import 'package:mechmate_api/src/model/customer_summary.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'work_order_detail_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class WorkOrderDetailView {
  /// Returns a new [WorkOrderDetailView] instance.
  WorkOrderDetailView({

    required  this.id,

    required  this.number,

    required  this.code,

    required  this.status,

    required  this.customer,

    required  this.vehicle,

    required  this.complaint,

    required  this.notes,

    required  this.mileageIn,

    required  this.assignedMemberId,

    required  this.promisedAt,

    required  this.currency,

    required  this.subtotalCents,

    required  this.taxCents,

    required  this.totalCents,

    required  this.startedAt,

    required  this.completedAt,

    required  this.cancelledAt,

    required  this.cancellationReason,

    required  this.createdByAccountId,

    required  this.createdAt,

    required  this.updatedAt,

    required  this.items,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'number',
    required: true,
    includeIfNull: false,
  )


  final int number;



      /// Número legible por taller: `OT-0001`.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final WorkOrderStatus status;



  @JsonKey(
    
    name: r'customer',
    required: true,
    includeIfNull: false,
  )


  final CustomerSummary customer;



  @JsonKey(
    
    name: r'vehicle',
    required: true,
    includeIfNull: false,
  )


  final VehicleSummary vehicle;



      /// Falla que reporta el cliente.
  @JsonKey(
    
    name: r'complaint',
    required: true,
    includeIfNull: false,
  )


  final String complaint;



  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



  @JsonKey(
    
    name: r'mileage_in',
    required: true,
    includeIfNull: true,
  )


  final int? mileageIn;



      /// shop_members.id asignado; null si no hay o ya no es miembro.
  @JsonKey(
    
    name: r'assigned_member_id',
    required: true,
    includeIfNull: true,
  )


  final String? assignedMemberId;



  @JsonKey(
    
    name: r'promised_at',
    required: true,
    includeIfNull: true,
  )


  final String? promisedAt;



  @JsonKey(
    
    name: r'currency',
    required: true,
    includeIfNull: false,
  )


  final String currency;



  @JsonKey(
    
    name: r'subtotal_cents',
    required: true,
    includeIfNull: false,
  )


  final String subtotalCents;



  @JsonKey(
    
    name: r'tax_cents',
    required: true,
    includeIfNull: false,
  )


  final String taxCents;



  @JsonKey(
    
    name: r'total_cents',
    required: true,
    includeIfNull: false,
  )


  final String totalCents;



  @JsonKey(
    
    name: r'started_at',
    required: true,
    includeIfNull: true,
  )


  final String? startedAt;



  @JsonKey(
    
    name: r'completed_at',
    required: true,
    includeIfNull: true,
  )


  final String? completedAt;



  @JsonKey(
    
    name: r'cancelled_at',
    required: true,
    includeIfNull: true,
  )


  final String? cancelledAt;



  @JsonKey(
    
    name: r'cancellation_reason',
    required: true,
    includeIfNull: true,
  )


  final String? cancellationReason;



  @JsonKey(
    
    name: r'created_by_account_id',
    required: true,
    includeIfNull: false,
  )


  final String createdByAccountId;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;



  @JsonKey(
    
    name: r'updated_at',
    required: true,
    includeIfNull: false,
  )


  final String updatedAt;



  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<WorkOrderItemView> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is WorkOrderDetailView &&
      other.id == id &&
      other.number == number &&
      other.code == code &&
      other.status == status &&
      other.customer == customer &&
      other.vehicle == vehicle &&
      other.complaint == complaint &&
      other.notes == notes &&
      other.mileageIn == mileageIn &&
      other.assignedMemberId == assignedMemberId &&
      other.promisedAt == promisedAt &&
      other.currency == currency &&
      other.subtotalCents == subtotalCents &&
      other.taxCents == taxCents &&
      other.totalCents == totalCents &&
      other.startedAt == startedAt &&
      other.completedAt == completedAt &&
      other.cancelledAt == cancelledAt &&
      other.cancellationReason == cancellationReason &&
      other.createdByAccountId == createdByAccountId &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt &&
      other.items == items;

    @override
    int get hashCode =>
        id.hashCode +
        number.hashCode +
        code.hashCode +
        status.hashCode +
        customer.hashCode +
        vehicle.hashCode +
        complaint.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        (mileageIn == null ? 0 : mileageIn.hashCode) +
        (assignedMemberId == null ? 0 : assignedMemberId.hashCode) +
        (promisedAt == null ? 0 : promisedAt.hashCode) +
        currency.hashCode +
        subtotalCents.hashCode +
        taxCents.hashCode +
        totalCents.hashCode +
        (startedAt == null ? 0 : startedAt.hashCode) +
        (completedAt == null ? 0 : completedAt.hashCode) +
        (cancelledAt == null ? 0 : cancelledAt.hashCode) +
        (cancellationReason == null ? 0 : cancellationReason.hashCode) +
        createdByAccountId.hashCode +
        createdAt.hashCode +
        updatedAt.hashCode +
        items.hashCode;

  factory WorkOrderDetailView.fromJson(Map<String, dynamic> json) => _$WorkOrderDetailViewFromJson(json);

  Map<String, dynamic> toJson() => _$WorkOrderDetailViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

