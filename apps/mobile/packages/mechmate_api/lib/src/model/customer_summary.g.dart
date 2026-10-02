// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_summary.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$CustomerSummaryCWProxy {
  CustomerSummary id(String id);

  CustomerSummary fullName(String fullName);

  CustomerSummary phone(String? phone);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CustomerSummary(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CustomerSummary(...).copyWith(id: 12, name: "My name")
  /// ````
  CustomerSummary call({String id, String fullName, String? phone});
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfCustomerSummary.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfCustomerSummary.copyWith.fieldName(...)`
class _$CustomerSummaryCWProxyImpl implements _$CustomerSummaryCWProxy {
  const _$CustomerSummaryCWProxyImpl(this._value);

  final CustomerSummary _value;

  @override
  CustomerSummary id(String id) => this(id: id);

  @override
  CustomerSummary fullName(String fullName) => this(fullName: fullName);

  @override
  CustomerSummary phone(String? phone) => this(phone: phone);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `CustomerSummary(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// CustomerSummary(...).copyWith(id: 12, name: "My name")
  /// ````
  CustomerSummary call({
    Object? id = const $CopyWithPlaceholder(),
    Object? fullName = const $CopyWithPlaceholder(),
    Object? phone = const $CopyWithPlaceholder(),
  }) {
    return CustomerSummary(
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
    );
  }
}

extension $CustomerSummaryCopyWith on CustomerSummary {
  /// Returns a callable class that can be used as follows: `instanceOfCustomerSummary.copyWith(...)` or like so:`instanceOfCustomerSummary.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$CustomerSummaryCWProxy get copyWith => _$CustomerSummaryCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerSummary _$CustomerSummaryFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CustomerSummary', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['id', 'full_name', 'phone']);
      final val = CustomerSummary(
        id: $checkedConvert('id', (v) => v as String),
        fullName: $checkedConvert('full_name', (v) => v as String),
        phone: $checkedConvert('phone', (v) => v as String?),
      );
      return val;
    }, fieldKeyMap: const {'fullName': 'full_name'});

Map<String, dynamic> _$CustomerSummaryToJson(CustomerSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'full_name': instance.fullName,
      'phone': instance.phone,
    };
