// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inspection_view.dart';

// **************************************************************************
// CopyWithGenerator
// **************************************************************************

abstract class _$InspectionViewCWProxy {
  InspectionView id(String id);

  InspectionView workOrderId(String workOrderId);

  InspectionView notes(String? notes);

  InspectionView findings(List<InspectionFindingView> findings);

  InspectionView createdAt(String createdAt);

  InspectionView updatedAt(String updatedAt);

  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InspectionView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InspectionView(...).copyWith(id: 12, name: "My name")
  /// ````
  InspectionView call({
    String id,
    String workOrderId,
    String? notes,
    List<InspectionFindingView> findings,
    String createdAt,
    String updatedAt,
  });
}

/// Proxy class for `copyWith` functionality. This is a callable class and can be used as follows: `instanceOfInspectionView.copyWith(...)`. Additionally contains functions for specific fields e.g. `instanceOfInspectionView.copyWith.fieldName(...)`
class _$InspectionViewCWProxyImpl implements _$InspectionViewCWProxy {
  const _$InspectionViewCWProxyImpl(this._value);

  final InspectionView _value;

  @override
  InspectionView id(String id) => this(id: id);

  @override
  InspectionView workOrderId(String workOrderId) =>
      this(workOrderId: workOrderId);

  @override
  InspectionView notes(String? notes) => this(notes: notes);

  @override
  InspectionView findings(List<InspectionFindingView> findings) =>
      this(findings: findings);

  @override
  InspectionView createdAt(String createdAt) => this(createdAt: createdAt);

  @override
  InspectionView updatedAt(String updatedAt) => this(updatedAt: updatedAt);

  @override
  /// This function **does support** nullification of nullable fields. All `null` values passed to `non-nullable` fields will be ignored. You can also use `InspectionView(...).copyWith.fieldName(...)` to override fields one at a time with nullification support.
  ///
  /// Usage
  /// ```dart
  /// InspectionView(...).copyWith(id: 12, name: "My name")
  /// ````
  InspectionView call({
    Object? id = const $CopyWithPlaceholder(),
    Object? workOrderId = const $CopyWithPlaceholder(),
    Object? notes = const $CopyWithPlaceholder(),
    Object? findings = const $CopyWithPlaceholder(),
    Object? createdAt = const $CopyWithPlaceholder(),
    Object? updatedAt = const $CopyWithPlaceholder(),
  }) {
    return InspectionView(
      id: id == const $CopyWithPlaceholder()
          ? _value.id
          // ignore: cast_nullable_to_non_nullable
          : id as String,
      workOrderId: workOrderId == const $CopyWithPlaceholder()
          ? _value.workOrderId
          // ignore: cast_nullable_to_non_nullable
          : workOrderId as String,
      notes: notes == const $CopyWithPlaceholder()
          ? _value.notes
          // ignore: cast_nullable_to_non_nullable
          : notes as String?,
      findings: findings == const $CopyWithPlaceholder()
          ? _value.findings
          // ignore: cast_nullable_to_non_nullable
          : findings as List<InspectionFindingView>,
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

extension $InspectionViewCopyWith on InspectionView {
  /// Returns a callable class that can be used as follows: `instanceOfInspectionView.copyWith(...)` or like so:`instanceOfInspectionView.copyWith.fieldName(...)`.
  // ignore: library_private_types_in_public_api
  _$InspectionViewCWProxy get copyWith => _$InspectionViewCWProxyImpl(this);
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InspectionView _$InspectionViewFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'InspectionView',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const [
            'id',
            'work_order_id',
            'notes',
            'findings',
            'created_at',
            'updated_at',
          ],
        );
        final val = InspectionView(
          id: $checkedConvert('id', (v) => v as String),
          workOrderId: $checkedConvert('work_order_id', (v) => v as String),
          notes: $checkedConvert('notes', (v) => v as String?),
          findings: $checkedConvert(
            'findings',
            (v) => (v as List<dynamic>)
                .map(
                  (e) =>
                      InspectionFindingView.fromJson(e as Map<String, dynamic>),
                )
                .toList(),
          ),
          createdAt: $checkedConvert('created_at', (v) => v as String),
          updatedAt: $checkedConvert('updated_at', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'workOrderId': 'work_order_id',
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
      },
    );

Map<String, dynamic> _$InspectionViewToJson(InspectionView instance) =>
    <String, dynamic>{
      'id': instance.id,
      'work_order_id': instance.workOrderId,
      'notes': instance.notes,
      'findings': instance.findings.map((e) => e.toJson()).toList(),
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
    };
