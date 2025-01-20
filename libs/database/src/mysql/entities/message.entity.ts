import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { DbTables } from '../db.enum'

import { Conversation } from './conversation.entity'
import { Participant } from './participant.entity'

@Entity(DbTables.messages)
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  participantId: number

  @Column({ nullable: false })
  conversationId: number

  @Column({ nullable: true })
  body: string

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date

  @ManyToOne(() => Participant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participantId' })
  participant: Participant

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation
}
