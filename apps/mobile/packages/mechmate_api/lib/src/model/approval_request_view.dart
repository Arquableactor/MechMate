//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:json_annotation/json_annotation.dart';

part 'approval_request_view.g.dart';


@CopyWith()
@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ApprovalRequestView {
  /// Returns a new [ApprovalRequestView] instance.
  ApprovalRequestView({

    required  this.id,

    required  this.status,

    required  this.link,

    required  this.expiresAt,

    required  this.decidedAt,

    required  this.createdAt,
  });

  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  )


  final ApprovalRequestViewStatusEnum status;



      /// Enlace para el cliente. El taller puede compartirlo por su propio WhatsApp.
  @JsonKey(
    
    name: r'link',
    required: true,
    includeIfNull: false,
  )


  final String link;



  @JsonKey(
    
    name: r'expires_at',
    required: true,
    includeIfNull: false,
  )


  final String expiresAt;



  @JsonKey(
    
    name: r'decided_at',
    required: true,
    includeIfNull: true,
  )


  final String? decidedAt;



  @JsonKey(
    
    name: r'created_at',
    required: true,
    includeIfNull: false,
  )


  final String createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ApprovalRequestView &&
      other.id == id &&
      other.status == status &&
      other.link == link &&
      other.expiresAt == expiresAt &&
      other.decidedAt == decidedAt &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        status.hashCode +
        link.hashCode +
        expiresAt.hashCode +
        (decidedAt == null ? 0 : decidedAt.hashCode) +
        createdAt.hashCode;

  factory ApprovalRequestView.fromJson(Map<String, dynamic> json) => _$ApprovalRequestViewFromJson(json);

  Map<String, dynamic> toJson() => _$ApprovalRequestViewToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

enum ApprovalRequestViewStatusEnum {
@JsonValue(r'pending')
pending(r'pending'),
@JsonValue(r'completed')
completed(r'completed'),
@JsonValue(r'revoked')
revoked(r'revoked');

const ApprovalRequestViewStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


