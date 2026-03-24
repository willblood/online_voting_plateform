import { IsEnum } from 'class-validator';

enum ElectionStatus {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  CLOS = 'CLOS',
  PUBLIE = 'PUBLIE',
}

export class AdvanceStatusDto {
  @IsEnum(ElectionStatus)
  status: ElectionStatus;
}
