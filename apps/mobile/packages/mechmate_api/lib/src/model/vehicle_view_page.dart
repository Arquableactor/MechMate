//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/vehicle_view.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vehicle_view_page.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VehicleViewPage {
  /// Returns a new [VehicleViewPage] instance.
  VehicleViewPage({

    required  this.items,

    required  this.nextCursor,
  });

  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<VehicleView> items;



      /// Pasar como `cursor` para la siguiente página; null si no hay más.
  @JsonKey(
    
    name: r'next_cursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VehicleViewPage &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory VehicleViewPage.fromJson(Map<String, dynamic> json) => _$VehicleViewPageFromJson(json);

  Map<String, dynamic> toJson() => _$VehicleViewPageToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

