import '../models/card.dart';
import 'api_client.dart';

class CardService {
  final ApiClient _api;

  CardService(this._api);

  Future<List<CardModel>> getCards() async {
    final response = await _api.get('/api/cards');
    return (response['data'] as List<dynamic>)
        .map((e) => CardModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<CardModel> createCard(Map<String, dynamic> body) async {
    final response = await _api.post('/api/cards', data: body);
    return CardModel.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<CardModel> updateCard(String id, Map<String, dynamic> body) async {
    final response = await _api.put('/api/cards/$id', data: body);
    return CardModel.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteCard(String id) async {
    await _api.delete('/api/cards/$id');
  }
}
