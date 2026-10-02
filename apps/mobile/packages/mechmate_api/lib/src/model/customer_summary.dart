//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer_summary.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CustomerSummary {
  /// Returns a new [CustomerSummary] instance.
  CustomerSummary({

    required  this.id,

    required  this.fullName,

    required  this.phone,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'full_name',
    required: true,
    includeIfNull: false,
  )


  final String fullName;



  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: true,
  )


  final String? phone;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CustomerSummary &&
      other.id == id &&
      other.fullName == fullName &&
      other.phone == phone;

    @override
    int get hashCode =>
        id.hashCode +
        fullName.hashCode +
        (phone == null ? 0 : phone.hashCode);

  factory CustomerSummary.fromJson(Map<String, dynamic> json) => _$CustomerSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerSummaryToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

