//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:mechmate_api/src/model/history_entry.dart';
import 'package:mechmate_api/src/model/history_summary.dart';
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'history_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class HistoryView {
  /// Returns a new [HistoryView] instance.
  HistoryView({

    required  this.items,

    required  this.nextCursor,

    required  this.summary,
  });

  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<HistoryEntry> items;



      /// Pasar como `cursor` para la siguiente página; null si no hay más.
  @JsonKey(
    
    name: r'next_cursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;



  @JsonKey(
    
    name: r'summary',
    required: true,
    includeIfNull: false,
  )


  final HistorySummary summary;





    @override
    bool operator ==(Object other) => identical(this, other) || other is HistoryView &&
      other.items == items &&
      other.nextCursor == nextCursor &&
      other.summary == summary;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode) +
        summary.hashCode;

  factory HistoryView.fromJson(Map<String, dynamic> json) => _$HistoryViewFromJson(json);

  Map<String, dynamic> toJson() => _$HistoryViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

