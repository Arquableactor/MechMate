// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_customer_dto.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$UpdateCustomerDtoCWProxy {
  UpdateCustomerDto fullName(String? fullName);

  UpdateCustomerDto phone(String? phone);

  UpdateCustomerDto email(String? email);

  UpdateCustomerDto documentId(String? documentId);

  UpdateCustomerDto notes(String? notes);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateCustomerDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateCustomerDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateCustomerDto call({
    String? fullName,
    String? phone,
    String? email,
    String? documentId,
    String? notes,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfUpdateCustomerDto.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfUpdateCustomerDto.copyWith.fieldName(...)`
class _$UpdateCustomerDtoCWProxyImpl implements _$UpdateCustomerDtoCWProxy {
  const _$UpdateCustomerDtoCWProxyImpl(this._value);

  final UpdateCustomerDto _value;

  @override
  UpdateCustomerDto fullName(String? fullName) => this(fullName: fullName);

  @override
  UpdateCustomerDto phone(String? phone) => this(phone: phone);

  @override
  UpdateCustomerDto email(String? email) => this(email: email);

  @override
  UpdateCustomerDto documentId(String? documentId) =>
      this(documentId: documentId);

  @override
  UpdateCustomerDto notes(String? notes) => this(notes: notes);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `UpdateCustomerDto(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// UpdateCustomerDto(...).copyWith(id: 12, name: "My name")
  /// ````
  UpdateCustomerDto call({
    Object? fullName = const $CopyWithPlaceholder(),
    Object? phone = const $CopyWithPlaceholder(),
    Object? email = const $CopyWithPlaceholder(),
    Object? documentId = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
  }) {
    return UpdateCustomerDto(
      fullName: fullName == const $CopyWithPlaceholder()
          ? _value.fullName
          // ignore: cast_nullable_to_non_nullable
          : fullName as String?,
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

extension $UpdateCustomerDtoCopyWith on UpdateCustomerDto {
  /// Returns a callable class that can be used as follows: `instanceOfUpdateCustomerDto.copyWith(...)` or like so:`instanceOfUpdateCustomerDto.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$UpdateCustomerDtoCWProxy get copyWith =>
      _$UpdateCustomerDtoCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCustomerDto _$UpdateCustomerDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'UpdateCustomerDto',
      json,
      ($checkedConvert) {
        final val = UpdateCustomerDto(
          fullName: $checkedConvert('full_name', (v) => v as String?),
          phone: $checkedConvert('phone', (v) => v as String?),
          email: $checkedConvert('email', (v) => v as String?),
          documentId: $checkedConvert('document_id', (v) => v as String?),
          notes: $checkedConvert('notes', (v) => v as String?),
        );
        return val;
      },
      fieldKeyMap: const {'fullName': 'full_name', 'documentId': 'document_id'},
    );

Map<String, dynamic> _$UpdateCustomerDtoToJson(UpdateCustomerDto instance) =>
    <String, dynamic>{
      'full_name': ?instance.fullName,
      'phone': ?instance.phone,
      'email': ?instance.email,
      'document_id': ?instance.documentId,
      'notes': ?instance.notes,
    };
