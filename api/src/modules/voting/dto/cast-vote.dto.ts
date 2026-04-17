import { IsNotEmpty, IsUUID } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  @IsNotEmpty()
  candidate_id: string;
}
