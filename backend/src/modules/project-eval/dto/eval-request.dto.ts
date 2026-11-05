import { IsNotEmpty, IsUrl } from 'class-validator';

export class EvalRequestDto {
  @IsUrl()
  @IsNotEmpty()
  repoUrl!: string;
}
