import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import * as admin from 'firebase-admin';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    if (admin.apps.length === 0) {
      // For local testing, we skip actual initialization if service account is missing
      // In production, GOOGLE_APPLICATION_CREDENTIALS should be set
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      } catch (e) {
        console.warn('Firebase Admin failed to initialize. Push notifications will be stubbed.');
      }
    }
  }

  async registerToken(userId: string, token: string) {
    return this.userRepository.update(userId, { fcm_token: token });
  }

  async create(userId: string, title: string, message: string, type: NotificationType = NotificationType.SYSTEM, actionUrl?: string) {
    const notification = new Notification();
    notification.user_id = userId;
    notification.title = title;
    notification.message = message;
    notification.type = type;
    notification.action_url = actionUrl || null;
    const saved = await this.notificationRepository.save(notification);

    // Try to send Push Notification
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user?.fcm_token) {
        await admin.messaging().send({
          token: user.fcm_token,
          notification: {
            title,
            body: message,
          },
          data: {
            type,
            actionUrl: actionUrl || '',
          }
        });
      }
    } catch (e) {
      console.error('Failed to send FCM push', e);
    }

    return saved;
  }

  async findAll(userId: string) {
    return this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationRepository.update({ id, user_id: userId }, { is_read: true });
  }

  async delete(id: string, userId: string) {
    return this.notificationRepository.delete({ id, user_id: userId });
  }

  async clearAll(userId: string) {
    return this.notificationRepository.delete({ user_id: userId });
  }
}
