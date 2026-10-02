//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/invoice_line_view.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'invoice_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class InvoiceView {
  /// Returns a new [InvoiceView] instance.
  InvoiceView({

    required  this.id,

    required  this.number,

    required  this.code,

    required  this.ncf,

    required  this.status,

    required  this.workOrderId,

    required  this.workOrderCode,

    required  this.shopName,

    required  this.customerName,

    required  this.customerDocumentId,

    required  this.vehicleDescription,

    required  this.currency,

    required  this.subtotalCents,

    required  this.taxCents,

    required  this.totalCents,

    required  this.issuedAt,

    required  this.paidAt,

    required  this.lines,
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



      /// Número interno por taller: `FAC-0001`.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;



      /// Comprobante fiscal de la DGII (e-CF). null mientras no haya proveedor fiscal.
  @JsonKey(
    
    name: r'ncf',
    required: true,
    includeIfNull: true,
  )


  final String? ncf;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final InvoiceViewStatusEnum status;



  @JsonKey(
    
    name: r'work_order_id',
    required: true,
    includeIfNull: false,
  )


  final String workOrderId;



  @JsonKey(
    
    name: r'work_order_code',
    required: true,
    includeIfNull: false,
  )


  final String workOrderCode;



  @JsonKey(
    
    name: r'shop_name',
    required: true,
    includeIfNull: false,
  )


  final String shopName;



  @JsonKey(
    
    name: r'customer_name',
    required: true,
    includeIfNull: false,
  )


  final String customerName;



  @JsonKey(
    
    name: r'customer_document_id',
    required: true,
    includeIfNull: true,
  )


  final String? customerDocumentId;



  @JsonKey(
    
    name: r'vehicle_description',
    required: true,
    includeIfNull: false,
  )


  final String vehicleDescription;



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
    
    name: r'issued_at',
    required: true,
    includeIfNull: false,
  )


  final String issuedAt;



  @JsonKey(
    
    name: r'paid_at',
    required: true,
    includeIfNull: true,
  )


  final String? paidAt;



  @JsonKey(
    
    name: r'lines',
    required: true,
    includeIfNull: false,
  )


  final List<InvoiceLineView> lines;





    @override
    bool operator ==(Object other) => identical(this, other) || other is InvoiceView &&
      other.id == id &&
      other.number == number &&
      other.code == code &&
      other.ncf == ncf &&
      other.status == status &&
      other.workOrderId == workOrderId &&
      other.workOrderCode == workOrderCode &&
      other.shopName == shopName &&
      other.customerName == customerName &&
      other.customerDocumentId == customerDocumentId &&
      other.vehicleDescription == vehicleDescription &&
      other.currency == currency &&
      other.subtotalCents == subtotalCents &&
      other.taxCents == taxCents &&
      other.totalCents == totalCents &&
      other.issuedAt == issuedAt &&
      other.paidAt == paidAt &&
      other.lines == lines;

    @override
    int get hashCode =>
        id.hashCode +
        number.hashCode +
        code.hashCode +
        (ncf == null ? 0 : ncf.hashCode) +
        status.hashCode +
        workOrderId.hashCode +
        workOrderCode.hashCode +
        shopName.hashCode +
        customerName.hashCode +
        (customerDocumentId == null ? 0 : customerDocumentId.hashCode) +
        vehicleDescription.hashCode +
        currency.hashCode +
        subtotalCents.hashCode +
        taxCents.hashCode +
        totalCents.hashCode +
        issuedAt.hashCode +
        (paidAt == null ? 0 : paidAt.hashCode) +
        lines.hashCode;

  factory InvoiceView.fromJson(Map<String, dynamic> json) => _$InvoiceViewFromJson(json);

  Map<String, dynamic> toJson() => _$InvoiceViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum InvoiceViewStatusEnum {
@JsonValue(r'issued')
issued(r'issued'),
@JsonValue(r'paid')
paid(r'paid'),
@JsonValue(r'voided')
voided(r'voided');

const InvoiceViewStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


