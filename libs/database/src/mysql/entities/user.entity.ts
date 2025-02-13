import { Exclude } from 'class-transformer'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { PasswordTransformer, UserStatuses } from '@app/common'

import { DbTables } from '../db.enum'

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
