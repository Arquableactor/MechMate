//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/public_approval_view_findings_inner.dart';
import 'package:mechmate_api/src/model/public_approval_item.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_approval_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicApprovalView {
  /// Returns a new [PublicApprovalView] instance.
  PublicApprovalView({

    required  this.status,

    required  this.expiresAt,

    required  this.shopName,

    required  this.workOrderCode,

    required  this.vehicle,

    required  this.customerFirstName,

    required  this.currency,

    required  this.findings,

    required  this.items,

    required  this.subtotalCents,

    required  this.taxCents,

    required  this.totalCents,
  });

  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final PublicApprovalViewStatusEnum status;



  @JsonKey(
    
    name: r'expires_at',
    required: true,
    includeIfNull: false,
  )


  final String expiresAt;



  @JsonKey(
    
    name: r'shop_name',
    required: true,
    includeIfNull: false,
  )


  final String shopName;



  @JsonKey(
    
    name: r'work_order_code',
    required: true,
    includeIfNull: false,
  )


  final String workOrderCode;



  @JsonKey(
    
    name: r'vehicle',
    required: true,
    includeIfNull: false,
  )


  final String vehicle;



  @JsonKey(
    
    name: r'customer_first_name',
    required: true,
    includeIfNull: false,
  )


  final String customerFirstName;



  @JsonKey(
    
    name: r'currency',
    required: true,
    includeIfNull: false,
  )


  final String currency;



  @JsonKey(
    
    name: r'findings',
    required: true,
    includeIfNull: false,
  )


  final List<PublicApprovalViewFindingsInner> findings;



  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<PublicApprovalItem> items;



      /// Totales de lo que se va a cobrar (sin las rechazadas).
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





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicApprovalView &&
      other.status == status &&
      other.expiresAt == expiresAt &&
      other.shopName == shopName &&
      other.workOrderCode == workOrderCode &&
      other.vehicle == vehicle &&
      other.customerFirstName == customerFirstName &&
      other.currency == currency &&
      other.findings == findings &&
      other.items == items &&
      other.subtotalCents == subtotalCents &&
      other.taxCents == taxCents &&
      other.totalCents == totalCents;

    @override
    int get hashCode =>
        status.hashCode +
        expiresAt.hashCode +
        shopName.hashCode +
        workOrderCode.hashCode +
        vehicle.hashCode +
        customerFirstName.hashCode +
        currency.hashCode +
        findings.hashCode +
        items.hashCode +
        subtotalCents.hashCode +
        taxCents.hashCode +
        totalCents.hashCode;

  factory PublicApprovalView.fromJson(Map<String, dynamic> json) => _$PublicApprovalViewFromJson(json);

  Map<String, dynamic> toJson() => _$PublicApprovalViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum PublicApprovalViewStatusEnum {
@JsonValue(r'pending')
pending(r'pending'),
@JsonValue(r'completed')
completed(r'completed'),
@JsonValue(r'revoked')
revoked(r'revoked'),
@JsonValue(r'expired')
expired(r'expired');

const PublicApprovalViewStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


