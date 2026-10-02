// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'approval_request_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$ApprovalRequestViewCWProxy {
  ApprovalRequestView id(String id);

  ApprovalRequestView status(ApprovalRequestViewStatusEnum status);

  ApprovalRequestView link(String link);

  ApprovalRequestView expiresAt(String expiresAt);

  ApprovalRequestView decidedAt(String? decidedAt);

  ApprovalRequestView createdAt(String createdAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ApprovalRequestView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ApprovalRequestView(...).copyWith(id: 12, name: "My name")
  /// ````
  ApprovalRequestView call({
    String id,
    ApprovalRequestViewStatusEnum status,
    String link,
    String expiresAt,
    String? decidedAt,
    String createdAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfApprovalRequestView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfApprovalRequestView.copyWith.fieldName(...)`
class _$ApprovalRequestViewCWProxyImpl implements _$ApprovalRequestViewCWProxy {
  const _$ApprovalRequestViewCWProxyImpl(this._value);

  final ApprovalRequestView _value;

  @override
  ApprovalRequestView id(String id) => this(id: id);

  @override
  ApprovalRequestView status(ApprovalRequestViewStatusEnum status) =>
      this(status: status);

  @override
  ApprovalRequestView link(String link) => this(link: link);

  @override
  ApprovalRequestView expiresAt(String expiresAt) => this(expiresAt: expiresAt);

  @override
  ApprovalRequestView decidedAt(String? decidedAt) =>
      this(decidedAt: decidedAt);

  @override
  ApprovalRequestView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `ApprovalRequestView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// ApprovalRequestView(...).copyWith(id: 12, name: "My name")
  /// ````
  ApprovalRequestView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? status = const $CopyWithPlaceholder(),
    Object? link = const $CopyWithPlaceholder(),
    Object? expiresAt = const $CopyWithPlaceholder(),
    Object? decidedAt = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
  }) {
    return ApprovalRequestView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      status: status == const $CopyWithPlaceholder()
          ? _value.status
          // ignore: cast_nullable_to_non_nullable
          : status as ApprovalRequestViewStatusEnum,
      link: link == const $CopyWithPlaceholder()
          ? _value.link
          // ignore: cast_nullable_to_non_nullable
          : link as String,
      expiresAt: expiresAt == const $CopyWithPlaceholder()
          ? _value.expiresAt
          // ignore: cast_nullable_to_non_nullable
          : expiresAt as String,
      decidedAt: decidedAt == const $CopyWithPlaceholder()
          ? _value.decidedAt
          // ignore: cast_nullable_to_non_nullable
          : decidedAt as String?,
      createdAt: createdAt == const $CopyWithPlaceholder()
          ? _value.createdAt
          // ignore: cast_nullable_to_non_nullable
          : createdAt as String,
    );
  }
}

extension $ApprovalRequestViewCopyWith on ApprovalRequestView {
  /// Returns a callable class that can be used as follows: `instanceOfApprovalRequestView.copyWith(...)` or like so:`instanceOfApprovalRequestView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$ApprovalRequestViewCWProxy get copyWith =>
      _$ApprovalRequestViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApprovalRequestView _$ApprovalRequestViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'ApprovalRequestView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'status',
            'link',
            'expires_at',
            'decided_at',
            'created_at',
          ],
        );
        final val = ApprovalRequestView(
          id: $checkedConvert('id', (v) => v as String),
          status: $checkedConvert(
            'status',
            (v) => $enumDecode(_$ApprovalRequestViewStatusEnumEnumMap, v),
          ),
          link: $checkedConvert('link', (v) => v as String),
          expiresAt: $checkedConvert('expires_at', (v) => v as String),
          decidedAt: $checkedConvert('decided_at', (v) => v as String?),
          createdAt: $checkedConvert('created_at', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'expiresAt': 'expires_at',
        'decidedAt': 'decided_at',
        'createdAt': 'created_at',
      },
    );

Map<String, dynamic> _$ApprovalRequestViewToJson(
  ApprovalRequestView instance,
) => <String, dynamic>{
  'id': instance.id,
  'status': _$ApprovalRequestViewStatusEnumEnumMap[instance.status]!,
  'link': instance.link,
  'expires_at': instance.expiresAt,
  'decided_at': instance.decidedAt,
  'created_at': instance.createdAt,
};

const _$ApprovalRequestViewStatusEnumEnumMap = {
  ApprovalRequestViewStatusEnum.pending: 'pending',
  ApprovalRequestViewStatusEnum.completed: 'completed',
  ApprovalRequestViewStatusEnum.revoked: 'revoked',
};
