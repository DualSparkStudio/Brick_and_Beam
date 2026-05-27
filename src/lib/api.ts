// API functions using Netlify functions
export const api = {
  // Room Management
  async getAllRooms() {
    try {
      
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAllRooms'
        })
      })


      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to get rooms')
      }

      return result.rooms || []
    } catch (error) {
      throw error
    }
  },

  async createRoom(roomData: any) {
    try {
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createRoom',
          roomData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create room')
      }

      return result.room
    } catch (error) {
      throw error
    }
  },

  async updateRoom(id: number, updates: any) {
    try {
      
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRoom',
          roomId: id,
          roomData: updates
        })
      })

      
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update room')
      }

      return result.room
    } catch (error) {
      throw error
    }
  },

  async deleteRoom(id: number) {
    try {
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteRoom',
          roomId: id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete room')
      }

      return result
    } catch (error) {
      throw error
    }
  },

  // Room Images (placeholder - implement if needed)
  async getRoomImages(room_id: number) {
    // For now, return empty array
    // This can be implemented later if needed
    return []
  },

  async addRoomImages(room_id: number, images: any[]) {
    // For now, return empty array
    // This can be implemented later if needed
    return []
  },

  async deleteRoomImage(id: number) {
    // For now, return success
    // This can be implemented later if needed
    return
  },

  // Contact Form
  async submitContactForm(contactData: any) {
    try {
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submitContactForm',
          contactData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit contact form')
      }

      return result
    } catch (error) {
      throw error
    }
  },

  // Admin Email Management
  async getAdminEmail() {
    try {
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAdminEmail'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get admin email')
      }

      return result.adminEmail
    } catch (error) {
      throw error
    }
  },

  async updateAdminEmail(email: string) {
    try {
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateAdminEmail',
          email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update admin email')
      }

      return result
    } catch (error) {
      throw error
    }
  },

  // Get admin contact info for website display
  async getAdminContactInfo() {
    try {
      const response = await fetch('/.netlify/functions/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAdminContactInfo'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get admin contact info')
      }

      return result.contactInfo
    } catch (error) {
      throw error
    }
  },

  // Test contact form configuration
  async testContactForm() {
    try {
      const response = await fetch('/.netlify/functions/test-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test contact form')
      }

      return result
    } catch (error) {
      throw error
    }
  },

  // Test environment variables
  async testEnvironment() {
    try {
      const response = await fetch('/.netlify/functions/test-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test environment')
      }

      return result
    } catch (error) {
      throw error
    }
  }
} 
