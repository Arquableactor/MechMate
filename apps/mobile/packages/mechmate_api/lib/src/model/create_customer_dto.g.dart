// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_customer_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$CreateCustomerDtoCWProxy {
  CreateCustomerDto fullName(String fullName);

  CreateCustomerDto phone(String? phone);

  CreateCustomerDto email(String? email);

  CreateCustomerDto documentId(String? documentId);

  CreateCustomerDto notes(String? notes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CreateCustomerDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CreateCustomerDto(...).copyWith(id: 12, name: "My name")
  /// ````
  CreateCustomerDto call({
    String fullName,
    String? phone,
    String? email,
    String? documentId,
    String? notes,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfCreateCustomerDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfCreateCustomerDto.copyWith.fieldName(...)`
class _$CreateCustomerDtoCWProxyImpl implements _$CreateCustomerDtoCWProxy {
  const _$CreateCustomerDtoCWProxyImpl(this._value);

  final CreateCustomerDto _value;

  @override
  CreateCustomerDto fullName(String fullName) => this(fullName: fullName);

  @override
  CreateCustomerDto phone(String? phone) => this(phone: phone);

  @override
  CreateCustomerDto email(String? email) => this(email: email);

  @override
  CreateCustomerDto documentId(String? documentId) =>
      this(documentId: documentId);

  @override
  CreateCustomerDto notes(String? notes) => this(notes: notes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CreateCustomerDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CreateCustomerDto(...).copyWith(id: 12, name: "My name")
  /// ````
  CreateCustomerDto call({
    Object? fullName = const $CopyWithPlaceholder(),
    Object? phone = const $CopyWithPlaceholder(),
    Object? email = const $CopyWithPlaceholder(),
    Object? documentId = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
  }) {
    return CreateCustomerDto(
      fullName: fullName == const $CopyWithPlaceholder()
          ? _value.fullName
          // ignore: cast_nullable_to_non_nullable
          : fullName as String,
      phone: phone == const $CopyWithPlaceholder()
          ? _value.phone
          // ignore: cast_nullable_to_non_nullable
          : phone as String?,
      email: email == const $CopyWithPlaceholder()
          ? _value.email
          // ignore: cast_nullable_to_non_nullable
          : email as String?,
      documentId: documentId == const $CopyWithPlaceholder()
          ? _value.documentId
          // ignore: cast_nullable_to_non_nullable
          : documentId as String?,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
    );
  }
}

extension $CreateCustomerDtoCopyWith on CreateCustomerDto {
  /// Returns a callable class that can be used as follows: `instanceOfCreateCustomerDto.copyWith(...)` or like so:`instanceOfCreateCustomerDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$CreateCustomerDtoCWProxy get copyWith =>
      _$CreateCustomerDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateCustomerDto _$CreateCustomerDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'CreateCustomerDto',
      json,
      ($checkedConvert) {
        $checkKeys(json, requiredKeys: const ['full_name']);
        final val = CreateCustomerDto(
          fullName: $checkedConvert('full_name', (v) => v as String),
          phone: $checkedConvert('phone', (v) => v as String?),
          email: $checkedConvert('email', (v) => v as String?),
          documentId: $checkedConvert('document_id', (v) => v as String?),
          notes: $checkedConvert('notes', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {'fullName': 'full_name', 'documentId': 'document_id'},
    );

Map<String, dynamic> _$CreateCustomerDtoToJson(CreateCustomerDto instance) =>
    <String, dynamic>{
      'full_name': instance.fullName,
      'phone': ?instance.phone,
      'email': ?instance.email,
      'document_id': ?instance.documentId,
      'notes': ?instance.notes,
    };
