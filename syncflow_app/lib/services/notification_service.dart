import '../models/api_response.dart';
import '../models/notification.dart';
import 'api_client.dart';

class NotificationService {
  final ApiClient _api;

  NotificationService(this._api);

  Future<PaginatedResponse<AppNotification>> getNotifications({
    int page = 1,
    int limit = 20,
    bool? unreadOnly,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (unreadOnly == true) params['unreadOnly'] = true;

    final response = await _api.get('/api/notifications', queryParameters: params);
    return PaginatedResponse.fromJson(
      response,
      (e) => AppNotification.fromJson(e as Map<String, dynamic>),
    );
  }

  Future<void> markRead(String id) async {
    await _api.patch('/api/notifications/$id/read');
  }

  Future<void> markAllRead() async {
    await _api.patch('/api/notifications/read-all');
  }
}
