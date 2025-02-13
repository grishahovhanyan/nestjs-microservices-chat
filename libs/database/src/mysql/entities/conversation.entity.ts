import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { DbTables } from '../db.enum'
import { Message } from './message.entity'
import { Participant } from './participant.entity'
import { User } from './user.entity'

@Entity(DbTables.conversations)
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  creatorId: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false, default: true })
  isGroup: boolean

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User

  @OneToMany(() => Participant, (participant) => participant.conversation)
  participants: Participant[]

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]
}
