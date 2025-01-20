import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTables1736316991884 implements MigrationInterface {
  name = 'CreateTables1736316991884'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fullName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`status\` enum ('online', 'offline') NOT NULL DEFAULT 'offline', \`signedUpAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`offlineAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`participantId\` int NOT NULL, \`conversationId\` int NOT NULL, \`body\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`conversations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`creatorId\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`isGroup\` tinyint NOT NULL DEFAULT 1, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`participants\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`conversationId\` int NOT NULL, \`isAdmin\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_55122e53b48f16426a89e616f4f\` FOREIGN KEY (\`participantId\`) REFERENCES \`participants\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_e5663ce0c730b2de83445e2fd19\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_c6dbb33e45a0acdbf3c33051f74\` FOREIGN KEY (\`creatorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`participants\` ADD CONSTRAINT \`FK_5fc9cddc801b973cd9edcdda42a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`participants\` ADD CONSTRAINT \`FK_6b54f24a585e94ef3fc7aa7ef5d\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`participants\` DROP FOREIGN KEY \`FK_6b54f24a585e94ef3fc7aa7ef5d\``)
    await queryRunner.query(`ALTER TABLE \`participants\` DROP FOREIGN KEY \`FK_5fc9cddc801b973cd9edcdda42a\``)
    await queryRunner.query(`ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_c6dbb33e45a0acdbf3c33051f74\``)
    await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_e5663ce0c730b2de83445e2fd19\``)
    await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_55122e53b48f16426a89e616f4f\``)
    await queryRunner.query(`DROP TABLE \`participants\``)
    await queryRunner.query(`DROP TABLE \`conversations\``)
    await queryRunner.query(`DROP TABLE \`messages\``)
    await queryRunner.query(`DROP TABLE \`users\``)
  }
}
