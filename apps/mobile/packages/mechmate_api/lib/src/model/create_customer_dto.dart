//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_customer_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateCustomerDto {
  /// Returns a new [CreateCustomerDto] instance.
  CreateCustomerDto({

    required  this.fullName,

     this.phone,

     this.email,

     this.documentId,

     this.notes,
  });

  @JsonKey(
    
    name: r'full_name',
    required: true,
    includeIfNull: false,
  )


  final String fullName;



      /// Se guarda en E.164 (+18095551234).
  @JsonKey(
    
    name: r'phone',
    required: false,
    includeIfNull: false,
  )


  final String? phone;



  @JsonKey(
    
    name: r'email',
    required: false,
    includeIfNull: false,
  )


  final String? email;



      /// Cédula; se guarda en 11 dígitos.
  @JsonKey(
    
    name: r'document_id',
    required: false,
    includeIfNull: false,
  )


  final String? documentId;



  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateCustomerDto &&
      other.fullName == fullName &&
      other.phone == phone &&
      other.email == email &&
      other.documentId == documentId &&
      other.notes == notes;

    @override
    int get hashCode =>
        fullName.hashCode +
        (phone == null ? 0 : phone.hashCode) +
        (email == null ? 0 : email.hashCode) +
        (documentId == null ? 0 : documentId.hashCode) +
        (notes == null ? 0 : notes.hashCode);

  factory CreateCustomerDto.fromJson(Map<String, dynamic> json) => _$CreateCustomerDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateCustomerDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

