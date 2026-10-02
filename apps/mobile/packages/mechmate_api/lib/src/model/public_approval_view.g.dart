// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_approval_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$PublicApprovalViewCWProxy {
  PublicApprovalView status(PublicApprovalViewStatusEnum status);

  PublicApprovalView expiresAt(String expiresAt);

  PublicApprovalView shopName(String shopName);

  PublicApprovalView workOrderCode(String workOrderCode);

  PublicApprovalView vehicle(String vehicle);

  PublicApprovalView customerFirstName(String customerFirstName);

  PublicApprovalView currency(String currency);

  PublicApprovalView findings(List<PublicApprovalViewFindingsInner> findings);

  PublicApprovalView items(List<PublicApprovalItem> items);

  PublicApprovalView subtotalCents(String subtotalCents);

  PublicApprovalView taxCents(String taxCents);

  PublicApprovalView totalCents(String totalCents);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PublicApprovalView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PublicApprovalView(...).copyWith(id: 12, name: "My name")
  /// ````
  PublicApprovalView call({
    PublicApprovalViewStatusEnum status,
    String expiresAt,
    String shopName,
    String workOrderCode,
    String vehicle,
    String customerFirstName,
    String currency,
    List<PublicApprovalViewFindingsInner> findings,
    List<PublicApprovalItem> items,
    String subtotalCents,
    String taxCents,
    String totalCents,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfPublicApprovalView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfPublicApprovalView.copyWith.fieldName(...)`
class _$PublicApprovalViewCWProxyImpl implements _$PublicApprovalViewCWProxy {
  const _$PublicApprovalViewCWProxyImpl(this._value);

  final PublicApprovalView _value;

  @override
  PublicApprovalView status(PublicApprovalViewStatusEnum status) =>
      this(status: status);

  @override
  PublicApprovalView expiresAt(String expiresAt) => this(expiresAt: expiresAt);

  @override
  PublicApprovalView shopName(String shopName) => this(shopName: shopName);

  @override
  PublicApprovalView workOrderCode(String workOrderCode) =>
      this(workOrderCode: workOrderCode);

  @override
  PublicApprovalView vehicle(String vehicle) => this(vehicle: vehicle);

  @override
  PublicApprovalView customerFirstName(String customerFirstName) =>
      this(customerFirstName: customerFirstName);

  @override
  PublicApprovalView currency(String currency) => this(currency: currency);

  @override
  PublicApprovalView findings(List<PublicApprovalViewFindingsInner> findings) =>
      this(findings: findings);

  @override
  PublicApprovalView items(List<PublicApprovalItem> items) =>
      this(items: items);

  @override
  PublicApprovalView subtotalCents(String subtotalCents) =>
      this(subtotalCents: subtotalCents);

  @override
  PublicApprovalView taxCents(String taxCents) => this(taxCents: taxCents);

  @override
  PublicApprovalView totalCents(String totalCents) =>
      this(totalCents: totalCents);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `PublicApprovalView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// PublicApprovalView(...).copyWith(id: 12, name: "My name")
  /// ````
  PublicApprovalView call({
    Object? status = const $CopyWithPlaceholder(),
    Object? expiresAt = const $CopyWithPlaceholder(),
    Object? shopName = const $CopyWithPlaceholder(),
    Object? workOrderCode = const $CopyWithPlaceholder(),
    Object? vehicle = const $CopyWithPlaceholder(),
    Object? customerFirstName = const $CopyWithPlaceholder(),
    Object? currency = const $CopyWithPlaceholder(),
    Object? findings = const $CopyWithPlaceholder(),
    Object? items = const $CopyWithPlaceholder(),
    Object? subtotalCents = const $CopyWithPlaceholder(),
    Object? taxCents = const $CopyWithPlaceholder(),
    Object? totalCents = const $CopyWithPlaceholder(),
  }) {
    return PublicApprovalView(
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as PublicApprovalViewStatusEnum,
      expiresAt: expiresAt == const $CopyWithPlaceholder()
          ? _value.expiresAt
          // ignore: cast_nullable_to_non_nullable
          : expiresAt as String,
      shopName: shopName == const $CopyWithPlaceholder()
          ? _value.shopName
          // ignore: cast_nullable_to_non_nullable
          : shopName as String,
      workOrderCode: workOrderCode == const $CopyWithPlaceholder()
          ? _value.workOrderCode
          // ignore: cast_nullable_to_non_nullable
          : workOrderCode as String,
      vehicle: vehicle == const $CopyWithPlaceholder()
          ? _value.vehicle
          // ignore: cast_nullable_to_non_nullable
          : vehicle as String,
      customerFirstName: customerFirstName == const $CopyWithPlaceholder()
          ? _value.customerFirstName
          // ignore: cast_nullable_to_non_nullable
          : customerFirstName as String,
      currency: currency == const $CopyWithPlaceholder()
          ? _value.currency
          // ignore: cast_nullable_to_non_nullable
          : currency as String,
      findings: findings == const $CopyWithPlaceholder()
          ? _value.findings
          // ignore: cast_nullable_to_non_nullable
          : findings as List<PublicApprovalViewFindingsInner>,
      items: items == const $CopyWithPlaceholder()
          ? _value.items
          // ignore: cast_nullable_to_non_nullable
          : items as List<PublicApprovalItem>,
      subtotalCents: subtotalCents == const $CopyWithPlaceholder()
          ? _value.subtotalCents
          // ignore: cast_nullable_to_non_nullable
          : subtotalCents as String,
      taxCents: taxCents == const $CopyWithPlaceholder()
          ? _value.taxCents
          // ignore: cast_nullable_to_non_nullable
          : taxCents as String,
      totalCents: totalCents == const $CopyWithPlaceholder()
          ? _value.totalCents
          // ignore: cast_nullable_to_non_nullable
          : totalCents as String,
    );
  }
}

extension $PublicApprovalViewCopyWith on PublicApprovalView {
  /// Returns a callable class that can be used as follows: `instanceOfPublicApprovalView.copyWith(...)` or like so:`instanceOfPublicApprovalView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$PublicApprovalViewCWProxy get copyWith =>
      _$PublicApprovalViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicApprovalView _$PublicApprovalViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'PublicApprovalView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'status',
            'expires_at',
            'shop_name',
            'work_order_code',
            'vehicle',
            'customer_first_name',
            'currency',
            'findings',
            'items',
            'subtotal_cents',
            'tax_cents',
            'total_cents',
          ],
        );
        final val = PublicApprovalView(
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$PublicApprovalViewStatusEnumEnumMap, v),
          ),
          expiresAt: $checkedConvert('expires_at', (v) => v as String),
          shopName: $checkedConvert('shop_name', (v) => v as String),
          workOrderCode: $checkedConvert('work_order_code', (v) => v as String),
          vehicle: $checkedConvert('vehicle', (v) => v as String),
          customerFirstName: $checkedConvert(
            'customer_first_name',
            (v) => v as String,
          ),
          currency: $checkedConvert('currency', (v) => v as String),
          findings: $checkedConvert(
            'findings',
            (v) => (v as List<dynamic>)
                .map(
                  (e) => PublicApprovalViewFindingsInner.fromJson(
                    e as Map<String, dynamic>,
                  ),
                )
                .toList(),
          ),
          items: $checkedConvert(
            'items',
            (v) => (v as List<dynamic>)
                .map(
                  (e) => PublicApprovalItem.fromJson(e as Map<String, dynamic>),
                )
                .toList(),
          ),
          subtotalCents: $checkedConvert('subtotal_cents', (v) => v as String),
          taxCents: $checkedConvert('tax_cents', (v) => v as String),
          totalCents: $checkedConvert('total_cents', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'expiresAt': 'expires_at',
        'shopName': 'shop_name',
        'workOrderCode': 'work_order_code',
        'customerFirstName': 'customer_first_name',
        'subtotalCents': 'subtotal_cents',
        'taxCents': 'tax_cents',
        'totalCents': 'total_cents',
      },
    );

Map<String, dynamic> _$PublicApprovalViewToJson(PublicApprovalView instance) =>
    <String, dynamic>{
      'status': _$PublicApprovalViewStatusEnumEnumMap[instance.status]!,
      'expires_at': instance.expiresAt,
      'shop_name': instance.shopName,
      'work_order_code': instance.workOrderCode,
      'vehicle': instance.vehicle,
      'customer_first_name': instance.customerFirstName,
      'currency': instance.currency,
      'findings': instance.findings.map((e) => e.toJson()).toList(),
      'items': instance.items.map((e) => e.toJson()).toList(),
      'subtotal_cents': instance.subtotalCents,
      'tax_cents': instance.taxCents,
      'total_cents': instance.totalCents,
    };

const _$PublicApprovalViewStatusEnumEnumMap = {
  PublicApprovalViewStatusEnum.pending: 'pending',
  PublicApprovalViewStatusEnum.completed: 'completed',
  PublicApprovalViewStatusEnum.revoked: 'revoked',
  PublicApprovalViewStatusEnum.expired: 'expired',
};
