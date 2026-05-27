import type { Booking, Room } from './supabase'
import { api } from './supabase'

export interface EmailNotificationResult {
  success: boolean
  customerEmailId?: string
  adminEmailId?: string
  message?: string
  error?: string
}

export class EmailService {
  private static async getAdminEmail(): Promise<string> {
    try {
      const adminInfo = await api.getAdminInfo()
      return adminInfo.email
    } catch (error) {
      return process.env.ADMIN_EMAIL || ''
    }
  }

  private static async getAdminPhone(): Promise<string> {
    try {
      const adminInfo = await api.getAdminInfo()
      return adminInfo.phone || ''
    } catch (error) {
      return ''
    }
  }

  private static async sendNotification(
    booking: Booking,
    room: Room,
    adminEmail?: string,
    notificationType: 'confirmation' | 'update' | 'cancellation' = 'confirmation'
  ): Promise<EmailNotificationResult> {
    try {
      
      // Get admin email and phone if not provided
      const adminEmailToUse = adminEmail || await this.getAdminEmail()
      const adminPhone = await this.getAdminPhone()
      
      // Get SMTP configuration (sender email will be the SMTP username)
      const smtpConfig = await api.getSmtpConfig()
      const senderEmail = smtpConfig.mail_username || 'yashkaranjule15@gmail.com'
      
      const response = await fetch('/.netlify/functions/send-booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking,
          room,
          adminEmail: adminEmailToUse,
          adminPhone,
          senderEmail,
          smtpConfig,
          notificationType,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Email sending failed:', result)
        const errorMessage = result.error || 'Failed to send email notifications'
        const errorDetails = result.details ? `\n\nDetails: ${result.details}` : ''
        const errorHint = result.hint ? `\n\nHint: ${result.hint}` : ''
        throw new Error(errorMessage + errorDetails + errorHint)
      }

      return {
        success: true,
        customerEmailId: result.guestEmailId,
        adminEmailId: result.adminEmailId,
        message: result.message,
      }
    } catch (error) {
      console.error('❌ Error in EmailService:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Send booking confirmation emails to both customer and admin
   */
  static async sendBookingConfirmation(
    booking: Booking,
    room: Room,
    adminEmail?: string
  ): Promise<EmailNotificationResult> {
    return this.sendNotification(booking, room, adminEmail, 'confirmation')
  }

  /**
   * Send booking update notification
   */
  static async sendBookingUpdate(
    booking: Booking,
    room: Room,
    adminEmail?: string
  ): Promise<EmailNotificationResult> {
    return this.sendNotification(booking, room, adminEmail, 'update')
  }

  /**
   * Send booking cancellation notification
   */
  static async sendBookingCancellation(
    booking: Booking,
    room: Room,
    adminEmail?: string
  ): Promise<EmailNotificationResult> {
    return this.sendNotification(booking, room, adminEmail, 'cancellation')
  }
} 
