//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'history_entry_invoice.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class HistoryEntryInvoice {
  /// Returns a new [HistoryEntryInvoice] instance.
  HistoryEntryInvoice({

    required  this.id,

    required  this.code,

    required  this.status,

    required  this.ncf,

    required  this.totalCents,

    required  this.paidAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



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


  final HistoryEntryInvoiceStatusEnum status;



  @JsonKey(
    
    name: r'ncf',
    required: true,
    includeIfNull: true,
  )


  final String? ncf;



  @JsonKey(
    
    name: r'total_cents',
    required: true,
    includeIfNull: false,
  )


  final String totalCents;



  @JsonKey(
    
    name: r'paid_at',
    required: true,
    includeIfNull: true,
  )


  final String? paidAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is HistoryEntryInvoice &&
      other.id == id &&
      other.code == code &&
      other.status == status &&
      other.ncf == ncf &&
      other.totalCents == totalCents &&
      other.paidAt == paidAt;

    @override
    int get hashCode =>
        id.hashCode +
        code.hashCode +
        status.hashCode +
        (ncf == null ? 0 : ncf.hashCode) +
        totalCents.hashCode +
        (paidAt == null ? 0 : paidAt.hashCode);

  factory HistoryEntryInvoice.fromJson(Map<String, dynamic> json) => _$HistoryEntryInvoiceFromJson(json);

  Map<String, dynamic> toJson() => _$HistoryEntryInvoiceToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum HistoryEntryInvoiceStatusEnum {
@JsonValue(r'issued')
issued(r'issued'),
@JsonValue(r'paid')
paid(r'paid'),
@JsonValue(r'voided')
voided(r'voided');

const HistoryEntryInvoiceStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


