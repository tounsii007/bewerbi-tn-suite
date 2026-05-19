import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/services/chat_service.dart';

void main() {
  group('ChatService', () {
    test('getConversations returns conversations for applicant user-1', () {
      final convos = ChatService.getConversations('user-1');
      expect(convos, isNotEmpty);
      for (final c in convos) {
        expect(
          c.applicantId == 'user-1' || c.employerId == 'user-1',
          true,
        );
      }
    });

    test('getConversations returns conversations for employer user-2', () {
      final convos = ChatService.getConversations('user-2');
      expect(convos, isNotEmpty);
      for (final c in convos) {
        expect(
          c.applicantId == 'user-2' || c.employerId == 'user-2',
          true,
        );
      }
    });

    test('getConversations are sorted by lastMessageAt descending', () {
      final convos = ChatService.getConversations('user-1');
      for (int i = 0; i < convos.length - 1; i++) {
        expect(
          convos[i].lastMessageAt.isAfter(convos[i + 1].lastMessageAt) ||
              convos[i].lastMessageAt == convos[i + 1].lastMessageAt,
          true,
        );
      }
    });

    test('getConversations returns empty for unknown user', () {
      final convos = ChatService.getConversations('unknown-user');
      expect(convos, isEmpty);
    });

    test('getMessages returns messages for conv-1', () {
      final messages = ChatService.getMessages('conv-1');
      expect(messages, isNotEmpty);
      for (final m in messages) {
        expect(m.conversationId, 'conv-1');
      }
    });

    test('getMessages returns messages sorted by createdAt ascending', () {
      final messages = ChatService.getMessages('conv-1');
      for (int i = 0; i < messages.length - 1; i++) {
        expect(
          messages[i].createdAt.isBefore(messages[i + 1].createdAt) ||
              messages[i].createdAt == messages[i + 1].createdAt,
          true,
        );
      }
    });

    test('getMessages returns empty for unknown conversation', () {
      final messages = ChatService.getMessages('nonexistent-conv');
      expect(messages, isEmpty);
    });

    test('sendMessage adds new message to conversation', () {
      final beforeCount = ChatService.getMessages('conv-1').length;
      final sent = ChatService.sendMessage(
        'conv-1',
        'user-1',
        'Test message from unit test',
      );
      final afterCount = ChatService.getMessages('conv-1').length;

      expect(afterCount, equals(beforeCount + 1));
      expect(sent.conversationId, 'conv-1');
      expect(sent.senderId, 'user-1');
      expect(sent.text, 'Test message from unit test');
      expect(sent.isRead, false);
    });

    test('sendMessage updates conversation lastMessage and lastMessageAt', () {
      ChatService.sendMessage(
        'conv-2',
        'user-1',
        'Updated last message text',
      );
      final convos = ChatService.getConversations('user-1');
      final conv2 = convos.firstWhere((c) => c.id == 'conv-2');
      expect(conv2.lastMessage, 'Updated last message text');
    });

    test('createConversation creates new conversation', () {
      final conv = ChatService.createConversation(
        'user-5',
        'user-3',
        'job-9',
        'Data Engineer Test',
      );
      expect(conv.applicantId, 'user-5');
      expect(conv.employerId, 'user-3');
      expect(conv.jobId, 'job-9');
      expect(conv.jobTitle, 'Data Engineer Test');
      expect(conv.lastMessage, '');
    });

    test('createConversation returns existing if duplicate', () {
      final conv1 = ChatService.createConversation(
        'user-7',
        'user-2',
        'job-2',
        'Pflege Duplikat Test',
      );
      final conv2 = ChatService.createConversation(
        'user-7',
        'user-2',
        'job-2',
        'Pflege Duplikat Test',
      );
      expect(conv1.id, equals(conv2.id));
    });

    test('getEmployerName returns correct names', () {
      expect(ChatService.getEmployerName('user-2'),
          'Deutsche Pflegedienst GmbH');
      expect(ChatService.getEmployerName('user-3'), 'TechStart GmbH');
      expect(ChatService.getEmployerName('user-14'), 'Klinikum Stuttgart');
      expect(ChatService.getEmployerName('user-15'), 'SpedEx Logistik AG');
      expect(
          ChatService.getEmployerName('user-16'), 'Sprachschule Deutsch+');
    });

    test('getEmployerName returns Unbekannt for unknown ID', () {
      expect(ChatService.getEmployerName('unknown'), 'Unbekannt');
    });

    test('Conversation copyWith works correctly', () {
      final conv = ChatService.getConversations('user-1').first;
      final updated = conv.copyWith(
        lastMessage: 'new message',
        unreadCount: 5,
      );
      expect(updated.lastMessage, 'new message');
      expect(updated.unreadCount, 5);
      expect(updated.id, conv.id);
      expect(updated.applicantId, conv.applicantId);
    });

    test('Message copyWith works correctly', () {
      final messages = ChatService.getMessages('conv-1');
      final msg = messages.first;
      final updated = msg.copyWith(isRead: true, text: 'modified');
      expect(updated.isRead, true);
      expect(updated.text, 'modified');
      expect(updated.id, msg.id);
      expect(updated.senderId, msg.senderId);
    });

    test('sent message has a unique ID', () {
      final msg1 = ChatService.sendMessage('conv-1', 'user-1', 'msg A');
      final msg2 = ChatService.sendMessage('conv-1', 'user-1', 'msg B');
      expect(msg1.id, isNot(equals(msg2.id)));
    });
  });
}
