//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/work_order_view.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'work_order_view_page.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class WorkOrderViewPage {
  /// Returns a new [WorkOrderViewPage] instance.
  WorkOrderViewPage({

    required  this.items,

    required  this.nextCursor,
  });

  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<WorkOrderView> items;



      /// Pasar como `cursor` para la siguiente página; null si no hay más.
  @JsonKey(
    
    name: r'next_cursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is WorkOrderViewPage &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory WorkOrderViewPage.fromJson(Map<String, dynamic> json) => _$WorkOrderViewPageFromJson(json);

  Map<String, dynamic> toJson() => _$WorkOrderViewPageToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

