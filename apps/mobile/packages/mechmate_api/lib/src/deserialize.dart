import 'package:mechmate_api/src/model/add_finding_dto.dart';
import 'package:mechmate_api/src/model/add_item_dto.dart';
import 'package:mechmate_api/src/model/add_role_dto.dart';
import 'package:mechmate_api/src/model/approval_request_view.dart';
import 'package:mechmate_api/src/model/charge_dto.dart';
import 'package:mechmate_api/src/model/charge_view.dart';
import 'package:mechmate_api/src/model/charge_view_invoice.dart';
import 'package:mechmate_api/src/model/charge_view_payment.dart';
import 'package:mechmate_api/src/model/charge_view_payout.dart';
import 'package:mechmate_api/src/model/charge_view_work_order.dart';
import 'package:mechmate_api/src/model/create_customer_dto.dart';
import 'package:mechmate_api/src/model/create_shop_dto.dart';
import 'package:mechmate_api/src/model/create_vehicle_dto.dart';
import 'package:mechmate_api/src/model/create_work_order_dto.dart';
import 'package:mechmate_api/src/model/customer_summary.dart';
import 'package:mechmate_api/src/model/customer_view.dart';
import 'package:mechmate_api/src/model/customer_view_page.dart';
import 'package:mechmate_api/src/model/decide_dto.dart';
import 'package:mechmate_api/src/model/decoded_vehicle_view.dart';
import 'package:mechmate_api/src/model/health_status.dart';
import 'package:mechmate_api/src/model/history_entry.dart';
import 'package:mechmate_api/src/model/history_entry_invoice.dart';
import 'package:mechmate_api/src/model/history_entry_payment.dart';
import 'package:mechmate_api/src/model/history_summary.dart';
import 'package:mechmate_api/src/model/history_view.dart';
import 'package:mechmate_api/src/model/inspection_finding_view.dart';
import 'package:mechmate_api/src/model/inspection_photo_view.dart';
import 'package:mechmate_api/src/model/inspection_view.dart';
import 'package:mechmate_api/src/model/invite_member_dto.dart';
import 'package:mechmate_api/src/model/invoice_line_view.dart';
import 'package:mechmate_api/src/model/invoice_view.dart';
import 'package:mechmate_api/src/model/invoice_view_page.dart';
import 'package:mechmate_api/src/model/item_decision_dto.dart';
import 'package:mechmate_api/src/model/me_response.dart';
import 'package:mechmate_api/src/model/open_inspection_dto.dart';
import 'package:mechmate_api/src/model/photo_upload_view.dart';
import 'package:mechmate_api/src/model/photo_upload_view_upload.dart';
import 'package:mechmate_api/src/model/public_approval_item.dart';
import 'package:mechmate_api/src/model/public_approval_view.dart';
import 'package:mechmate_api/src/model/public_approval_view_findings_inner.dart';
import 'package:mechmate_api/src/model/request_photo_upload_dto.dart';
import 'package:mechmate_api/src/model/shop_member_view.dart';
import 'package:mechmate_api/src/model/shop_view.dart';
import 'package:mechmate_api/src/model/transition_dto.dart';
import 'package:mechmate_api/src/model/update_customer_dto.dart';
import 'package:mechmate_api/src/model/update_finding_dto.dart';
import 'package:mechmate_api/src/model/update_item_dto.dart';
import 'package:mechmate_api/src/model/update_vehicle_dto.dart';
import 'package:mechmate_api/src/model/update_work_order_dto.dart';
import 'package:mechmate_api/src/model/vehicle_summary.dart';
import 'package:mechmate_api/src/model/vehicle_view.dart';
import 'package:mechmate_api/src/model/vehicle_view_page.dart';
import 'package:mechmate_api/src/model/vin_decode_view.dart';
import 'package:mechmate_api/src/model/work_order_detail_view.dart';
import 'package:mechmate_api/src/model/work_order_item_view.dart';
import 'package:mechmate_api/src/model/work_order_view.dart';
import 'package:mechmate_api/src/model/work_order_view_page.dart';

final _regList = RegExp(r'^List<(.*)>$');
final _regSet = RegExp(r'^Set<(.*)>$');
final _regMap = RegExp(r'^Map<String,(.*)>$');

  ReturnType deserialize<ReturnType, BaseType>(dynamic value, String targetType, {bool growable= true}) {
      switch (targetType) {
        case 'String':
          return '$value' as ReturnType;
        case 'int':
          return (value is int ? value : int.parse('$value')) as ReturnType;
        case 'bool':
          if (value is bool) {
            return value as ReturnType;
          }
          final valueString = '$value'.toLowerCase();
          return (valueString == 'true' || valueString == '1') as ReturnType;
        case 'double':
          return (value is double ? value : double.parse('$value')) as ReturnType;
        case 'AddFindingDto':
          return AddFindingDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'AddItemDto':
          return AddItemDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'AddRoleDto':
          return AddRoleDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ApprovalRequestView':
          return ApprovalRequestView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChargeDto':
          return ChargeDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChargeView':
          return ChargeView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChargeViewInvoice':
          return ChargeViewInvoice.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChargeViewPayment':
          return ChargeViewPayment.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChargeViewPayout':
          return ChargeViewPayout.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChargeViewWorkOrder':
          return ChargeViewWorkOrder.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateCustomerDto':
          return CreateCustomerDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateShopDto':
          return CreateShopDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateVehicleDto':
          return CreateVehicleDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateWorkOrderDto':
          return CreateWorkOrderDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerSummary':
          return CustomerSummary.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerView':
          return CustomerView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerViewPage':
          return CustomerViewPage.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'DecideDto':
          return DecideDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'DecodedVehicleView':
          return DecodedVehicleView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'FindingSeverity':
          
          
        case 'HealthStatus':
          return HealthStatus.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'HistoryEntry':
          return HistoryEntry.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'HistoryEntryInvoice':
          return HistoryEntryInvoice.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'HistoryEntryPayment':
          return HistoryEntryPayment.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'HistorySummary':
          return HistorySummary.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'HistoryView':
          return HistoryView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InspectionFindingView':
          return InspectionFindingView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InspectionPhotoView':
          return InspectionPhotoView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InspectionView':
          return InspectionView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InviteMemberDto':
          return InviteMemberDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InvoiceLineView':
          return InvoiceLineView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InvoiceView':
          return InvoiceView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'InvoiceViewPage':
          return InvoiceViewPage.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ItemApprovalStatus':
          
          
        case 'ItemDecisionDto':
          return ItemDecisionDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'MeResponse':
          return MeResponse.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'OpenInspectionDto':
          return OpenInspectionDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PaymentMethod':
          
          
        case 'PaymentStatus':
          
          
        case 'PhotoUploadView':
          return PhotoUploadView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PhotoUploadViewUpload':
          return PhotoUploadViewUpload.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicApprovalItem':
          return PublicApprovalItem.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicApprovalView':
          return PublicApprovalView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicApprovalViewFindingsInner':
          return PublicApprovalViewFindingsInner.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'RequestPhotoUploadDto':
          return RequestPhotoUploadDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'Role':
          
          
        case 'ShopMemberRole':
          
          
        case 'ShopMemberView':
          return ShopMemberView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ShopType':
          
          
        case 'ShopView':
          return ShopView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'TransitionDto':
          return TransitionDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateCustomerDto':
          return UpdateCustomerDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateFindingDto':
          return UpdateFindingDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateItemDto':
          return UpdateItemDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateVehicleDto':
          return UpdateVehicleDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateWorkOrderDto':
          return UpdateWorkOrderDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VehicleSummary':
          return VehicleSummary.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VehicleView':
          return VehicleView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VehicleViewPage':
          return VehicleViewPage.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VinDecodeView':
          return VinDecodeView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'WorkOrderDetailView':
          return WorkOrderDetailView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'WorkOrderItemType':
          
          
        case 'WorkOrderItemView':
          return WorkOrderItemView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'WorkOrderStatus':
          
          
        case 'WorkOrderView':
          return WorkOrderView.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'WorkOrderViewPage':
          return WorkOrderViewPage.fromJson(value as Map<String, dynamic>) as ReturnType;
        default:
          RegExpMatch? match;

          if (value is List && (match = _regList.firstMatch(targetType)) != null) {
            targetType = match![1]!; // ignore: parameter_assignments
            return value
              .map<BaseType>((dynamic v) => deserialize<BaseType, BaseType>(v, targetType, growable: growable))
              .toList(growable: growable) as ReturnType;
          }
          if (value is Set && (match = _regSet.firstMatch(targetType)) != null) {
            targetType = match![1]!; // ignore: parameter_assignments
            return value
              .map<BaseType>((dynamic v) => deserialize<BaseType, BaseType>(v, targetType, growable: growable))
              .toSet() as ReturnType;
          }
          if (value is Map && (match = _regMap.firstMatch(targetType)) != null) {
            targetType = match![1]!.trim(); // ignore: parameter_assignments
            return Map<String, BaseType>.fromIterables(
              value.keys as Iterable<String>,
              value.values.map((dynamic v) => deserialize<BaseType, BaseType>(v, targetType, growable: growable)),
            ) as ReturnType;
          }
          break;
    }
    throw Exception('Cannot deserialize');
  }