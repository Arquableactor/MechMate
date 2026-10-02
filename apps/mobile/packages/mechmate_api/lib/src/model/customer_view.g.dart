// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$CustomerViewCWProxy {
  CustomerView id(String id);

  CustomerView fullName(String fullName);

  CustomerView phone(String? phone);

  CustomerView email(String? email);

  CustomerView documentId(String? documentId);

  CustomerView accountId(String? accountId);

  CustomerView notes(String? notes);

  CustomerView createdAt(String createdAt);

  CustomerView updatedAt(String updatedAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CustomerView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CustomerView(...).copyWith(id: 12, name: "My name")
  /// ````
  CustomerView call({
    String id,
    String fullName,
    String? phone,
    String? email,
    String? documentId,
    String? accountId,
    String? notes,
    String createdAt,
    String updatedAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfCustomerView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfCustomerView.copyWith.fieldName(...)`
class _$CustomerViewCWProxyImpl implements _$CustomerViewCWProxy {
  const _$CustomerViewCWProxyImpl(this._value);

  final CustomerView _value;

  @override
  CustomerView id(String id) => this(id: id);

  @override
  CustomerView fullName(String fullName) => this(fullName: fullName);

  @override
  CustomerView phone(String? phone) => this(phone: phone);

  @override
  CustomerView email(String? email) => this(email: email);

  @override
  CustomerView documentId(String? documentId) => this(documentId: documentId);

  @override
  CustomerView accountId(String? accountId) => this(accountId: accountId);

  @override
  CustomerView notes(String? notes) => this(notes: notes);

  @override
  CustomerView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  CustomerView updatedAt(String updatedAt) => this(updatedAt: updatedAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CustomerView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CustomerView(...).copyWith(id: 12, name: "My name")
  /// ````
  CustomerView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? fullName = const $CopyWithPlaceholder(),
    Object? phone = const $CopyWithPlaceholder(),
    Object? email = const $CopyWithPlaceholder(),
    Object? documentId = const $CopyWithPlaceholder(),
    Object? accountId = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
    Object? updatedAt = const $CopyWithPlaceholder(),
  }) {
    return CustomerView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
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
      accountId: accountId == const $CopyWithPlaceholder()
          ? _value.accountId
          // ignore: cast_nullable_to_non_nullable
          : accountId as String?,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
      updatedAt: updatedAt == const $CopyWithPlaceholder()
          ? _value.updatedAt
          // ignore: cast_nullable_to_non_nullable
          : updatedAt as String,
    );
  }
}

extension $CustomerViewCopyWith on CustomerView {
  /// Returns a callable class that can be used as follows: `instanceOfCustomerView.copyWith(...)` or like so:`instanceOfCustomerView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$CustomerViewCWProxy get copyWith => _$CustomerViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerView _$CustomerViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'CustomerView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'full_name',
            'phone',
            'email',
            'document_id',
            'account_id',
            'notes',
            'created_at',
            'updated_at',
          ],
        );
        final val = CustomerView(
          id: $checkedConvert('id', (v) => v as String),
          fullName: $checkedConvert('full_name', (v) => v as String),
          phone: $checkedConvert('phone', (v) => v as String?),
          email: $checkedConvert('email', (v) => v as String?),
          documentId: $checkedConvert('document_id', (v) => v as String?),
          accountId: $checkedConvert('account_id', (v) => v as String?),
          notes: $checkedConvert('notes', (v) => v as String?),
          createdAt: $checkedConvert('created_at', (v) => v as String),
          updatedAt: $checkedConvert('updated_at', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'fullName': 'full_name',
        'documentId': 'document_id',
        'accountId': 'account_id',
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
      },
    );

Map<String, dynamic> _$CustomerViewToJson(CustomerView instance) =>
    <String, dynamic>{
      'id': instance.id,
      'full_name': instance.fullName,
      'phone': instance.phone,
      'email': instance.email,
      'document_id': instance.documentId,
      'account_id': instance.accountId,
      'notes': instance.notes,
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
    };
