import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { Exclude } from 'class-transformer'
import { DbTables } from '../db.enum'

import { PasswordTransformer, UserStatuses } from '@app/common'

@Entity(DbTables.users)
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  fullName: string

  @Column({ nullable: false })
  email: string

  @Exclude()
  @Column({
    transformer: new PasswordTransformer(),
    nullable: false
  })
  password: string

  @Column({ type: 'enum', enum: UserStatuses, default: UserStatuses.offline })
  status: UserStatuses

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  signedUpAt: Date

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  offlineAt: Date
}
