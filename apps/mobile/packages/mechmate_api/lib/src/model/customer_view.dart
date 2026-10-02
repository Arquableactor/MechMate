//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CustomerView {
  /// Returns a new [CustomerView] instance.
  CustomerView({

    required  this.id,

    required  this.fullName,

    required  this.phone,

    required  this.email,

    required  this.documentId,

    required  this.accountId,

    required  this.notes,

    required  this.createdAt,

    required  this.updatedAt,
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



      /// E.164, p. ej. `+18095551234`.
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: true,
  )


  final String? phone;



  @JsonKey(
    
    name: r'email',
    required: true,
    includeIfNull: true,
  )


  final String? email;



      /// Cédula: 11 dígitos sin guiones.
  @JsonKey(
    
    name: r'document_id',
    required: true,
    includeIfNull: true,
  )


  final String? documentId;



      /// Cuenta de la app vinculada, si el cliente se registró.
  @JsonKey(
    
    name: r'account_id',
    required: true,
    includeIfNull: true,
  )


  final String? accountId;



  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



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





    @override
    bool operator ==(Object other) => identical(this, other) || other is CustomerView &&
      other.id == id &&
      other.fullName == fullName &&
      other.phone == phone &&
      other.email == email &&
      other.documentId == documentId &&
      other.accountId == accountId &&
      other.notes == notes &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
        fullName.hashCode +
        (phone == null ? 0 : phone.hashCode) +
        (email == null ? 0 : email.hashCode) +
        (documentId == null ? 0 : documentId.hashCode) +
        (accountId == null ? 0 : accountId.hashCode) +
        (notes == null ? 0 : notes.hashCode) +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory CustomerView.fromJson(Map<String, dynamic> json) => _$CustomerViewFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

