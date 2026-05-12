import 'package:bewerbi_tn_flutter/models/message.dart';

class ChatService {
  ChatService._();

  static final List<Conversation> _conversations = [
    Conversation(
      id: 'conv-1',
      applicantId: 'user-1',
      employerId: 'user-2',
      jobId: 'job-1',
      jobTitle: 'Pflegefachkraft (m/w/d)',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      lastMessage:
          'Wir freuen uns auf Ihre Bewerbungsunterlagen. Bitte senden Sie uns Ihren Lebenslauf.',
      lastMessageAt: DateTime.now().subtract(const Duration(hours: 3)),
      unreadCount: 1,
    ),
    Conversation(
      id: 'conv-2',
      applicantId: 'user-1',
      employerId: 'user-3',
      jobId: 'job-4',
      jobTitle: 'Full-Stack Entwickler (m/w/d)',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      lastMessage:
          'Vielen Dank für Ihr Interesse! Wann wären Sie für ein Gespräch verfügbar?',
      lastMessageAt: DateTime.now().subtract(const Duration(days: 1)),
      unreadCount: 0,
    ),
  ];

  static final List<Message> _messages = [
    // Conversation 1: Deutsche Pflegedienst GmbH
    Message(
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-2',
      text:
          'Guten Tag! Vielen Dank für Ihr Interesse an der Stelle als Pflegefachkraft. Haben Sie bereits Erfahrung in der Altenpflege?',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      isRead: true,
    ),
    Message(
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-1',
      text:
          'Vielen Dank für Ihre Nachricht! Ja, ich habe 3 Jahre Erfahrung in der Intensivpflege in Tunesien und mein Deutsch-Niveau ist B2.',
      createdAt:
          DateTime.now().subtract(const Duration(days: 1, hours: 20)),
      isRead: true,
    ),
    Message(
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-2',
      text:
          'Wir freuen uns auf Ihre Bewerbungsunterlagen. Bitte senden Sie uns Ihren Lebenslauf.',
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      isRead: false,
    ),

    // Conversation 2: TechStart GmbH
    Message(
      id: 'msg-4',
      conversationId: 'conv-2',
      senderId: 'user-3',
      text:
          'Hallo! Wir haben Ihre Bewerbung als Full-Stack Entwickler erhalten. Ihr Profil sieht sehr interessant aus!',
      createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 5)),
      isRead: true,
    ),
    Message(
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'user-3',
      text:
          'Vielen Dank für Ihr Interesse! Wann wären Sie für ein Gespräch verfügbar?',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      isRead: true,
    ),
  ];

  static List<Conversation> getConversations(String userId) {
    return _conversations
        .where((c) => c.applicantId == userId || c.employerId == userId)
        .toList()
      ..sort((a, b) => b.lastMessageAt.compareTo(a.lastMessageAt));
  }

  static List<Message> getMessages(String conversationId) {
    return _messages
        .where((m) => m.conversationId == conversationId)
        .toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  static Message sendMessage(
      String conversationId, String senderId, String text) {
    final message = Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversationId,
      senderId: senderId,
      text: text,
      createdAt: DateTime.now(),
      isRead: false,
    );
    _messages.add(message);

    // Update conversation's last message
    final idx = _conversations.indexWhere((c) => c.id == conversationId);
    if (idx != -1) {
      _conversations[idx] = _conversations[idx].copyWith(
        lastMessage: text,
        lastMessageAt: DateTime.now(),
      );
    }

    return message;
  }

  static Conversation createConversation(
    String applicantId,
    String employerId,
    String jobId,
    String jobTitle,
  ) {
    // Check if conversation already exists for this job + applicant + employer
    final existing = _conversations.where(
      (c) =>
          c.applicantId == applicantId &&
          c.employerId == employerId &&
          c.jobId == jobId,
    );
    if (existing.isNotEmpty) return existing.first;

    final conversation = Conversation(
      id: 'conv-${DateTime.now().millisecondsSinceEpoch}',
      applicantId: applicantId,
      employerId: employerId,
      jobId: jobId,
      jobTitle: jobTitle,
      createdAt: DateTime.now(),
      lastMessage: '',
      lastMessageAt: DateTime.now(),
    );
    _conversations.add(conversation);
    return conversation;
  }

  /// Find the employer name from mock profiles for a given userId
  static String getEmployerName(String employerId) {
    // Map known employer user IDs to names
    const names = {
      'user-2': 'Deutsche Pflegedienst GmbH',
      'user-3': 'TechStart GmbH',
      'user-14': 'Klinikum Stuttgart',
      'user-15': 'SpedEx Logistik AG',
      'user-16': 'Sprachschule Deutsch+',
    };
    return names[employerId] ?? 'Unbekannt';
  }
}
