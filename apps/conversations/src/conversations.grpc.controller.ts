import { Controller } from '@nestjs/common'
import { ConversationsGrpcServiceControllerMethods, FindOneConversationDto } from '@app/microservices'
import { ConversationsService } from './conversations.service'

/*
####### NOTE #######
The `ConversationsGrpcServiceControllerMethods` decorator automatically applies the `GrpcMethod` decorator to all methods in this class.
*/

@Controller()
@ConversationsGrpcServiceControllerMethods()
export class ConversationsGrpcController {
  constructor(private readonly conversationsService: ConversationsService) {}

  async findOneConversation(findOneConversationDto: FindOneConversationDto) {
    const { conversationId, userId } = findOneConversationDto

    return (await this.conversationsService.getByConvIdAndUserId(conversationId, userId)) ?? {}
  }
}
