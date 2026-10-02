//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'update_work_order_dto.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateWorkOrderDto {
  /// Returns a new [UpdateWorkOrderDto] instance.
  UpdateWorkOrderDto({

     this.complaint,

     this.notes,

     this.mileageIn,

     this.assignedMemberId,

     this.promisedAt,
  });

  @JsonKey(
    
    name: r'complaint',
    required: false,
    includeIfNull: false,
  )


  final String? complaint;



  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;



      /// Odómetro al recibir el vehículo.
  @JsonKey(
    
    name: r'mileage_in',
    required: false,
    includeIfNull: false,
  )


  final int? mileageIn;



      /// shop_members.id del mecánico asignado.
  @JsonKey(
    
    name: r'assigned_member_id',
    required: false,
    includeIfNull: false,
  )


  final String? assignedMemberId;



  @JsonKey(
    
    name: r'promised_at',
    required: false,
    includeIfNull: false,
  )


  final String? promisedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateWorkOrderDto &&
      other.complaint == complaint &&
      other.notes == notes &&
      other.mileageIn == mileageIn &&
      other.assignedMemberId == assignedMemberId &&
      other.promisedAt == promisedAt;

    @override
    int get hashCode =>
        complaint.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        (mileageIn == null ? 0 : mileageIn.hashCode) +
        (assignedMemberId == null ? 0 : assignedMemberId.hashCode) +
        (promisedAt == null ? 0 : promisedAt.hashCode);

  factory UpdateWorkOrderDto.fromJson(Map<String, dynamic> json) => _$UpdateWorkOrderDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateWorkOrderDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

