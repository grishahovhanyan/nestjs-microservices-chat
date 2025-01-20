const host = 'http://0.0.0.0'
const authApiUrl = `${host}:3000/api/v1`
const conversationsApiUrl = `${host}:3001/api/v1`
const participantsApiUrl = `${host}:3002/api/v1`
const messagesApiUrl = `${host}:3003/api/v1`

let socket

document.getElementById('logout-button').addEventListener('click', function(e) {
  // Hide signin page and show chat UI
  document.getElementById('signin-page').style.display = 'flex'
  document.getElementById('chat-app').style.display = 'none'

  localStorage.removeItem('accessToken')

  socket.disconnect()
})

const bearerToken = localStorage.getItem('accessToken')
if (bearerToken) {
  console.log('Access token was taken from localStorage')
  // Hide signin page and show chat UI
  document.getElementById('signin-page').style.display = 'none'
  document.getElementById('chat-app').style.display = 'block'

  const authHeader = { Authorization: `Bearer ${bearerToken}` }
  renderChatUi(bearerToken, authHeader)
} else {
  console.log('Access token was not found in localStorage')
  // Handle signin form submission
  document.getElementById('signin-form').addEventListener('submit', function(e) {
    e.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    fetch(`${authApiUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          // Show error message
          document.getElementById('signin-error').style.display = 'block'
        } else {
          // Hide signin page and show chat UI
          document.getElementById('signin-page').style.display = 'none'
          document.getElementById('chat-app').style.display = 'block'

          const bearerToken = data.accessToken
          const authHeader = { Authorization: `Bearer ${bearerToken}` }

          // Save the access token to localStorage
          localStorage.setItem('accessToken', bearerToken)

          renderChatUi(bearerToken, authHeader)
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        document.getElementById('signin-error').style.display = 'block'
      })
  })
}

async function renderChatUi(bearerToken, authHeader) {
  let selectedConversationId = null
  let currentUserId = null
  let currentParticipantId = null

  await fetchCurrentUser() // Fetch current user details
  await fetchConversations() // Fetch conversations

  // Fetch the current user details
  async function fetchCurrentUser() {
    try {
      const response = await fetch(`${authApiUrl}/users/me`, {
        headers: { ...authHeader }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch current user details')
      }

      const user = await response.json()

      // Store the current user ID globally
      currentUserId = user.id

      // Render the user's name somewhere on the page
      const userNameElement = document.getElementById('user-name')
      if (userNameElement) {
        userNameElement.textContent = user.fullName || 'Unknown User'
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  // Function to delete a conversation
  async function deleteConversation(conversationId, conversationDiv) {
    try {
      const response = await fetch(`${conversationsApiUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { ...authHeader }
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      // Remove the conversation from the DOM if delete is successful
      conversationDiv.remove()
      alert('Conversation deleted successfully')

      if (conversationId === selectedConversationId) {
        const chatMessages = document.querySelector('.chat-messages')
        chatMessages.innerHTML = ''
        selectedConversationId = null
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      alert('Failed to delete conversation')
    }
  }

  // Function to render a conversation
  async function renderConversation(conversation, conversationList) {
    const conversationDiv = document.createElement('div')
    conversationDiv.classList.add('conversation')
    conversationDiv.textContent = conversation.name // Assume 'name' is a property of each conversation
    conversationDiv.dataset.id = conversation.id // Store conversation ID for future use

    // Create delete button
    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete'
    deleteButton.classList.add('delete-button') // Add a class for styling if needed

    // Add click event listener to delete the conversation
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation() // Prevent triggering the conversation click event

      const confirmed = confirm('Are you sure you want to delete this conversation?')
      if (!confirmed) return

      // Call the deleteConversation function
      await deleteConversation(conversation.id, conversationDiv)
    })

    // Append the delete button to the conversation div
    conversationDiv.appendChild(deleteButton)

    // Add click event listener for highlighting
    conversationDiv.addEventListener('click', () => {
      document.querySelector('.conversation.active')?.classList.remove('active')
      conversationDiv.classList.add('active')
      document.querySelector('.chat-header').textContent = conversation.name

      // Fetch and display chat messages for the selected conversation
      selectedConversationId = conversation.id // Set the selected conversation ID
      fetchChatMessages(conversation.id)

      // Fetch and set the current participant ID
      fetchParticipants(conversation.id)
    })

    conversationList.appendChild(conversationDiv)

    return conversationDiv
  }

  // Fetch all conversations
  async function fetchConversations() {
    try {
      const response = await fetch(`${conversationsApiUrl}/conversations`, {
        headers: { ...authHeader }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const { items: conversations } = await response.json()

      // Select the conversation list container
      const conversationList = document.querySelector('.conversation-list')
      conversationList.innerHTML = '' // Clear existing content

      // Render each conversation
      conversations.forEach((conversation) => {
        renderConversation(conversation, conversationList)
      })
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  // Fetch participants for a specific conversation and set the currentParticipantId
  async function fetchParticipants(conversationId) {
    try {
      const response = await fetch(`${participantsApiUrl}/conversations/${conversationId}/participants`, {
        headers: { ...authHeader }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch participants')
      }

      const { items: participants } = await response.json()

      // Find the current user in the participants array
      const currentParticipant = participants.find((participant) => participant.userId === currentUserId)

      if (currentParticipant) {
        currentParticipantId = currentParticipant.id // Set the currentParticipantId
      } else {
        console.error('Current user not found in the participants list')
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  // Fetch chat messages for a specific conversation
  async function fetchChatMessages(conversationId) {
    try {
      const response = await fetch(`${messagesApiUrl}/conversations/${conversationId}/messages`, {
        headers: {
          ...authHeader
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch chat messages')
      }

      const { items: messages } = await response.json()

      // Select the chat messages container
      const chatMessages = document.querySelector('.chat-messages')
      chatMessages.innerHTML = '' // Clear existing messages

      // Render each message
      messages.forEach((message) => {
        const messageDiv = document.createElement('div')
        messageDiv.classList.add(
          'message',
          message.participantId === currentParticipantId ? 'current-user' : 'user'
        )
        messageDiv.textContent = message.body // Assume 'body' is the message content
        chatMessages.appendChild(messageDiv)
      })
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    }
  }

  // Create and send a new message
  async function createMessage(conversationId, messageContent) {
    try {
      const response = await fetch(`${messagesApiUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: messageContent })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const newMessage = await response.json() // Assuming the response includes the new message

      // Render the new message in the chat
      const chatMessages = document.querySelector('.chat-messages')
      const messageDiv = document.createElement('div')
      messageDiv.classList.add(
        'message',
        newMessage.participantId === currentParticipantId ? 'current-user' : 'user'
      )
      messageDiv.textContent = newMessage.body // Assuming 'body' is the message content
      chatMessages.appendChild(messageDiv)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  socket = io('127.0.0.1:3000/chat', {
    auth: { token: `Bearer ${bearerToken}` }
  })

  socket.on('conversation created', (data) => console.log(data, '<conversation created'))
  socket.on('conversation updated', (data) => console.log(data, '<conversation updated'))
  socket.on('conversation deleted', (data) => console.log(data, '<conversation deleted'))

  socket.on('participant created', (data) => console.log(data, '<participant created'))
  socket.on('participant updated', (data) => console.log(data, '<participant updated'))
  socket.on('participant deleted', (data) => console.log(data, '<participant deleted'))

  socket.on('message created', (data) => console.log(data, '<message created'))
  socket.on('message updated', (data) => console.log(data, '<message updated'))
  socket.on('message deleted', (data) => console.log(data, '<message deleted'))

  // Send message button click handler
  document.getElementById('send-button').onclick = async () => {
    const messageInput = document.getElementById('message-input')
    const message = messageInput.value.trim()

    if (message && selectedConversationId) {
      // Call createMessage function to send the message
      await createMessage(selectedConversationId, message)

      // Clear the input field after sending the message
      messageInput.value = ''
    }
  }

  // Enable sending message by pressing "Enter" key
  document.getElementById('message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault() // Prevent default behavior (e.g., new line)
      document.getElementById('send-button').click() // Trigger click event on the "SEND" button
    }
  })

  // Fetch users list from /users API and populate the modal with checkboxes
  async function fetchUsers() {
    try {
      const response = await fetch(`${authApiUrl}/users`, {
        method: 'GET',
        headers: { ...authHeader }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const { items: users } = await response.json()
      const usersListDiv = document.getElementById('users-list')

      // Clear previous list
      usersListDiv.innerHTML = ''

      // Add a checkbox for each user
      users.forEach((user) => {
        const userItem = document.createElement('div')
        userItem.classList.add('checkbox-container')
        userItem.innerHTML = `
    <input type="checkbox" id="user-${user.id}" value="${user.id}">
      <label for="user-${user.id}">${user.fullName}</label>
      `
        usersListDiv.appendChild(userItem)
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Event listener to open the create conversation modal
  document.getElementById('create-conversation-button').addEventListener('click', () => {
    document.getElementById('create-conversation-modal').style.display = 'flex'
    fetchUsers() // Fetch users when modal opens
  })

  // Event listener to close the modal
  document.getElementById('modal-close-button').addEventListener('click', () => {
    document.getElementById('create-conversation-modal').style.display = 'none'
  })

  // Event listener to create the conversation when button is clicked
  document.getElementById('modal-create-button').addEventListener('click', async () => {
    // Get selected users
    const selectedUsers = Array.from(document.querySelectorAll('#users-list input[type="checkbox"]:checked')).map(
      (checkbox) => checkbox.value
    )

    if (selectedUsers.length === 0) {
      alert('Please select at least one user')
      return
    }

    try {
      const response = await fetch(`${conversationsApiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          name: `Conversation [${[currentUserId, ...selectedUsers]}]`,
          userIds: selectedUsers
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      document.getElementById('create-conversation-modal').style.display = 'none' // Close the modal

      const conversationList = document.querySelector('.conversation-list')

      const conversation = await response.json()
      renderConversation(conversation, conversationList)
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  })
}