import { User } from './user.entity'
import { Conversation } from './conversation.entity'
import { Participant } from './participant.entity'
import { Message } from './message.entity'

export const MYSQL_ENTITIES = [User, Conversation, Participant, Message]

export * from './conversation.entity'
export * from './message.entity'
export * from './participant.entity'
export * from './user.entity'
