//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/payment_method.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'history_entry_payment.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class HistoryEntryPayment {
  /// Returns a new [HistoryEntryPayment] instance.
  HistoryEntryPayment({

    required  this.method,
  });

  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  )


  final PaymentMethod method;





    @override
    bool operator ==(Object other) => identical(this, other) || other is HistoryEntryPayment &&
      other.method == method;

    @override
    int get hashCode =>
        method.hashCode;

  factory HistoryEntryPayment.fromJson(Map<String, dynamic> json) => _$HistoryEntryPaymentFromJson(json);

  Map<String, dynamic> toJson() => _$HistoryEntryPaymentToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

