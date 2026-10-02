//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:mechmate_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:mechmate_api/src/model/charge_dto.dart';
import 'package:mechmate_api/src/model/charge_view.dart';

class BillingApi {

  final Dio _dio;

  const BillingApi(this._dio);

  /// Cobra la factura de la OT (tarjeta vía CardNet, efectivo o transferencia). OT → paid; con tarjeta, payout al taller a T+2 hábiles. Idempotente: reintentar con la misma Idempotency-Key no cobra de nuevo.
  /// 
  ///
  /// Parameters:
  /// * [shopId] 
  /// * [workOrderId] 
  /// * [idempotencyKey] - 8–100 caracteres [A-Za-z0-9_-], único por intento de cobro.
  /// * [chargeDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ChargeView] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ChargeView>> chargesCharge({ 
    required String shopId,
    required String workOrderId,
    required String idempotencyKey,
    required ChargeDto chargeDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/shops/{shopId}/work-orders/{workOrderId}/charge'.replaceAll('{' r'shopId' '}', shopId.toString()).replaceAll('{' r'workOrderId' '}', workOrderId.toString());
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        r'Idempotency-Key': idempotencyKey,
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[
          {
            'type': 'http',
            'scheme': 'bearer',
            'name': 'bearer',
          },
        ],
        ...?extra,
      },
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
      _bodyData = jsonEncode(chargeDto);

    } catch(error, stackTrace) {
      throw DioException(
         requestOptions: _options.compose(
          _dio.options,
          _path,
        ),
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    final _response = await _dio.request<Object>(
      _path,
      data: _bodyData,
      options: _options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    ChargeView? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ChargeView, ChargeView>(rawData, 'ChargeView', growable: true);

    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ChargeView>(
      data: _responseData,
      headers: _response.headers,
      isRedirect: _response.isRedirect,
      requestOptions: _response.requestOptions,
      redirects: _response.redirects,
      statusCode: _response.statusCode,
      statusMessage: _response.statusMessage,
      extra: _response.extra,
    );
  }

}
