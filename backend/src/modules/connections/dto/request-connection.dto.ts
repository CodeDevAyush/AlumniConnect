import { IsUUID } from 'class-validator';

export class RequestConnectionDto {
  @IsUUID()
  receiverId!: string;
}
